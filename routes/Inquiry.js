require('dotenv').config();
var express = require('express');
const sql = require('msnodesqlv8');
var router = express.Router();
const Validator = require('fastest-validator');
const db = require("../connection/index");
const v = new Validator();
var path = require('path');
const { getnameacct } = require('../controller/inquiry_acct');
const { getsaldoacct } = require('../controller/inquiry_acct');
const { getprint } = require('../controller/consoledata');
const { insertlog } = require('../controller/insertlog');
const { stsclose } = require('../controller/closeatm');

const {
    rek_tidakada,
    rek_tutup,
    saldo_kurang,
    rek_blokir,
    USER_ID,
    BATCH,
    Inquiry_Account,
    Sign_In,
    Sign_Off,
    Inquiry_Balance,
    invelid_transaction,
    Successful,
    rek_notauth,
    str } = process.env;
router.post('/', async (req, res) => {
    const schema = {
        bpr_id: "string",
        trx_code: "string",
        trx_type: "string",
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
        getprint("INQUIRY", "SERVER SEDANG CLOSING")
        return res.status(200).send({
            code: "089",
            status: "GAGAL",
            message: "SERVER SEDANG CLOSING"
        })
    }
    const { bpr_id, trx_code, trx_type, tgl_trans, tgl_transmis, rrn, no_rek, gl_jns, data } = req.body;
    // let { gl_rek_db_1, gl_jns_db_1, gl_amount_db_1, gl_rek_cr_1, gl_jns_cr_1, gl_amount_cr_1, gl_rek_db_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2, gl_jns_cr_2, gl_amount_cr_2 } = data
    let hasil, senddata, sts
    let value = []
    // inquiry account name
    if (trx_code == Inquiry_Account) {
        getprint("REQUEST ACCOUNT INQUIRY", req.body)

        await insertlog("REQ", bpr_id, trx_code, trx_type, "", no_rek, 0, 0, tgl_trans, tgl_transmis, "", rrn, "", gl_jns, 0, "", "",
            0, "", "", 0, "", "", 0, "")

        hasil = await getnameacct(no_rek, gl_jns)
        if (Object.keys(hasil).length != 0) {
            // akun inquiri GL
            if (gl_jns == "1") {
                switch (hasil[0].stsrec) {
                    case "A":
                        sts = "AKTIF"
                        break;
                    case "N":
                        sts = "TIDAK AKTIF"
                        break;
                    case "C":
                        sts = "TUTUP"
                        break;
                    default:
                        sts = "REKENING TIDAK ADA"
                };
                senddata = {
                    code: Successful,
                    status: "SUKSES",
                    message: "SUKSES",
                    data: {
                        bpr_id: bpr_id,
                        trx_code: trx_code,
                        trx_type: trx_type,
                        tgl_trans: tgl_trans,
                        tgl_transmis: tgl_transmis,
                        rrn: rrn,
                        no_rek: no_rek,
                        nama: hasil[0].nmsbb,
                        status_rek: sts
                    }
                }
                // akun inquiri TABUNGAN
            } else if (gl_jns == "2") {
                switch (hasil[0].stsrec) {
                    case "A":
                        if (hasil[0].stsblok == "R") {
                            sts = "BLOKIR"
                        } else {
                            sts = "AKTIF"
                        }
                        break;
                    case "N":
                        sts = "TIDAK AKTIF"
                        break;
                    case "C":
                        sts = "TUTUP"
                        break;
                    default:
                        sts = "REK SALAH"
                };

                senddata = {
                    code: Successful,
                    status: "SUKSES",
                    message: "SUKSES",
                    data: {
                        bpr_id: bpr_id,
                        trx_code: trx_code,
                        trx_type: trx_type,
                        tgl_trans: tgl_trans,
                        tgl_transmis: tgl_transmis,
                        rrn: rrn,
                        no_rek: no_rek,
                        nama: hasil[0].fnama,
                        status_rek: sts
                    }
                }
            }
            await insertlog("RES", bpr_id, trx_code, trx_type, "", no_rek, 0, 0, tgl_trans, tgl_transmis, "", rrn, "", "", 0, "", "",
                0, "", "", 0, "", "", 0, Successful)
            getprint("RESPONSE ACCOUNT INQUIRY", senddata)
            return res.status(200).send(
                senddata
            );
        } else {
            senddata = {
                code: invelid_transaction,
                status: "GAGAL",
                message: "REKENING SALAH",
                rrn: rrn,
                data: null
            }

            await insertlog("RES", bpr_id, trx_code, trx_type, "", no_rek, 0, 0, tgl_trans, tgl_transmis, "", rrn, "", "", 0, "", "",
                0, "", "", 0, "", "", 0, Successful)

            //getprint("ACCOUNT INQUIRY REQ", req.body)
            getprint("RESPONSE ACCOUNT INQUIRY", senddata)

            return res.status(200).send({
                code: invelid_transaction,
                status: "GAGAL",
                message: "REKENING SALAH",
                rrn: rrn,
                data: null
            });
        }

        // get balance account
    } else if (trx_code == Inquiry_Balance) {
        getprint("REQUEST BALANCE INQUIRY", req.body)
        for (i in data) {
            let no_rek = data[i].no_rek
            let gl_jns = data[i].gl_jns
            await insertlog("REQ", bpr_id, trx_code, trx_type, "", no_rek, 0, 0, tgl_trans, tgl_transmis, "", rrn, "", gl_jns, 0, "", "",
                0, "", "", 0, "", "", 0, "")
            hasil = await getsaldoacct(no_rek, gl_jns)
            if (Object.keys(hasil).length != 0) {
                let stsrec = hasil[0].stsrec
                let stsblok = hasil[0].stsblok
                let nama
                if (gl_jns == "2") {
                    nama = hasil[0].fnama
                } else {
                    nama = hasil[0].namaaccount
                }
                let saldoakhir = hasil[0].saldoakhir
                let saldoeff
                if (gl_jns == "1") {
                    saldoeff = saldoakhir
                } else {
                    saldoeff = hasil[0].saldoeff
                }
                let sts
                await insertlog("RES", bpr_id, trx_code, trx_type, "", no_rek, 0, 0, tgl_trans, tgl_transmis, "", rrn, "", "", 0, "", "",
                    0, "", "", 0, "", "", 0, Successful)

                switch (stsrec) {
                    case "N":
                        sts = "TIDAK AKTIF"
                        break;
                    case "C":
                        sts = "TUTUP"
                        break;
                    case "T":
                        sts = "TUTUP"
                        break;
                    case "A":
                        if (stsblok == "R") {
                            sts = "BLOKIR"
                        } else {
                            sts = "AKTIF"
                        }
                        break;
                    default:
                        sts = "REK SALAH"
                }
                value.push({
                    no_rek: no_rek,
                    nama: nama,
                    saldoakhir: saldoakhir,
                    saldoeff: saldoeff,
                    status_rek: sts
                })
            } else {
                value.push({
                    no_rek: no_rek,
                    nama: "Not Found",
                    saldoakhir: "Not Found",
                    saldoeff: "Not Found",
                    status_rek: "REK SALAH"
                })
            }
        }
        senddata = {
            code: Successful,
            status: "SUKSES",
            message: "SUKSES",
            rrn: rrn,
            data: {
                bpr_id: bpr_id,
                trx_code: trx_code,
                trx_type: trx_type,
                tgl_trans: tgl_trans,
                tgl_transmis: tgl_transmis
            }
        }

        getprint("RESPONSE BALANCE INQUIRY", senddata)
        return res.status(200).send({
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
                data: value
            }
        })
    }


});

module.exports = router;