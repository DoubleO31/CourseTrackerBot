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
    this.intervalID;
  }

  getUserID() {
    return this.userID;
  }

  stopInterval() {
    clearInterval(this.intervalID);
  }

  updateURLs(url) {
    if (!_.includes(this.urls, url)) {
      this.urls.push(url);
    }
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

  tracking(channel, delay) {
    const self = this;
    this.intervalID = setInterval(async function () {
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
          self.notify(
            channel,
            self.userID,
            `Tracking for ${
              self.runningTime / 60
            } minutes, No Availability. ${JSON.stringify(courseJSON)}`
          );
        }
      } else {
        //TODO
        self.notify(channel, self.userID, diff);
      }
    }, delay * 1000);
  }

  notify(channel, userID, seat) {
    channel.send(`<@${userID}> ${JSON.stringify(seat)}`);
  }
}

module.exports = User;
