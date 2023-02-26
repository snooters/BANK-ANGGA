require('dotenv').config();
const { query } = require('express');
var express = require('express');
const sql = require('msnodesqlv8');
const { str,
    invelid_transaction,
    rek_tidakada } = process.env;
let hasil

async function getnameacct(noacc, jns_id) {
    let query
    if (jns_id == "1") {
        query = `select * from tblgl where nosbb='${noacc}'`
    } else if (jns_id == "2") {
        query = `select * from m_tabunganc where noacc='${noacc}'`
    }
    return new Promise((resolve, reject) => {
        sql.query(str, query, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

async function getsaldoacct(noacc, jns_id) {
    let query
    if (jns_id == "1") {
        query = `select SUM(saldoakhir) as saldoakhir,namaaccount,stsrec from m_gl where nosbb ='${noacc}' group by namaaccount,stsrec`
    } else if (jns_id == "2") {
        query = `select noacc,fnama,saldoakhir ,
        saldoakhir - case 
        when saldoblok IS NULL  then 0  
        else saldoblok end  - (select minsaldo from setup_tabungan where kodeprd = m_tabunganc.kodeprd) as  saldoeff,
        stsrec,stsblok,
        (select sbbprinc from setup_tabungan where kodeprd = m_tabunganc.kodeprd) as sbbtab,
        trnke from m_tabunganc where noacc ='${noacc}'`
    }
    return new Promise((resolve, reject) => {
        sql.query(str, query, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });

};


module.exports = { getnameacct, getsaldoacct }