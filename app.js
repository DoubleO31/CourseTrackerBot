const express = require("express");
const app = express();
const hostname = "127.0.0.1";
const port = process.env.PORT || 3000;
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const _ = require("lodash");
const config = require("config");
const Discord = require("./discord");
const UBC = config.get("UBC");
const discordConfig = config.get("Discord");
let discordClient;
let runningTime = 0;
let courseMap = new Map();
const delay = 10;

async function checkValue() {
  const JSON = {
    Classes: [],
  };
  await Promise.all(
    UBC.url.map(async (url) => {
      const dom = await JSDOM.fromURL(url);
      const courseTitle = dom.window.document.querySelector(
        UBC.courseTitleSelector
      ).textContent;
      const remainSeats = dom.window.document.querySelector(
        UBC.remainSeatsSelector
      ).textContent;
      const info = {
        Title: courseTitle,
        Seats: remainSeats,
      };
      JSON.Classes.push(info);
      courseMap.set(info.Title, info.Seats);
    })
  );

  return JSON;
}

async function initialize() {
  app.listen(port, hostname, () =>
    console.log(`Server running at http://${hostname}:${port}/`)
  );
  courseJSON = await checkValue();
  app.get("/", (req, res) => res.send(courseJSON));
  let courses = [];
  courseJSON.Classes.forEach((course) => {
    courses.push(course.Title);
  });
  discordClient = new Discord();
  discordClient.clientLogin();
  discordClient.trackingSetup(discordConfig.user, courses);
}

function tracking() {
  setInterval(async function () {
    let diff = [];
    const courseJSON = await checkValue();
    _.forEach(courseJSON.Classes, (course) => {
      if (!_.isEqual(courseMap.get(course.Title), course.Seats)) {
        courseMap.set(course.Title, course.Seats);
        diff.push(course);
      }
    });
    if (_.isEmpty(diff)) {
      runningTime += delay;
      if (runningTime % 60 === 0) {
        discordClient.notify(
          discordConfig.user,
          `Tracking for ${runningTime / 60} minutes, No Availability`
        );
      }
    } else {
      app.get("/", (req, res) => res.send(courseJSON));
      discordClient.notify(discordConfig.user, diff);
    }
  }, delay * 1000);
}

initialize();
tracking();

/* 
if (url.indexOf("http") !== 0) {
  //the url should start with http:// or https:// so jsdom treats it as a url
  url = "https://" + url;
} */
