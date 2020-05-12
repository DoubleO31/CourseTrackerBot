const discord = require("discord.js");
const client = new discord.Client();
const config = require("config");
const discordConfig = config.get("Discord");
let NOTIFY_CHANNEL;

class Discord {
  constructor() {}

  clientLogin() {
    client.login(discordConfig.client);
    client.on("error", (error) => {
      console.log("Error: " + error);
    });
    client.on("ready", () => {
      NOTIFY_CHANNEL = client.channels.find(
        (val) => val.id === discordConfig.channel
      ); // Channel to send notification
    });
    client.once("ready", () => {
      NOTIFY_CHANNEL.send(`Course tracking bot is up and running`);
    });
  }

  //TODO
  trackingSetup(userID, courses) {
    client.on("ready", () => {
      NOTIFY_CHANNEL.send(`<@${userID}> Seats tracking for ${courses}`);
    });
  }

  notify(userID, seat) {
    NOTIFY_CHANNEL.send(`<@${userID}> ${JSON.stringify(seat)}`);
  }
}

module.exports = Discord;
