const { timeStamp } = require('console');
const pino = require('pino');
const pretty = require('pino-pretty');
const timeManager = require('./timeManager');

// const logger = pino(pino.destination('logs/index.log'));

// const logger = pino(pretty(), pino.destination('logs/index.log'));

const logger = pino({
    level: 'info',
    timestamp: pino.stdTimeFunctions.isoTime,
    base: undefined,
    formatters: {
        level (label, number) {
        return label.toUpperCase()
        },
    }   
},pino.destination('logs/index.log'));

timeManager.setSelectedTime(379593480, 3, logger);
timeManager.setSelectedTime(237453612, 1, logger);
timeManager.setSelectedTime(279077447, 5, logger);

// console.log(timeManager.getSelectedTime(1));
console.log(timeManager.getSelectedTimes());

timeManager.removeSelectedTime(279077447);
timeManager.setSelectedTime(379593480, 2, logger);

// logger.info(`Setting time for ${id} to ${time}`);


console.log(timeManager.getSelectedTimes());