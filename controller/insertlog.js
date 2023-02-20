require('dotenv').config();
const { query, response } = require('express');
var express = require('express');
const sql = require('msnodesqlv8');
const { gettanggal } = require('./get_tanggal');
const { getsaldoacct } = require('./inquiry_acct');
const { exect } = require('./executequery');

async function insertlog(jns_req, bpr_id, trx_code, trx_type, no_hp, no_rek, amount, trans_fee, tgl_trans, tgl_transmis, ket, rrn, gl_rek_db_1, gl_jns_db_1, gl_amount_db_1, gl_rek_cr_1, gl_jns_cr_1, gl_amount_cr_1, gl_rek_db_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2, gl_jns_cr_2, gl_amount_cr_2, response) {

    let querystring = "insert into log_api (" +
        "jns_req,                       bpr_id,                         trx_code," +
        "trx_type,                      no_hp,                          no_rek," +
        "amount,                        trans_fee,                      tgl_trans," +
        "tgl_transmis,                  ket,                            rrn," +
        "gl_rek_db_1,                   gl_jns_db_1,                    gl_amount_db_1," +
        "gl_rek_cr_1,                   gl_jns_cr_1,                    gl_amount_cr_1," +
        "gl_rek_db_2,                   gl_jns_db_2,                    gl_amount_db_2," +
        "gl_rek_cr_2,                   gl_jns_cr_2,                    gl_amount_cr_2, " +
        "response) VALUES('" +
        jns_req + "','" + bpr_id + "','" + trx_code + "','" +
        trx_type + "','" + no_hp + "','" + no_rek + "'," +
        amount + "," + trans_fee + ",'" + tgl_trans + "','" +
        tgl_transmis + "','" + ket + "','" + rrn + "','" +
        gl_rek_db_1 + "','" + gl_jns_db_1 + "'," + gl_amount_db_1 + ",'" +
        gl_rek_cr_1 + "','" + gl_jns_cr_1 + "'," + gl_amount_cr_1 + ",'" +
        gl_rek_db_2 + "','" + gl_jns_db_2 + "'," + gl_amount_db_2 + ",'" +
        gl_rek_cr_2 + "','" + gl_jns_cr_2 + "'," + gl_amount_cr_2 + ",'" +
        response + "')"
    await exect(querystring);
}

module.exports = { insertlog }