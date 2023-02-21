require('dotenv').config();
const { query } = require('express');
var express = require('express');
const sql = require('msnodesqlv8');
const { exect } = require('./executequery');

async function stsclose() {
    querystr = "select * from close_atm"
    let hasil = await exect(querystr)

    if (Object.keys(hasil).length !== 0) {
        if (hasil.stsclose == "C") {
            return "CLOSED";
        } else {
            return "OPEN";
        }
    } else {
        return "OPEN";
    }
}
module.exports = { stsclose }