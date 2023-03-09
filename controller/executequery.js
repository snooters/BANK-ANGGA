const sql = require('msnodesqlv8');
require('dotenv').config();
const { query } = require('express');
var express = require('express');
const { str } = process.env;

async function exect(query) {
    return new Promise((resolve, reject) => {
        sql.query(str, query, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }

        });
    });
}
module.exports = { exect };