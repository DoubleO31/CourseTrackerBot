const discord = require("discord.js");
const client = new discord.Client();
const config = require("config");
const discordConfig = config.get("Discord");
const validUrl = require("valid-url");
const UserPool = require("./userpool");

class Discord {
  constructor() {
    this.userPool = new UserPool();
    this.NOTIFY_CHANNEL;
  }

  clientLogin() {
    client.login(discordConfig.client);
    client.on("error", (error) => {
      console.log("Error: " + error);
    });
    client.on("ready", () => {
      this.NOTIFY_CHANNEL = client.channels.find(
        (val) => val.id === discordConfig.channel
      ); // Channel to send notification
    });
    client.once("ready", () => {
      this.NOTIFY_CHANNEL.send(`Course tracking bot is up and running`);
    });
    client.on("message", (msg) => {
      if (msg.content.startsWith("!add")) {
        const args = msg.content.slice("!add".length).split(" ");
        if (args.length != 2) {
          msg.reply("Please provide website only after !add");
        } else if (!validUrl.isUri(args[1])) {
          msg.reply("Please provide a valid url");
        } else {
          this.userPool.addNew(this.NOTIFY_CHANNEL, msg.author.id, args[1]);
        }
      }
    });
  }

  //TODO
  trackingSetup(userID, courses) {
    client.on("ready", () => {
      this.NOTIFY_CHANNEL.send(`<@${userID}> Seats tracking for ${courses}`);
    });
  }

  notify(userID, seat) {
    this.NOTIFY_CHANNEL.send(`<@${userID}> ${JSON.stringify(seat)}`);
  }
}

module.exports = Discord;
