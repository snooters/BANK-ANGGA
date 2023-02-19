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




    let { trx_code, trx_type, bpr_id, nama_bpr_id, no_rek, nama_rek, bank_tujuan, rek_tujuan, nama_tujuan, amount, trans_fee, keterangan, tgl_trans, tgl_transmis, rrn, data } = req.body
    let { gl_rek_db_1, gl_jns_db_1, gl_amount_db_1, gl_rek_cr_1, gl_jns_cr_1, gl_amount_cr_1, gl_rek_db_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2, gl_jns_cr_2, gl_amount_cr_2 } = data

    const myArray = ["TRX", "REV"]
    const isNotInArray = !myArray.includes(trx_type);
    if (isNotInArray) {

        getprint("REQ TOKEN", "TRX_TYPE SALAH")

        return res.status(200).send({
            code: invelid_transaction,
            status: "GAGAL",
            message: "TRX_TYPE SALAH",
            rrn: rrn,
            data: null
        });
    };

    if (trx_code == Transfer_In) {
        /* Checking the status of the account. */
        let valdr = await checkstatus(gl_rek_db_1, gl_jns_db_1, amount + trans_fee, rrn)
        if (valdr === undefined) {

        } else if (Object.keys(valdr).length !== 0) {
            return res.status(200).send(
                valdr
            )
        };

        /* Checking the status of the account. */
        let valcr1 = await checkstatus(gl_rek_cr_1, gl_jns_cr_1, 0, rrn)
        if (valcr1 === undefined) {

        } else if (Object.keys(valcr1).length !== 0) {
            return res.status(200).send(
                valcr1
            )
        };

        /* Checking the status of the account. */
        let valcr2 = await checkstatus(gl_rek_cr_2, gl_jns_cr_2, 0, rrn)
        if (valcr2 === undefined) {

        } else if (Object.keys(valcr2).length !== 0) {
            return res.status(200).send(
                valcr2
            )
        };

        /* A function that is called from another file. */
        nama_rekdr = await trf_in_pok(gl_rek_db_1, gl_jns_db_1, gl_amount_db_1, gl_rek_cr_1, gl_jns_cr_1, gl_amount_cr_1, trx_type, rrn, keterangan)

        if (trans_fee > 0) {
            await trf_in_fee(gl_rek_db_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2, gl_jns_cr_2, gl_amount_cr_2, trx_type, rrn, keterangan)
        }


        getprint("TRANSFER IN", {
            code: Successful,
            status: "SUKSES",
            message: "SUKSES",
            rrn: rrn,
            data: {
                no_rek: gl_rek_db_1,
                amount: amount,
                fee: trans_fee
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
                    tgl_trans: tgl_trans,
                    tgl_transmis: tgl_transmis,
                    no_rek: gl_rek_db_1,
                    nama_rek: nama_rekdr,
                    noreff: tgl_trans.substr(0, 8) + rrn,
                    status_rek: "AKTIF"
                }
            });




    } else if (trx_code == Transfer_Out) {

        /* Checking the status of the account. */
        let valdr = await checkstatus(gl_rek_db_1, gl_jns_db_1, amount + trans_fee, rrn)
        if (valdr === undefined) {

        } else if (Object.keys(valdr).length !== 0) {
            return res.status(200).send(
                valdr
            )
        };

        /* Checking the status of the account. */
        let valcr1 = await checkstatus(gl_rek_cr_1, gl_jns_cr_1, 0, rrn)
        if (valcr1 === undefined) {

        } else if (Object.keys(valcr1).length !== 0) {
            return res.status(200).send(
                valcr1
            )
        };

        /* Checking the status of the account. */
        let valcr2 = await checkstatus(gl_rek_cr_2, gl_jns_cr_2, 0, rrn)
        if (valcr2 === undefined) {

        } else if (Object.keys(valcr2).length !== 0) {
            return res.status(200).send(
                valcr2
            )
        };

        /* A function that is called from another file. */
        nama_rekdr = await trf_out_pok(gl_rek_db_1, gl_jns_db_1, gl_amount_db_1, gl_rek_cr_1, gl_jns_cr_1, gl_amount_cr_1, trx_type, rrn, product_name)

        if (trans_fee > 0) {
            await trf_out_fee(gl_rek_db_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2, gl_jns_cr_2, gl_amount_cr_2, trx_type, rrn, product_name)
        }


        getprint("TRANSFER OUT", {
            code: Successful,
            status: "SUKSES",
            message: "SUKSES",
            rrn: rrn,
            data: {
                no_rek: gl_rek_db_1,
                amount: amount,
                fee: trans_fee
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
                    tgl_trans: tgl_trans,
                    tgl_transmis: tgl_transmis,
                    no_rek: gl_rek_db_1,
                    nama_rek: nama_rekdr,
                    noreff: tgl_trans.substr(0, 8) + rrn,
                    status_rek: "AKTIF"
                }
            });


    } else if (trx_code == Pindah_Buku) {

        /* Checking the status of the account. */
        let valdr = await checkstatus(gl_rek_db_1, gl_jns_db_1, amount + trans_fee, rrn)
        if (valdr === undefined) {

        } else if (Object.keys(valdr).length !== 0) {
            return res.status(200).send(
                valdr
            )
        };

        /* Checking the status of the account. */
        let valcr1 = await checkstatus(gl_rek_cr_1, gl_jns_cr_1, 0, rrn)
        if (valcr1 === undefined) {

        } else if (Object.keys(valcr1).length !== 0) {
            return res.status(200).send(
                valcr1
            )
        };

        /* Checking the status of the account. */
        let valcr2 = await checkstatus(gl_rek_cr_2, gl_jns_cr_2, 0, rrn)
        if (valcr2 === undefined) {

        } else if (Object.keys(valcr2).length !== 0) {
            return res.status(200).send(
                valcr2
            )
        };

        /* A function that is called from another file. */
        nama_rekdr = await pindahbuku_pok(gl_rek_db_1, gl_jns_db_1, gl_amount_db_1, gl_rek_cr_1, gl_jns_cr_1, gl_amount_cr_1, trx_type, rrn, product_name)

        if (trans_fee > 0) {
            await pindahbuku_fee(gl_rek_db_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2, gl_jns_cr_2, gl_amount_cr_2, trx_type, rrn, product_name)
        }


        getprint("PINDAH BUKU", {
            code: Successful,
            status: "SUKSES",
            message: "SUKSES",
            rrn: rrn,
            data: {
                no_rek: gl_rek_db_1,
                amount: amount,
                fee: trans_fee
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
                    tgl_trans: tgl_trans,
                    tgl_transmis: tgl_transmis,
                    no_rek: gl_rek_db_1,
                    nama_rek: nama_rekdr,
                    noreff: tgl_trans.substr(0, 8) + rrn,
                    status_rek: "AKTIF"
                }
            });


    } else {
        getprint("TRANSFER", "TRX_CODE SALAH")
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