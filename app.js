const express = require("express");
const app = express();
const hostname = "127.0.0.1";
const port = process.env.PORT || 3000;
const config = require("config");

const Discord = require("./discord");
const User = require("./user");
let discordClient;

function initialize() {
  app.listen(port, hostname, () =>
    console.log(`Server running at http://${hostname}:${port}/`)
  );
  discordClient = new Discord();
  discordClient.clientLogin();
}
exports.update = async (userID, url) => {
  const user = new User(url, userID);
  courseJSON = await user.checkValue();
  //TODO
  app.get("/", (req, res) => res.send(courseJSON));
  let courses = [];
  courseJSON.Classes.forEach((course) => {
    courses.push(course.Title);
  });
  discordClient.trackingSetup(user.getUserID(), courses);
  user.tracking(app, discordClient, 10);
};

initialize();
