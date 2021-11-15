const { timeStamp } = require("console");
const pino = require("pino");
const pretty = require("pino-pretty");
const timeManager = require("./timeManager");
const http = require("http");

http
  .createServer((req, res) => {
    let body = [];
    req
      .on("data", (chunk) => {
        body.push(chunk);
      })
      .on("end", () => {
        body = Buffer.concat(body).toString();
        if(body) {
            body = JSON.parse(body);
        }
        console.log(`new ${req.method} request`);
        switch (req.method) {
          case "GET":
              if (req.url.split("/")[1]) {
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify(timeManager.getSelectedTime(req.url.split("/")[1])));
            } else {
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify(timeManager.getSelectedTimes()));
            }
            break;
          case "POST":
              if(timeManager.hasSelectedTime(body.id)) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({error: "id already exists", solution: "delete the old one using DELETE method or update it using PUT method"}));
              } else {
              try {
                timeManager.setSelectedTime(body.id, body.time);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify("updated value"));
              } catch (e) {
                res.writeHead(400, { "Content-Type": "application/json" });
                console.log(e.message);
                res.end(JSON.stringify({"error": "missing / wrong id or time", solution: 'check the id and time keys should be: id, time'}));
              }
            }
            break;
            case "PUT":
                if(!timeManager.hasSelectedTime(body.id)) {
                  res.writeHead(400, { "Content-Type": "application/json" });
                  res.end(JSON.stringify({error: "id does not exists!", solution: "create it first using POST method"}));
                } else {
                try {
                  timeManager.setSelectedTime(body.id, body.time);
                  res.writeHead(200, { "Content-Type": "application/json" });
                  res.end(JSON.stringify("updated value"));
                } catch (e) {
                  res.writeHead(400, { "Content-Type": "application/json" });
                  console.log(e.message);
                  res.end(JSON.stringify({"error": "missing / wrong id or time"}));
                }
              }
                break;
          case "DELETE":
            // do something
            break;

          default:
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.write("not here buddy");
            res.end();
            break;
        }
      });
  })
  .listen(3000);

const logger = pino(pino.destination("logs/index.log"));

// const logger = pino(pretty(), pino.destination('logs/index.log'));

// const logger = pino({
//     level: 'info',
//     timestamp: pino.stdTimeFunctions.isoTime,
//     base: undefined,
//     formatters: {
//         level (label, number) {
//         return label.toUpperCase()
//         },
//     }
// }.formatterspino.destination('logs/index.log'));

timeManager.setSelectedTime(379593480, 3, logger);
timeManager.setSelectedTime(237453612, 1, logger);
timeManager.setSelectedTime(279077447, 5, logger);

// console.log(timeManager.getSelectedTime(1));
console.log(timeManager.getSelectedTimes());

timeManager.removeSelectedTime(279077447);
timeManager.setSelectedTime(379593480, 2, logger);

logger.info(`Setting time for to `);

console.log(timeManager.getSelectedTimes());
