require('dotenv').config();
const { query } = require('express');
var express = require('express');
const sql = require('msnodesqlv8');
const { str,
    invelid_transaction,
    rek_tidakada } = process.env;
let hasil
async function gettanggal(){
    let query = "select RIGHT(tgl,4)+SUBSTRING(tgl,3,2)+LEFT(tgl,2)as tglsekarang from tanggal"
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
module.exports = {gettanggal}