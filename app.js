const Discord = require("./discord");
let discordClient;

function initialize() {
  discordClient = new Discord();
  discordClient.clientLogin();
}

initialize();
