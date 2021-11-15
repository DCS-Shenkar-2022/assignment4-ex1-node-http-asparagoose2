const members = require('../data/members.json');
const dates = require('../data/dates.json');
var data = {};

function setSelectedTime(id, time) {
    if(members.some(member => member.id === id)) {
        data[id] = {"date": dates[time]['date'], dateID: time};
    } else {
        throw new Error(`Member with id ${id} does not exist`);
    }
}

function getSelectedTime(id) {
    return data[id];
}

function getSelectedTimes() {
    return data;
}

function removeSelectedTime(id) {
    delete data[id];
}
module.exports = {setSelectedTime, getSelectedTime, getSelectedTimes, removeSelectedTime};