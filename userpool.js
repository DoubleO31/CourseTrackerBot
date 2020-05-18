const User = require("./user");

class UserPool {
  constructor() {
    this.userMap = new Map();
  }

  async addNew(channel, userID, url) {
    if (this.userMap.has(userID)) {
      const user = this.userMap.get(userID);
      //user.stopInterval();
      user.updateURLs(url);
      const courseJSON = await user.checkValue();
      let courses = [];
      courseJSON.Classes.forEach((course) => {
        courses.push(course.Title);
      });
      this.trackingSetup(channel, user.getUserID(), courses);
      user.tracking(channel, 10);
    } else {
      let temp = [];
      temp.push(url);
      const user = new User(temp, userID);
      this.userMap.set(userID, user);
      const courseJSON = await user.checkValue();
      let courses = [];
      courseJSON.Classes.forEach((course) => {
        courses.push(course.Title);
      });
      this.trackingSetup(channel, user.getUserID(), courses);
      user.tracking(channel, 10);
    }

    //TODO
    //update();
  }

  trackingSetup(channel, userID, courses) {
    channel.send(`<@${userID}> Seats tracking for ${courses}`);
  }
}

module.exports = UserPool;
