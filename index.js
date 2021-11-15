const pino = require("pino");
const timeManager = require("./timeManager");
const http = require("http");
var fs = require('fs');
const logDirName = "logs";
const { EOL } = require('os');
const levelMapping = { 50: 'ERROR', 40: 'WARNING', 30: 'INFO', 20: 'DEBUG' };

if (!fs.existsSync(logDirName)){
    fs.mkdirSync(logDirName);
}

const logger = pino({
    level: 'info',
    prettyPrint: {},
    prettifier: (opts) => {
        return (inputData) => {
            const ts = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
            console.log(inputData);
            const line = `${ts} ${levelMapping[inputData.level]}: ${inputData.msg} ${EOL}`
            return line;
        }}
},pino.destination("logs/index.log"));

http
  .createServer((req, res) => {
    let body = [];
    req
      .on("data", (chunk) => {
        body.push(chunk);
      })
      .on("end", () => {
          if(req.url.split('/')[1] === "selectDates"){
          
        body = Buffer.concat(body).toString();
        if(body) {
            body = JSON.parse(body);
        }
        console.log(`new ${req.method} request`);
        switch (req.method) {
            case "GET":
                logger.info(`${req.method} request for ${req.url}`);
                if (req.url.split("/")[2]) {
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify(timeManager.getSelectedTime(req.url.split("/")[2])));
            } else {
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify(timeManager.getSelectedTimes()));
            }
            break;
          case "POST":
              if(timeManager.hasSelectedTime(body.id)) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({error: "id already exists", solution: "delete the old one using DELETE method or update it using PUT method"}));
                logger.error(`${req.method} request for ${req.url} failed with error: "id already exists"`);
              } else {
              try {
                timeManager.setSelectedTime(body.id, body.time);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify("updated value"));
                logger.info(`${req.method} request for ${req.url} new selection created`);
              } catch (e) {
                res.writeHead(400, { "Content-Type": "application/json" });
                console.log(e.message);
                res.end(JSON.stringify({"error": "missing / wrong id or time", solution: 'check the id and time keys should be: id, time'}));
                logger.error(`${req.method} request for ${req.url} failed with error: "missing / wrong id or time"`);
              }
            }
            break;
            case "PUT":
                if(!timeManager.hasSelectedTime(body.id)) {
                  res.writeHead(400, { "Content-Type": "application/json" });
                  res.end(JSON.stringify({error: "id does not exists!", solution: "create it first using POST method"}));
                  logger.error(`${req.method} request for ${req.url} failed with error: "id does not exists!"`);
                } else {
                try {
                  timeManager.setSelectedTime(body.id, body.time);
                  res.writeHead(200, { "Content-Type": "application/json" });
                  res.end(JSON.stringify("updated value"));
                  logger.info(`${req.method} request for ${req.url} selection updated`);
                } catch (e) {
                  res.writeHead(400, { "Content-Type": "application/json" });
                  console.log(e.message);
                  res.end(JSON.stringify({"error": "missing / wrong id or time"}));
                  logger.error(`${req.method} request for ${req.url} failed with error: "missing / wrong id or time"`);
                }
              }
                break;
          case "DELETE":
                if(req.url.split("/")[2] && timeManager.hasSelectedTime(req.url.split("/")[2])) {
                    timeManager.removeSelectedTime(req.url.split("/")[2]);
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify("deleted value"));
                    logger.info(`${req.method} request for ${req.url} selection deleted`);
                } else {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({error: "id does not exists!", solution: "Check your id and try again, id should be in url"}));
                    logger.error(`${req.method} request for ${req.url} failed with error: "id does not exists!"`);
                }
            break;

          default:
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.write("not here buddy");
            res.end();
            logger.info(`${req.method} request for ${req.url} not found`);
            break;
        }
        } else {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.write("not here buddy");
            res.end();
            logger.info(`${req.method} request for ${req.url} not found`);
        }
      });
  })
  .listen(3000);


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


console.log(timeManager.getSelectedTimes());
