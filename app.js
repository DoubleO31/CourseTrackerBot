const express = require("express");
const app = express();
const hostname = "127.0.0.1";
const port = process.env.PORT || 3000;
const config = require("config");
const users = config.Users;
const Discord = require("./discord");
const User = require("./user");
let discordClient;

function initialize() {
  app.listen(port, hostname, () =>
    console.log(`Server running at http://${hostname}:${port}/`)
  );
  discordClient = new Discord();
  discordClient.clientLogin();
  
  //TODO
  const user1 = new User(users["1"].url, users["1"].ID);
  const user2 = new User(users["2"].url, users["2"].ID);
  const temp = [];
  temp.push(user1);
  temp.push(user2);

  temp.forEach(async (user) => {
    courseJSON = await user.checkValue();
    app.get("/", (req, res) => res.send(courseJSON));
    let courses = [];
    courseJSON.Classes.forEach((course) => {
      courses.push(course.Title);
    });
    discordClient.trackingSetup(user.getUserID(), courses);
    user.tracking(app, discordClient, 10);
  });
}

initialize();

/* 
if (url.indexOf("http") !== 0) {
  //the url should start with http:// or https:// so jsdom treats it as a url
  url = "https://" + url;
} */
