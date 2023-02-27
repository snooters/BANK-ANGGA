require('dotenv').config();
var express = require('express');
var path = require('path');
var router = express.Router();
const Validator = require('fastest-validator');
const db = require("../connection/index");
const { pokppob } = require("../controller/ppob_pok");
const { feeppob } = require("../controller/ppob_fee");
const { getprint } = require('../controller/consoledata');
const { getsaldoacct } = require('../controller/inquiry_acct');
const { checkstatus } = require('../controller/checkstatus');
const { insertlog } = require('../controller/insertlog');
const { stsclose } = require('../controller/closeatm');
const { check_rev } = require('../controller/check_rev');

const v = new Validator();

const {
    rek_tidakada,
    rek_tutup,
    saldo_kurang,
    rek_blokir,
    USER_ID,
    KODE_TRN_PPOB,
    BATCH,
    KODE_TRN_BUKU,
    KODE_TRN_TRTUN,
    PPOB,
    Sign_In,
    Sign_Off,
    Inquiry_Balance,
    invelid_transaction,
    Successful,
    rek_notauth
} = process.env;

router.post('/', async (req, res) => {
    const schema = {
        no_hp: "string",
        bpr_id: "string",
        no_rek: "string",
        product_name: "string",
        trx_code: "string",
        trx_type: "string",
        amount: "number",
        trans_fee: "number",
        tgl_trans: "string",
        tgl_transmis: "string",
        rrn: "string"
    }

    const validate = v.validate(req.body, schema);

    if (validate.length) {
        return res
            .status(200)
            .json(validate);
    }
    let close_atm = await stsclose()
    if (close_atm !== "OPEN") {
        getprint("PPOB", "SERVER SEDANG CLOSING")
        return res.status(200).send({
            code: "089",
            status: "GAGAL",
            message: "SERVER SEDANG CLOSING"
        })
    }
    let { bpr_id, trx_code, trx_type, no_hp, no_rek, amount, trans_fee, tgl_trans, tgl_transmis, product_name, rrn, data } = req.body
    let { gl_rek_db_1, gl_jns_db_1, gl_amount_db_1, gl_rek_cr_1, gl_jns_cr_1, gl_amount_cr_1, gl_rek_db_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2, gl_jns_cr_2, gl_amount_cr_2 } = data

    const myArray = ["TRX", "REV"]
    await insertlog("REQ", bpr_id, trx_code, trx_type, no_hp, no_rek, amount, trans_fee, tgl_trans, tgl_transmis, product_name, rrn, gl_rek_db_1, gl_jns_db_1, gl_amount_db_1, gl_rek_cr_1, gl_jns_cr_1,
        gl_amount_cr_1, gl_rek_db_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2, gl_jns_cr_2, gl_amount_cr_2, "")

    // cek reversal
    if (trx_type == "REV") {
        let hasil = await check_rev(bpr_id, trx_code, trx_type, no_hp, no_rek, amount, trans_fee, tgl_trans, tgl_transmis, product_name, rrn, gl_rek_db_1, gl_jns_db_1, gl_amount_db_1, gl_rek_cr_1, gl_jns_cr_1,
            gl_amount_cr_1, gl_rek_db_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2, gl_jns_cr_2, gl_amount_cr_2, Successful)

        if (hasil !== "ADA") {
            getprint("REV PPOB", {
                code: invelid_transaction,
                status: "GAGAL",
                message: "GAGAL",
                rrn: rrn,
                data: {
                    no_rek: gl_rek_db_1,
                    amount: amount,
                    fee: trans_fee
                }
            });

            return res.status(200).send({
                code: invelid_transaction,
                status: "GAGAL",
                message: "Transaksi tidak ditemukan",
                rrn: rrn,
                data: null
            });
        }
    }

    const isNotInArray = !myArray.includes(trx_type);
    if (isNotInArray) {

        getprint("PPOB", "TRX_TYPE SALAH")
        await insertlog("RES", bpr_id, trx_code, trx_type, no_hp, no_rek, amount, trans_fee, tgl_trans, tgl_transmis, product_name, rrn, gl_rek_db_1, gl_jns_db_1, gl_amount_db_1, gl_rek_cr_1, gl_jns_cr_1,
            gl_amount_cr_1, gl_rek_db_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2, gl_jns_cr_2, gl_amount_cr_2, invelid_transaction)

        return res.status(200).send({
            code: invelid_transaction,
            status: "GAGAL",
            message: "TRX_TYPE SALAH",
            rrn: rrn,
            data: null
        });
    }

    if (trx_code == PPOB) {

        /* check status rekening debet */
        let valdr = await checkstatus(gl_rek_db_1, gl_jns_db_1, amount + trans_fee, rrn)
        if (valdr === undefined) {

        } else if (Object.keys(valdr).length !== 0) {
            await insertlog("RES", bpr_id, trx_code, trx_type, no_hp, no_rek, amount, trans_fee, tgl_trans, tgl_transmis, product_name, rrn, gl_rek_db_1, gl_jns_db_1, gl_amount_db_1, gl_rek_cr_1, gl_jns_cr_1,
                gl_amount_cr_1, gl_rek_db_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2, gl_jns_cr_2, gl_amount_cr_2, valdr.code)

            getprint("PPOB", valdr);

            return res.status(200).send(
                valdr
            )
        };

        /* check status rek kredit 1 */
        let valcr1 = await checkstatus(gl_rek_cr_1, gl_jns_cr_1, 0, rrn)
        if (valcr1 === undefined) {

        } else if (Object.keys(valcr1).length !== 0) {
            await insertlog("RES", bpr_id, trx_code, trx_type, no_hp, no_rek, amount, trans_fee, tgl_trans, tgl_transmis, product_name, rrn, gl_rek_db_1, gl_jns_db_1, gl_amount_db_1, gl_rek_cr_1, gl_jns_cr_1,
                gl_amount_cr_1, gl_rek_db_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2, gl_jns_cr_2, gl_amount_cr_2, valcr1.code)

            getprint("PPOB", valcr1);

            return res.status(200).send(
                valcr1
            )
        };

        /* check status rek kredit 2 */
        let valcr2 = await checkstatus(gl_rek_cr_2, gl_jns_cr_2, 0, rrn)
        if (valcr2 === undefined) {

        } else if (Object.keys(valcr2).length !== 0) {
            await insertlog("RES", bpr_id, trx_code, trx_type, no_hp, no_rek, amount, trans_fee, tgl_trans, tgl_transmis, product_name, rrn, gl_rek_db_1, gl_jns_db_1, gl_amount_db_1, gl_rek_cr_1, gl_jns_cr_1,
                gl_amount_cr_1, gl_rek_db_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2, gl_jns_cr_2, gl_amount_cr_2, valcr2.code)

            getprint("PPOB", valcr2);

            return res.status(200).send(
                valcr2
            )
        };

        /* A function that is called from another file. */
        nama_rekdr = await pokppob(gl_rek_db_1, gl_jns_db_1, gl_amount_db_1, gl_rek_cr_1, gl_jns_cr_1, gl_amount_cr_1, trx_type, rrn, product_name)

        if (trans_fee > 0) {
            await feeppob(gl_rek_db_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2, gl_jns_cr_2, gl_amount_cr_2, trx_type, rrn, product_name)
        }
        await insertlog("RES", bpr_id, trx_code, trx_type, no_hp, no_rek, amount, trans_fee, tgl_trans, tgl_transmis, product_name, rrn, gl_rek_db_1, gl_jns_db_1, gl_amount_db_1, gl_rek_cr_1, gl_jns_cr_1,
            gl_amount_cr_1, gl_rek_db_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2, gl_jns_cr_2, gl_amount_cr_2, Successful)


        getprint("PPOB", {
            code: Successful,
            status: "SUKSES",
            message: "SUKSES",
            rrn: rrn,
            data: {
                bpr_id: bpr_id,
                trx_code: trx_code,
                trx_type: trx_type,
                no_hp: no_hp,
                no_rek: no_rek,
                nama: nama_rekdr,
                amount: amount,
                trans_fee: trans_fee,
                tgl_trans: tgl_trans,
                tgl_transmis: tgl_transmis,
                noreff: tgl_trans.substr(0, 8) + rrn,
                status_rek: "AKTIF"
            }
        });

        return res.status(200).send(
            {
                code: Successful,
                status: "SUKSES",
                message: "SUKSES",
                rrn: rrn,
                data: {
                    bpr_id: bpr_id,
                    trx_code: trx_code,
                    trx_type: trx_type,
                    no_hp: no_hp,
                    no_rek: no_rek,
                    nama: nama_rekdr,
                    amount: amount,
                    trans_fee: trans_fee,
                    tgl_trans: tgl_trans,
                    tgl_transmis: tgl_transmis,
                    noreff: tgl_trans.substr(0, 8) + rrn,
                    status_rek: "AKTIF"
                }
            });

    } else {
        getprint("PPOB", "TRX_CODE SALAH")
        return res.status(200).send({
            code: invelid_transaction,
            status: "GAGAL",
            message: "Transaksi tidak ditemukan",
            rrn: rrn,
            data: null
        });
    }
});
module.exports = router;