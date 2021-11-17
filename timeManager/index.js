const members = require('../data/members.json');
const dates = require('../data/dates.json');
let data = {};

function setSelectedTime(id, time) {
    if(members.some(member => member.id === id)) {
        data[id] = {"date": dates[time-1]['date'], dateID: time};
    } else {
        throw new Error(`Member with id ${id} does not exist`);
    }
}

// function that returns weather or not the member has selected a time
function hasSelectedTime(id) {
    return data[id] !== undefined;
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
module.exports = {setSelectedTime, getSelectedTime, getSelectedTimes, removeSelectedTime, hasSelectedTime};