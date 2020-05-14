const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const _ = require("lodash");
const config = require("config");
const UBC = config.get("UBC");

class User {
  constructor(urls, userID) {
    this.urls = urls;
    this.userID = userID;
    this.runningTime = 0;
    this.courseMap = new Map();
  }

  getUserID() {
    return this.userID;
  }

  async checkValue() {
    const JSON = {
      Classes: [],
    };
    await Promise.all(
      this.urls.map(async (url) => {
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
        this.courseMap.set(info.Title, info.Seats);
      })
    );

    return JSON;
  }

  tracking(app, discordClient, delay) {
    const self = this;
    setInterval(async function () {
      let diff = [];
      const courseJSON = await self.checkValue();
      _.forEach(courseJSON.Classes, (course) => {
        if (!_.isEqual(self.courseMap.get(course.Title), course.Seats)) {
          self.courseMap.set(course.Title, course.Seats);
          diff.push(course);
        }
      });
      if (_.isEmpty(diff)) {
        self.runningTime += delay;
        if (self.runningTime % 60 === 0) {
          discordClient.notify(
            self.userID,
            `Tracking for ${self.runningTime / 60} minutes, No Availability`
          );
        }
      } else {
        //TODO
        app.get("/", (req, res) => res.send(courseJSON));
        discordClient.notify(self.userID, diff);
      }
    }, delay * 1000);
  }
}

module.exports = User;
