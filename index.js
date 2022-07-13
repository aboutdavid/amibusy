const config = require("./config.js");

const client = require("discord-rich-presence")(config.clientId);
var request = require("sync-request");
var merge = require("@jacobmischka/ical-merger");
const ical = require("ical");
function getCalendars() {
  var i = 0;
  var data = [];
  var icals = config.calendars;
  while (i < icals.length) {
    data.push(request("GET", icals[i]).getBody("utf8"));
    i++;
  }
  return merge(data, {
    calname: "Merged Calendar",
    timezone: config.timezone,
    caldesc: "Multiple cals together for Discord",
  });
}
function main() {
  var cal = ical.parseICS(getCalendars());
  var i = 0;
  //console.dir(cal)
  var sortedcal = Object.values(cal)
    .sort(function (a, b) {
      return new Date(b.end) - new Date(a.end);
    })
    .filter((a) => a.type == "VEVENT");
  while (i < sortedcal.length) {
    var event = sortedcal[i];
    if (
      new Date() > new Date(event.start) &&
      new Date() < new Date(event.end)
    ) {
      client.updatePresence({
        state: "Busy",
        details: "Sorry, can't talk right now.",
        startTimestamp: Date.now(),
        endTimestamp: new Date(event.end),
        largeImageKey: "calendar",
        smallImageKey: "busy",
        instance: true,
        buttons: [
          {
            label: "Source Code",
            url: "https://github.com/aboutdavid/amibusy",
          },
        ],
      });
      return;
    }
    client.updatePresence({
      state: "Free",
      details: "Currently I'm free, so talk to me!",
      startTimestamp: Date.now(),
      endTimestamp: Date.now() + config.refreshInterval,
      largeImageKey: "calendar",
      smallImageKey: "free",
      instance: true,
    });
    i++;
  }
}
main();
setInterval(main, config.refreshInterval);
