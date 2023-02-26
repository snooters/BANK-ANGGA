require('dotenv').config();
const { query } = require('express');
var express = require('express');
const { exect } = require('./executequery');

async function check_rev(bpr_id, trx_code, trx_type, no_hp, no_rek, amount, trans_fee, tgl_trans, tgl_transmis, product_name, rrn, gl_rek_db_1, gl_jns_db_1, gl_amount_db_1, gl_rek_cr_1, gl_jns_cr_1,
    gl_amount_cr_1, gl_rek_db_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2, gl_jns_cr_2, gl_amount_cr_2) {

    let strquery = `select * from log_api where trx_code='${trx_code}' and trx_type='TRX' and no_rek='${no_rek}' and amount='${amount}' and trans_fee='${trans_fee}' and no_hp = '${no_hp}' and bpr_id='${bpr_id}' and rrn='${rrn}' and tgl_trans='${tgl_trans}' and jns_req='RES' and response='000'`
    let hasil = await exect(strquery)
    if (Object.keys(hasil).length !== 0) {
        return "ADA"
    } else {
        return "KOSONG";
    }

}
module.exports = { check_rev }