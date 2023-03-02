require('dotenv').config();
var express = require('express');
var router = express.Router();
const Validator = require('fastest-validator');
const db = require("../connection/index");
const { getprint } = require('../controller/consoledata');
const { trf_in_fee } = require('../controller/transfer_infee');
const { trf_in_pok } = require('../controller/transfer_inpok');
const { trf_out_fee } = require('../controller/transfer_outfee');
const { trf_out_pok } = require('../controller/transfer_outpok');
const { checkstatus } = require('../controller/checkstatus');
const { pindahbuku_fee } = require('../controller/pindahbuku_fee');
const { pindahbuku_pok } = require('../controller/pindahbuku_pok');
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
    PPOB,
    Sign_In,
    Sign_Off,
    invelid_transaction,
    Successful,
    Req_Token_Tarik_Tunai,
    Release_Tarik_Tunai,
    Transfer_Out,
    Transfer_In,
    Pindah_Buku
} = process.env;

router.post('/', async (req, res) => {
    const schema = {
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
    let request
    let gl_pok
    let gl_fee

    if (validate.length) {
        return res
            .status(200)
            .json(validate);
    }


    let close_atm = await stsclose()
    if (close_atm !== "OPEN") {
        getprint("RESPONSE TRANSFER", "SERVER SEDANG CLOSING")
        return res.status(200).send({
            code: "089",
            status: "GAGAL",
            message: "SERVER SEDANG CLOSING"
        })
    }

    let { trx_code, trx_type, bpr_id, nama_bpr_id, no_rek, nama_rek, bank_tujuan, rek_tujuan, nama_tujuan, amount, trans_fee, keterangan, tgl_trans, tgl_transmis, rrn, data } = req.body
    let { gl_rek_db_1, gl_jns_db_1, gl_amount_db_1, gl_rek_cr_1, gl_jns_cr_1, gl_amount_cr_1, gl_rek_db_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2, gl_jns_cr_2, gl_amount_cr_2 } = data

    const myArray = ["TRX", "REV"]
    const isNotInArray = !myArray.includes(trx_type);
    if (isNotInArray) {

        getprint("RESPONSE TRANSFER", "TRX_TYPE SALAH")

        return res.status(200).send({
            code: invelid_transaction,
            status: "GAGAL",
            message: "TRX_TYPE SALAH",
            rrn: rrn,
            data: null
        });
    };

    if (trx_type == "REV") {
        let hasil = await check_rev(bpr_id, trx_code, trx_type, "", no_rek, amount, trans_fee, tgl_trans, tgl_transmis, keterangan, rrn, gl_rek_db_1, gl_jns_db_1, gl_amount_db_1, gl_rek_cr_1, gl_jns_cr_1,
            gl_amount_cr_1, gl_rek_db_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2, gl_jns_cr_2, gl_amount_cr_2, Successful)

        if (hasil !== "ADA") {
            getprint("RESPONSE REV TRANSFER", {
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

    if (trx_code == Transfer_In) {
        getprint("REQUEST TRANSFER IN", req.body)
        /* Checking the status of the account. */
        let valdr = await checkstatus(gl_rek_db_1, gl_jns_db_1, amount + trans_fee, rrn)
        if (valdr === undefined) {

        } else if (Object.keys(valdr).length !== 0) {

            getprint("RESPONSE TRANSFER IN", valdr)

            return res.status(200).send(
                valdr
            )
        };

        /* Checking the status of the account. */
        let valcr1 = await checkstatus(gl_rek_cr_1, gl_jns_cr_1, 0, rrn)
        if (valcr1 === undefined) {

        } else if (Object.keys(valcr1).length !== 0) {

            getprint("RESPONSE TRANSFER IN", valcr1)

            return res.status(200).send(
                valcr1
            )
        };

        /* Checking the status of the account. */
        let valcr2 = await checkstatus(gl_rek_cr_2, gl_jns_cr_2, 0, rrn)
        if (valcr2 === undefined) {

        } else if (Object.keys(valcr2).length !== 0) {

            getprint("RESPONSE TRANSFER IN", valcr2)

            return res.status(200).send(
                valcr2
            )
        };

        /* A function that is called from another file. */
        nama_rekdr = await trf_in_pok(gl_rek_db_1, gl_jns_db_1, gl_amount_db_1, gl_rek_cr_1, gl_jns_cr_1, gl_amount_cr_1, trx_type, rrn, keterangan)

        if (trans_fee > 0) {
            await trf_in_fee(gl_rek_db_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2, gl_jns_cr_2, gl_amount_cr_2, trx_type, rrn, keterangan)
        }


        getprint("RESPONSE TRANSFER IN", {
            code: Successful,
            status: "SUKSES",
            message: "SUKSES",
            rrn: rrn,
            data: {
                bpr_id: bpr_id,
                trx_code: trx_code,
                trx_type: trx_type,
                tgl_trans: tgl_trans,
                tgl_transmis: tgl_transmis,
                no_rek: gl_rek_db_1,
                nama: nama_rekdr,
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




    } else if (trx_code == Transfer_Out) {

        getprint("REQUEST TRANSFER OUT", req.body)
        /* Checking the status of the account. */
        let valdr = await checkstatus(gl_rek_db_1, gl_jns_db_1, amount + trans_fee, rrn)
        if (valdr === undefined) {

        } else if (Object.keys(valdr).length !== 0) {

            getprint("RESPONSE TRANSFER OUT", valdr)

            return res.status(200).send(
                valdr
            )
        };

        /* Checking the status of the account. */
        let valcr1 = await checkstatus(gl_rek_cr_1, gl_jns_cr_1, 0, rrn)
        if (valcr1 === undefined) {

        } else if (Object.keys(valcr1).length !== 0) {

            getprint("RESPONSE TRANSFER OUT", valcr1)

            return res.status(200).send(
                valcr1
            )
        };

        /* Checking the status of the account. */
        let valcr2 = await checkstatus(gl_rek_cr_2, gl_jns_cr_2, 0, rrn)
        if (valcr2 === undefined) {

        } else if (Object.keys(valcr2).length !== 0) {

            getprint("RESPONSE TRANSFER OUT", valcr2)

            return res.status(200).send(
                valcr2
            )
        };

        /* A function that is called from another file. */
        nama_rekdr = await trf_out_pok(gl_rek_db_1, gl_jns_db_1, gl_amount_db_1, gl_rek_cr_1, gl_jns_cr_1, gl_amount_cr_1, trx_type, rrn, keterangan)

        if (trans_fee > 0) {
            await trf_out_fee(gl_rek_db_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2, gl_jns_cr_2, gl_amount_cr_2, trx_type, rrn, keterangan)
        }


        getprint("RESPONSE TRANSFER OUT", {
            code: Successful,
            status: "SUKSES",
            message: "SUKSES",
            rrn: rrn,
            data: {
                bpr_id: bpr_id,
                trx_code: trx_code,
                trx_type: trx_type,
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


    } else if (trx_code == Pindah_Buku) {

        getprint("REQUEST PINDAH BUKU", req.body)
        /* Checking the status of the account. */
        let valdr = await checkstatus(gl_rek_db_1, gl_jns_db_1, amount + trans_fee, rrn)
        if (valdr === undefined) {

        } else if (Object.keys(valdr).length !== 0) {

            getprint("RESPONSE PINDAH BUKU", valdr)

            return res.status(200).send(
                valdr
            )
        };

        /* Checking the status of the account. */
        let valcr1 = await checkstatus(gl_rek_cr_1, gl_jns_cr_1, 0, rrn)
        if (valcr1 === undefined) {

        } else if (Object.keys(valcr1).length !== 0) {

            getprint("RESPONSE PINDAH BUKU", valcr1)

            return res.status(200).send(
                valcr1
            )
        };

        /* Checking the status of the account. */
        let valcr2 = await checkstatus(gl_rek_cr_2, gl_jns_cr_2, 0, rrn)
        if (valcr2 === undefined) {

        } else if (Object.keys(valcr2).length !== 0) {

            getprint("RESPONSE PINDAH BUKU", valcr2)
            return res.status(200).send(
                valcr2
            )
        };

        /* A function that is called from another file. */
        nama_rekdr = await pindahbuku_pok(gl_rek_db_1, gl_jns_db_1, gl_amount_db_1, gl_rek_cr_1, gl_jns_cr_1, gl_amount_cr_1, trx_type, rrn, keterangan)

        if (trans_fee > 0) {
            await pindahbuku_fee(gl_rek_db_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2, gl_jns_cr_2, gl_amount_cr_2, trx_type, rrn, keterangan)
        }


        getprint("RESPONSE PINDAH BUKU", {
            code: Successful,
            status: "SUKSES",
            message: "SUKSES",
            rrn: rrn,
            data: {
                bpr_id: bpr_id,
                trx_code: trx_code,
                trx_type: trx_type,
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

        return res.status(200).send({
            code: Successful,
            status: "SUKSES",
            message: "SUKSES",
            rrn: rrn,
            data: {
                bpr_id: bpr_id,
                trx_code: trx_code,
                trx_type: trx_type,
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
        getprint("RESPONSE TRANSFER", "TRX_CODE SALAH")
        return res.status(200).send({
            code: invelid_transaction,
            status: "GAGAL",
            message: "TRX_CODE SALAH",
            rrn: rrn,
            data: null
        });
    }

});
module.exports = router;