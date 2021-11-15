const pino = require("pino");
const pretty = require("pino-pretty");
const timeManager = require("./timeManager");
const Emitter = require("events");
const emmiter = new Emitter.EventEmitter();
const http = require("http");
var fs = require('fs');
const logDirName = "logs";
const { EOL } = require('os');
const levelMapping = { 50: 'ERROR', 40: 'WARNING', 30: 'INFO', 20: 'DEBUG' };
const PORT = 3000;

// if "logs" folder does not exist create one (pino cannot create folders)
if (!fs.existsSync(logDirName)){
    fs.mkdirSync(logDirName);
}

// setup pino logger
// const logger = pino({
//     level: 'info',
//     prettyPrint: {},
//     prettifier: (opts) => {
//         return (inputData) => {
//             const ts = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
//             const line = `${ts} ${levelMapping[inputData.level]}: ${inputData.msg} ${EOL}`
//             return line;
//         }}
// },pino.destination("logs/index.log"));
 
const logger = pino({
    transport: {
      target: 'pino-pretty',
      options: {
        levelKey: 'level',
        destination: "logs/index.log",
        colorize: false,
        translateTime: 'yyyy-mm-dd HH:MM:ss',
        ignore: 'pid,hostname',
      }
    },
  })

emmiter.on('error', (msg) => logger.error(msg));
emmiter.on('info', (msg) => logger.info(msg));


http
  .createServer((req, res) => {
    let body = [];
    // parsing the body of the http request
    req.on("data", (chunk) => {
        body.push(chunk);
      }).on("end", () => {
          if(req.url.split('/')[1] === "selectDates"){
          
        body = Buffer.concat(body).toString();
        if(body) {
            body = JSON.parse(body);
        }
        console.log(`new ${req.method} request`);
        switch (req.method) {
            case "GET":
                emmiter.emit('info', `${req.method} request for ${req.url}`);
                if (req.url.split("/")[2]) {
                    if(timeManager.hasSelectedTime(req.url.split("/")[2])) {
                        res.writeHead(200, { "Content-Type": "application/json" });
                        res.end(JSON.stringify(timeManager.getSelectedTime(req.url.split("/")[2])));
                        emmiter.emit('info', `${req.method} request for ${req.url}`);
                    } else {
                        res.writeHead(400, { "Content-Type": "application/json" });
                        res.end(JSON.stringify({error: "id does not exists!", solution: "Check your id and try again, id should be in url"}));
                        emmiter.emit('error',`${req.method} request for ${req.url} failed with error: "id does not exists!"`);
                    }
                } else {
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify(timeManager.getSelectedTimes()));
                }
            break;
            
          case "POST":
              if(timeManager.hasSelectedTime(body.id)) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({error: "id already exists", solution: "delete the old one using DELETE method or update it using PUT method"}));
                emmiter.emit('error',`${req.method} request for ${req.url} failed with error: "id already exists"`);
              } else {
              try {
                timeManager.setSelectedTime(body.id, body.time);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify("updated value"));
                emmiter.emit('info',`${req.method} request for ${req.url} new selection created`)
              } catch (e) {
                res.writeHead(400, { "Content-Type": "application/json" });
                console.log(e.message);
                res.end(JSON.stringify({"error": "missing / wrong id or time", solution: 'check the id and time keys should be: id, time'}));
                emmiter.emit('error',`${req.method} request for ${req.url} failed with error: "missing / wrong id or time"`);
              }
            }
            break;

            case "PUT":
                if(!timeManager.hasSelectedTime(body.id)) {
                  res.writeHead(400, { "Content-Type": "application/json" });
                  res.end(JSON.stringify({error: "id does not exists!", solution: "create it first using POST method"}));
                  emmiter.emit('error',`${req.method} request for ${req.url} failed with error: "id does not exists!"`);
                } else {
                try {
                  timeManager.setSelectedTime(body.id, body.time);
                  res.writeHead(200, { "Content-Type": "application/json" });
                  res.end(JSON.stringify("updated value"));
                  emmiter.emit('info',`${req.method} request for ${req.url} selection updated`);
                } catch (e) {
                  res.writeHead(400, { "Content-Type": "application/json" });
                  console.log(e.message);
                  res.end(JSON.stringify({"error": "missing / wrong id or time"}));
                emmiter.emit('error',`${req.method} request for ${req.url} failed with error: "missing / wrong id or time"`);
                }
              }
                break;

          case "DELETE":
                if(req.url.split("/")[2] && timeManager.hasSelectedTime(req.url.split("/")[2])) {
                    timeManager.removeSelectedTime(req.url.split("/")[2]);
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify("deleted value"));
                    emmiter.emit('info',`${req.method} request for ${req.url} selection deleted`);
                } else {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({error: "id does not exists!", solution: "Check your id and try again, id should be in url"}));
                    emmiter.emit('error',`${req.method} request for ${req.url} failed with error: "id does not exists!"`);
                }
            break;

          default:
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.write("Page not found!");
            res.end();
            emmiter.emit('info',`${req.method} request for ${req.url} not found`);
            break;
        }
        } else {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.write("Page not found!");
            res.end();
            emmiter.emit('info',`${req.method} request for ${req.url} not found`);
        }
      });
  })
  .listen(PORT);


// init of the data
timeManager.setSelectedTime(379593480, 3);
timeManager.setSelectedTime(237453612, 1);
timeManager.setSelectedTime(279077447, 5);

console.log(timeManager.getSelectedTimes());
