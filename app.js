const express = require("express");
const app = express();
const hostname = "127.0.0.1";
const port = process.env.PORT || 3000;
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const _ = require("lodash");
const config = require("config");
const UBC = config.get("UBC");
const discordConfig = config.get("Discord");
let discordClient;
let previousValue;
let runningTime = 0;

async function checkValue() {
  const dom = await JSDOM.fromURL(UBC.url);
  const courseTitle = dom.window.document.querySelector(UBC.courseTitleSelector)
    .textContent;
  const remainSeats = dom.window.document.querySelector(UBC.remainSeatsSelector)
    .textContent;
  const JSON = {
    Classes: [
      {
        Title: courseTitle,
        Seats: remainSeats,
      },
    ],
  };
  return JSON;
}

function initialize() {
  app.listen(port, hostname, () =>
    console.log(`Server running at http://${hostname}:${port}/`)
  );

  checkValue().then((newValue) => {
    previousValue = newValue;
    app.get("/", (req, res) => res.send(newValue));
    let courses = [];
    newValue.Classes.forEach((course) => {
      courses.push(course.Title);
    });
    discordClient = new Discord();
    discordClient.clientLogin();
    discordClient.trackingSetup(discordConfig.user, courses);
  });
}

function tracking() {
  setInterval(function () {
    checkValue().then((newValue) => {
      if (_.isEqual(previousValue, newValue)) {
        runningTime += 10;
        if (runningTime % 60 === 0) {
          discordClient.notify(
            discordConfig.user,
            `Tracking for ${runningTime / 60} minutes, No Availability`
          );
        }
      } else {
        previousValue = newValue;
        app.get("/", (req, res) => res.send(newValue));
        let seats = [];
        newValue.Classes.forEach((course) => {
          seats.push(course.Seats);
        });
        discordClient.notify(discordConfig.user, seats);
      }
    });
  }, 10000);
}

initialize();
tracking();

/* 
if (url.indexOf("http") !== 0) {
  //the url should start with http:// or https:// so jsdom treats it as a url
  url = "https://" + url;
} */
