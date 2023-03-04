require('dotenv').config();
var express = require('express');
var router = express.Router();
const Validator = require('fastest-validator');
const db = require("../connection/index");
const { getprint } = require('../controller/consoledata');
const { getsaldoacct } = require('../controller/inquiry_acct');
const { checkstatus } = require('../controller/checkstatus');
const { token_pok } = require('../controller/token_pok');
const { token_fee } = require('../controller/token_fee');
const { stsclose } = require('../controller/closeatm');
const { insertlog } = require('../controller/insertlog');
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
    PPOB,
    Sign_In,
    Sign_Off,
    Inquiry_Balance,
    invelid_transaction,
    Successful,
    rek_notauth,
    Req_Token_Tarik_Tunai,
    Release_Tarik_Tunai
} = process.env;

router.post('/', async (req, res) => {
    const schema = {
        no_hp: "string",
        bpr_id: "string",
        no_rek: "string",
        keterangan: "string",
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
        getprint("TARIK TUNAI", "SERVER SEDANG CLOSING")
        return res.status(200).send({
            code: "089",
            status: "GAGAL",
            message: "SERVER SEDANG CLOSING"
        })
    }
    let { bpr_id, trx_code, trx_type, no_hp, no_rek, amount, trans_fee, tgl_trans, tgl_transmis, keterangan, acq_id, rrn, data } = req.body;
    let { gl_rek_db_1, gl_jns_db_1, gl_amount_db_1, gl_rek_cr_1, gl_jns_cr_1, gl_amount_cr_1, gl_rek_db_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2,
        gl_jns_cr_2, gl_amount_cr_2 } = data


    const myArray = ["TRX", "REV"]
    const isNotInArray = !myArray.includes(trx_type);
    if (isNotInArray) {

        /* A function that is called when the transaction type is invalid. */
        getprint("RESPONSE TOKEN", "TRX_TYPE SALAH")
        await insertlog("RES", bpr_id, trx_code, trx_type, no_hp, no_rek, amount, trans_fee, tgl_trans, tgl_transmis, keterangan, rrn, gl_rek_db_1, gl_jns_db_1, gl_amount_db_1, gl_rek_cr_1, gl_jns_cr_1,
            gl_amount_cr_1, gl_rek_db_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2, gl_jns_cr_2, gl_amount_cr_2, invelid_transaction)


        getprint("RESPONSE TARIK TUNAI", {
            code: invelid_transaction,
            status: "GAGAL",
            message: "TRX_TYPE SALAH",
            rrn: rrn,
            data: null
        });

        return res.status(200).send({
            code: invelid_transaction,
            status: "GAGAL",
            message: "TRX_TYPE SALAH",
            rrn: rrn,
            data: null
        });
    };

    if (trx_code == Req_Token_Tarik_Tunai) {

        if (trx_type == "REV") {
            let hasil = await check_rev(bpr_id, trx_code, trx_type, no_hp, no_rek, amount, trans_fee, tgl_trans, tgl_transmis, keterangan, rrn, gl_rek_db_1, gl_jns_db_1, gl_amount_db_1, gl_rek_cr_1, gl_jns_cr_1,
                gl_amount_cr_1, gl_rek_db_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2, gl_jns_cr_2, gl_amount_cr_2, Successful)

            if (hasil !== "ADA") {
                getprint("REV TARIK TUNAI", {
                    code: invelid_transaction,
                    status: "GAGAL",
                    message: "Transaksi tidak ditemukan",
                    rrn: rrn,
                    data: null
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

        await insertlog("REQ", bpr_id, trx_code, trx_type, no_hp, no_rek, amount, trans_fee, tgl_trans, tgl_transmis, keterangan, rrn, gl_rek_db_1, gl_jns_db_1, gl_amount_db_1, gl_rek_cr_1, gl_jns_cr_1,
            gl_amount_cr_1, gl_rek_db_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2, gl_jns_cr_2, gl_amount_cr_2, "")


        getprint("REQUEST TOKEN", req.body)
        /* Checking the status of the account number. */
        let valdr = await checkstatus(gl_rek_db_1, gl_jns_db_1, amount + trans_fee, rrn)
        if (valdr === undefined) {

        } else if (Object.keys(valdr).length !== 0) {
            await insertlog("RES", bpr_id, trx_code, trx_type, no_hp, no_rek, amount, trans_fee, tgl_trans, tgl_transmis, keterangan, rrn, gl_rek_db_1, gl_jns_db_1, gl_amount_db_1, gl_rek_cr_1, gl_jns_cr_1,
                gl_amount_cr_1, gl_rek_db_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2, gl_jns_cr_2, gl_amount_cr_2, valdr.code)

            getprint("RESPONSE TOKEN", valdr)

            return res.status(200).send(
                valdr
            )
        };

        let valcr1 = await checkstatus(gl_rek_cr_1, gl_jns_cr_1, 0, rrn)
        if (valcr1 === undefined) {

        } else if (Object.keys(valcr1).length !== 0) {
            await insertlog("RES", bpr_id, trx_code, trx_type, no_hp, no_rek, amount, trans_fee, tgl_trans, tgl_transmis, keterangan, rrn, gl_rek_db_1, gl_jns_db_1, gl_amount_db_1, gl_rek_cr_1, gl_jns_cr_1,
                gl_amount_cr_1, gl_rek_db_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2, gl_jns_cr_2, gl_amount_cr_2, valcr1.code)

            getprint("RESPONSE TOKEN", valcr1)

            return res.status(200).send(
                valcr1
            )
        };

        let valcr2 = await checkstatus(gl_rek_cr_2, gl_jns_cr_2, 0, rrn)
        if (valcr2 === undefined) {

        } else if (Object.keys(valcr2).length !== 0) {
            await insertlog("RES", bpr_id, trx_code, trx_type, no_hp, no_rek, amount, trans_fee, tgl_trans, tgl_transmis, keterangan, rrn, gl_rek_db_1, gl_jns_db_1, gl_amount_db_1, gl_rek_cr_1, gl_jns_cr_1,
                gl_amount_cr_1, gl_rek_db_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2, gl_jns_cr_2, gl_amount_cr_2, valcr2.code)

            getprint("RESPONSE TOKEN", valcr2)

            return res.status(200).send(
                valcr2
            )
        };

        nama_dr = await token_pok(gl_rek_db_1, gl_jns_db_1, gl_amount_db_1, gl_rek_cr_1, gl_jns_cr_1, trx_type, keterangan, rrn)

        if (trans_fee > 0) {
            nama_cr = await token_fee(gl_rek_dr_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2, gl_jns_cr_2, trx_type, keterangan, rrn)
        }
        await insertlog("RES", bpr_id, trx_code, trx_type, no_hp, no_rek, amount, trans_fee, tgl_trans, tgl_transmis, keterangan, rrn, gl_rek_db_1, gl_jns_db_1, gl_amount_db_1, gl_rek_cr_1, gl_jns_cr_1,
            gl_amount_cr_1, gl_rek_db_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2, gl_jns_cr_2, gl_amount_cr_2, Successful)

        getprint("RESPONSE TOKEN", {
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
                nama: nama_dr,
                amount: amount,
                trans_fee: trans_fee,
                tgl_trans: tgl_trans,
                tgl_transmis: tgl_transmis,
                noreff: tgl_trans.substr(0, 8) + rrn,
                status_rek: "AKTIF"
            }
        });
        return res.status(200).send({
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
                nama: nama_dr,
                amount: amount,
                trans_fee: trans_fee,
                tgl_trans: tgl_trans,
                tgl_transmis: tgl_transmis,
                noreff: tgl_trans.substr(0, 8) + rrn,
                status_rek: "AKTIF"
            }
        });

    } else if (trx_code == Release_Tarik_Tunai) {
        getprint("REQUEST RELEASE TOKEN", req.body)
        if (Object.keys(data.on_us).length != 0) {
            datatemp = data.on_us
        } else if (Object.keys(data.issuer).length != 0) {
            datatemp = data.issuer
        } else if (Object.keys(data.acquirer).length != 0) {
            datatemp = data.acquirer
            bpr_id = acq_id
        }

        let { gl_rek_db_1, gl_jns_db_1, gl_amount_db_1, gl_rek_cr_1, gl_jns_cr_1, gl_amount_cr_1, gl_rek_db_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2,
            gl_jns_cr_2, gl_amount_cr_2 } = datatemp

        if (trx_type == "REV") {
            let hasil = await check_rev(bpr_id, trx_code, trx_type, no_hp, no_rek, amount, trans_fee, tgl_trans, tgl_transmis, keterangan, rrn, gl_rek_db_1, gl_jns_db_1, gl_amount_db_1, gl_rek_cr_1, gl_jns_cr_1,
                gl_amount_cr_1, gl_rek_db_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2, gl_jns_cr_2, gl_amount_cr_2, Successful)

            if (hasil !== "ADA") {
                getprint("RESPONSE REV TARIK TUNAI", {
                    code: invelid_transaction,
                    status: "GAGAL",
                    message: "Transaksi tidak ditemukan",
                    rrn: rrn,
                    data: null
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

        await insertlog("REQ", bpr_id, trx_code, trx_type, no_hp, no_rek, amount, trans_fee, tgl_trans, tgl_transmis, keterangan, rrn, gl_rek_db_1, gl_jns_db_1, gl_amount_db_1, gl_rek_cr_1, gl_jns_cr_1,
            gl_amount_cr_1, gl_rek_db_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2, gl_jns_cr_2, gl_amount_cr_2, "")

        /* Checking the status of the account number. */
        let valdr = await checkstatus(gl_rek_db_1, gl_jns_db_1, amount + trans_fee, rrn)
        if (valdr === undefined) {

        } else if (Object.keys(valdr).length !== 0) {
            await insertlog("RES", bpr_id, trx_code, trx_type, no_hp, no_rek, amount, trans_fee, tgl_trans, tgl_transmis, keterangan, rrn, gl_rek_db_1, gl_jns_db_1, gl_amount_db_1, gl_rek_cr_1, gl_jns_cr_1,
                gl_amount_cr_1, gl_rek_db_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2, gl_jns_cr_2, gl_amount_cr_2, valdr.code)

            getprint("RESPONSE RELEASE TOKEN", valdr)

            return res.status(200).send(
                valdr
            )
        };

        let valcr1 = await checkstatus(gl_rek_cr_1, gl_jns_cr_1, 0, rrn)
        if (valcr1 === undefined) {

        } else if (Object.keys(valcr1).length !== 0) {
            await insertlog("RES", bpr_id, trx_code, trx_type, no_hp, no_rek, amount, trans_fee, tgl_trans, tgl_transmis, keterangan, rrn, gl_rek_db_1, gl_jns_db_1, gl_amount_db_1, gl_rek_cr_1, gl_jns_cr_1,
                gl_amount_cr_1, gl_rek_db_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2, gl_jns_cr_2, gl_amount_cr_2, valcr1.code)

            getprint("RESPONSE RELEASE TOKEN", valcr1)

            return res.status(200).send(
                valcr1
            )
        };

        let valcr2 = await checkstatus(gl_rek_cr_2, gl_jns_cr_2, 0, rrn)
        if (valcr2 === undefined) {

        } else if (Object.keys(valcr2).length !== 0) {
            await insertlog("RES", bpr_id, trx_code, trx_type, no_hp, no_rek, amount, trans_fee, tgl_trans, tgl_transmis, keterangan, rrn, gl_rek_db_1, gl_jns_db_1, gl_amount_db_1, gl_rek_cr_1, gl_jns_cr_1,
                gl_amount_cr_1, gl_rek_db_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2, gl_jns_cr_2, gl_amount_cr_2, valcr2.code)

            getprint("RESPONSE RELEASE TOKEN", valcr2)

            return res.status(200).send(
                valcr2
            )
        };

        nama_dr = await token_pok(gl_rek_db_1, gl_jns_db_1, gl_amount_db_1, gl_rek_cr_1, gl_jns_cr_1, trx_type, keterangan, rrn)
        if (trans_fee > 0) {
            nama_cr = await token_fee(gl_rek_dr_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2, gl_jns_cr_2, trx_type, keterangan, rrn)
        }
        await insertlog("RES", bpr_id, trx_code, trx_type, no_hp, no_rek, amount, trans_fee, tgl_trans, tgl_transmis, keterangan, rrn, gl_rek_db_1, gl_jns_db_1, gl_amount_db_1, gl_rek_cr_1, gl_jns_cr_1,
            gl_amount_cr_1, gl_rek_db_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2, gl_jns_cr_2, gl_amount_cr_2, Successful)

        getprint("RESPONSE RELEASE TOKEN ", {
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
                nama: nama_dr,
                amount: amount,
                trans_fee: trans_fee,
                tgl_trans: tgl_trans,
                tgl_transmis: tgl_transmis,
                noreff: tgl_trans.substr(0, 8) + rrn,
                status_rek: "AKTIF"
            }
        });
        return res.status(200).send({
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
                nama: nama_dr,
                amount: amount,
                trans_fee: trans_fee,
                tgl_trans: tgl_trans,
                tgl_transmis: tgl_transmis,
                noreff: tgl_trans.substr(0, 8) + rrn,
                status_rek: "AKTIF"
            }
        });
    } else {
        getprint("RESPONSE RELEASE TOKEN", {
            code: invelid_transaction,
            status: "GAGAL",
            message: "Transaksi tidak ditemukan",
            rrn: rrn,
            data: null
        });

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