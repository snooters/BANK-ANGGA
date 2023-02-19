var express = require('express');
var path = require('path');
var router = express.Router();
var router = express.Router();
require('dotenv').config();

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
router.post('/', async (req, res) => {
    res.status(200).send({
        code: Successful,
        status: "SUKSES",
        message: "SUKSES"
    })

});
module.exports = router