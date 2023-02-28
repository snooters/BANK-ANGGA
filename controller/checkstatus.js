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
    rek_notauth
} = process.env;
let result
async function checkstatus(noacc, jns_id, nominal, rrn) {
    result === null
    let hasil = await getsaldoacct(noacc, jns_id)
    if (Object.keys(hasil).length == 0) {
        result = {
            code: rek_tidakada,
            status: "GAGAL",
            message: "REKENING TIDAK DITEMUKAN",
            rrn: rrn,
            data: null
        }
    } else {
        stsrec = hasil[0].stsrec,
            stsblok = hasil[0].stsblok,
            saldoakhir = hasil[0].saldoakhir,
            saldoeff = hasil[0].saldoeff

        if (stsrec == "N") {
            result = {
                code: rek_notauth,
                status: "GAGAL",
                message: "REKENING TIDAK AKTIF",
                rrn: rrn,
                data: null
            }
        } else if (stsrec == "C") {
            result = {
                code: rek_tutup,
                status: "GAGAL",
                message: "REKENING TUTUP",
                rrn: rrn,
                data: null
            }
        } else if (stsrec == "T") {
            result = {
                code: rek_tutup,
                status: "GAGAL",
                message: "REKENING TUTUP",
                rrn: rrn,
                data: null
            }
        } else if (stsrec == "A") {

            if (nominal > (saldoeff)) {
                if (nominal > 0) {
                    result = {
                        code: saldo_kurang,
                        status: "GAGAL",
                        message: "SALDO TIDAK CUKUP",
                        rrn: rrn,
                        data: null
                    }
                }
            } else if (stsblok == "R") {
                result = {
                    code: rek_blokir,
                    status: "GAGAL",
                    message: "REKENING BLOKIR",
                    rrn: rrn,
                    data: null
                }
            }
        } else {
            result = {
                code: rek_tidakada,
                status: "GAGAL",
                message: "REKENING TIDAK DITEMUKAN",
                rrn: rrn,
                data: null
            }
        }
    }
    return result

}

module.exports = { checkstatus }