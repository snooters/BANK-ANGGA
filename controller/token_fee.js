require('dotenv').config();
const { query } = require('express');
var express = require('express');
const sql = require('msnodesqlv8');
const { gettanggal } = require('./get_tanggal');
const { getsaldoacct } = require('./inquiry_acct');
const { exect } = require('./executequery');

const {
    rek_tidakada,
    rek_tutup,
    saldo_kurang,
    rek_blokir,
    USER_ID,
    KODE_TRN_PPOB,
    KODE_TRN_BUKU_TARTUNPOK,
    KODE_TRN_BUKU_TARTUNFEE,
    KODE_TRN_TRTUN,
    BATCH,
    KODE_TRN_BUKU,
    PPOB,
    Sign_In,
    Sign_Off,
    Inquiry_Balance,
    invelid_transaction,
    Successful,
    rek_notauth,
    KD_BANK,
    KD_CAB,
    KD_LOC
} = process.env;

async function token_fee(gl_rek_db_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2, gl_jns_cr_2, gl_amount_cr_2, trx_type, rrn, keterangan, rrn) {
    // proses TRX
    if (trx_type == "TRX") {
        dracc = gl_rek_db_2;
        jnsdracc = gl_jns_db_2;
        cracc = gl_rek_cr_2;
        jnscracc = gl_jns_cr_2;
        nominal_fee = gl_amount_db_2;

        const tgl = await gettanggal()
        if (jnsdracc == "2") {
            let query = `update m_tabunganc set mutasidr= mutasidr + ${nominal_fee},
                        trnke = trnke + 1,tgltrnakhir='${tgl[0].tglsekarang}',
                        saldoakhir = saldoakhir - ${nominal_fee} where noacc ='${dracc}'`
            await exect(query)
        }

        if (jnscracc == "2") {
            let query = `update m_tabunganc set mutasicr= mutasicr + ${nominal_fee},
                        trnke = trnke + 1,tgltrnakhir='${tgl[0].tglsekarang}',
                        saldoakhir = saldoakhir + ${nominal_fee} where noacc ='${cracc}'`
            await exect(query)
        }

        let inqueridr = await getsaldoacct(dracc, jnsdracc)
        let inquericr = await getsaldoacct(cracc, jnscracc)
        tgltrn = tgl[0].tglsekarang
        trnuser = USER_ID
        batch = BATCH
        kodetrn = KODE_TRN_TRTUN
        if (jnsdracc == "1") {
            dracc = KD_BANK + KD_CAB + KD_LOC + "10" + dracc
        } else {
            dracc = dracc
        }
        drmodul = jnsdracc
        if (jnscracc == "1") {
            cracc = KD_BANK + KD_CAB + KD_LOC + "10" + cracc
        } else {
            cracc = cracc
        }
        crmodul = jnscracc
        dc = ""
        dokumen = tgltrn + rrn
        // nominal = nominal
        tglval = tgltrn
        ket = keterangan
        kodebpr = KD_BANK
        kodecab = KD_CAB
        kodeloc = KD_LOC
        ststrn = "5"
        inpuser = USER_ID
        jam = new Date()
        inptgljam = tgltrn + jam.getHours() + jam.getMinutes() + jam.getSeconds()
        inpterm = "TOKEN"
        prog = "w_token"
        groupno = 0
        modul = ""
        if (jnsdracc == "2") {
            sbbperalihan_dr = dracc.substr(0, 7) + "10" + inqueridr[0].sbbtab
        } else {
            sbbperalihan_dr = dracc
        }
        if (jnscracc == "2") {
            sbbperalihan_cr = cracc.substr(0, 7) + "10" + inquericr[0].sbbtab
        } else {
            sbbperalihan_cr = cracc
        }
        stscetak = "N"
        thnbln = tgltrn.substr(0, 6)
        jnstrnlx = ""
        jnstrntx = "03"

        if (jnsdracc == "2") {
            trnke_dr = inqueridr[0].trnke
        } else {
            trnke_dr = 0
        }

        if (jnscracc == "2") {
            trnke_cr = inquericr[0].trnke
        } else {
            trnke_cr = 0
        }

        stscetakcr = "N"
        kdaodr = "N"
        kdaocr = "N"
        kdkoldr = "N"
        kdkolcr = "N"
        kdtrnbuku = KODE_TRN_BUKU_TARTUNFEE
        depfrom = ""
        depto = ""

        if (jnsdracc == "2") {
            namadr = inqueridr[0].fnama
        } else {
            namadr = inqueridr[0].namaaccount
        }

        if (jnscracc == "2") {
            namacr = inquericr[0].fnama
        } else {
            namacr = inquericr[0].namaaccount
        }
        // ambil nomor transaksi per batch
        let query = `select nomor + 10 as nomor from nomaster where batch=${BATCH}`
        hasil = await exect(query)
        notrn = hasil[0].nomor
        // update nomor transaksi per batch
        query = `update nomaster set nomor =${notrn} where batch=${BATCH}`
        await exect(query)
        // insert table transaksi
        query = `INSERT INTO transaksi 
            (tgltrn,                trnuser,            batch,          notrn,          kodetrn,
            dracc,                  drmodul,            cracc,          crmodul,        dc,
            dokumen,                nominal,            tglval,         ket,            kodebpr,
            kodecab,                kodeloc,            ststrn,         inpuser,        inptgljam,
            inpterm,                prog,               groupno,        modul,          sbbperalihan_dr,
            sbbperalihan_cr,        stscetak,           thnbln,         jnstrnlx,       jnstrntx,
            trnke_dr,               trnke_cr,           stscetakcr,     kdaodr,         kdaocr,
            kdkoldr,                kdkolcr,            kdtrnbuku,      depfrom,        depto,
            namadr,                 namacr) VALUES 
            ('${tgltrn}',           '${trnuser}',       ${batch},       ${notrn},       '${kodetrn}',
            '${dracc}',             '${drmodul}',       '${cracc}',     '${crmodul}',   '${dc}',
            '${dokumen}',           ${nominal_fee},     '${tglval}',    '${ket}',       '${kodebpr}',
            '${kodecab}',           '${kodeloc}',       '${ststrn}',    '${inpuser}',   '${inptgljam}',
            '${inpterm}',           '${prog}',          ${groupno},     '${modul}',     '${sbbperalihan_dr}',
            '${sbbperalihan_cr}',   '${stscetak}',      '${thnbln}',    '${jnstrnlx}',  '${jnstrntx}',
            ${trnke_dr},            ${trnke_cr},        '${stscetakcr}','${kdaodr}',    '${kdaocr}',
            '${kdkoldr}',           '${kdkolcr}',       '${kdtrnbuku}', '${depfrom}',   '${depto}',
            '${namadr}',            '${namacr}')`

        await exect(query)
        if (jnsdracc == "2") {
            //    insert table transpc debet
            dc = "D"
            trnke = trnke_dr
            noacc = dracc
            query = `INSERT INTO transpc 
                (tgltrn,                batch,              notrn,              noacc,              dc,
                nominal,                stscetak,           kdtrnbuku,          trnke)
                VALUES 
                ('${tgltrn}',           ${batch},           ${notrn},           '${noacc}',         '${dc}',
                ${nominal_fee},         '${stscetak}',      '${kdtrnbuku}',     ${trnke})`
            await exect(query)
        }

        if (jnscracc == "2") {
            dc = "C"
            trnke = trnke_cr
            noacc = cracc
            query = `INSERT INTO transpc 
                (tgltrn,                batch,              notrn,              noacc,              dc,
                nominal,                stscetak,           kdtrnbuku,          trnke)
                VALUES 
                ('${tgltrn}',           ${batch},           ${notrn},           '${noacc}',         '${dc}',
                ${nominal_fee},         '${stscetak}',      '${kdtrnbuku}',     ${trnke})`
            await exect(query)
        }

    } else if (trx_type == "REV") {
        dracc = gl_rek_db_2;
        jnsdracc = gl_jns_db_2;
        cracc = gl_rek_cr_2;
        jnscracc = gl_jns_cr_2;
        nominal_fee = gl_amount_db_2

        let tgl = await gettanggal()
        if (jnsdracc == "2") {
            let query = `update m_tabunganc set mutasidr= mutasidr + ${nominal_fee},
                        trnke = trnke + 1,tgltrnakhir='${tgl[0].tglsekarang}',
                        saldoakhir = saldoakhir -${nominal_fee} where noacc ='${dracc}'`
            await exect(query)
        }

        if (jnscracc == "2") {
            let query = `update m_tabunganc set mutasicr= mutasicr + ${nominal_fee},
                        trnke = trnke + 1,tgltrnakhir='${tgl[0].tglsekarang}',
                        saldoakhir = saldoakhir + "${nominal_fee} where noacc ='${cracc}'`
            await exect(query)
        }

        let inqueridr = await getsaldoacct(dracc, jnsdracc)
        let inquericr = await getsaldoacct(cracc, jnscracc)
        tgltrn = tgl[0].tglsekarang
        trnuser = USER_ID
        batch = BATCH
        kodetrn = KODE_TRN_TRTUN
        if (jnsdracc == "1") {
            dracc = KD_BANK + KD_CAB + KD_LOC + "10" + dracc
        } else {
            dracc = dracc
        }
        drmodul = jnsdracc
        if (jnscracc == "1") {
            cracc = KD_BANK + KD_CAB + KD_LOC + "10" + cracc
        } else {
            cracc = cracc
        }
        crmodul = jnscracc
        dc = ""
        dokumen = tgltrn + rrn
        // nominal = nominal
        tglval = tgltrn
        ket = keterangan
        kodebpr = KD_BANK
        kodecab = KD_CAB
        kodeloc = KD_LOC
        ststrn = "5"
        inpuser = USER_ID
        jam = new Date()
        inptgljam = tgltrn + jam.getHours() + jam.getMinutes() + jam.getSeconds()
        inpterm = "token"
        prog = "w_token"
        groupno = 0
        modul = ""
        if (jnsdracc == "2") {
            sbbperalihan_dr = dracc.substr(0, 7) + "10" + inqueridr[0].sbbtab
        } else {
            sbbperalihan_dr = dracc
        }
        if (jnscracc == "2") {

            sbbperalihan_cr = cracc.substr(0, 7) + "10" + inquericr[0].sbbtab
        } else {
            sbbperalihan_cr = cracc
        }
        stscetak = "N"
        thnbln = tgltrn.substr(0, 6)
        jnstrnlx = ""
        jnstrntx = "03"

        if (jnsdracc == "2") {
            trnke_dr = inqueridr[0].trnke
        } else {
            trnke_dr = 0
        }

        if (jnscracc == "2") {
            trnke_cr = inquericr[0].trnke
        } else {
            trnke_cr = 0
        }

        stscetakcr = "N"
        kdaodr = "N"
        kdaocr = "N"
        kdkoldr = "N"
        kdkolcr = "N"
        kdtrnbuku = KODE_TRN_BUKU_TARTUNFEE
        depfrom = ""
        depto = ""

        if (jnsdracc == "2") {
            namadr = inqueridr[0].fnama
        } else {
            namadr = inqueridr[0].namaaccount
        }

        if (jnscracc == "2") {
            namacr = inquericr[0].fnama
        } else {
            namacr = inquericr[0].namaaccount
        }
        // ambil nomor transaksi per batch
        let query = `select nomor + 10 as nomor from nomaster where batch=${BATCH}`
        hasil = await exect(query)
        notrn = hasil[0].nomor
        // update nomor transaksi per batch
        query = `update nomaster set nomor =${notrn} where batch=${BATCH}`
        await exect(query)
        // insert table transaksi
        query = `INSERT INTO transaksi 
            (tgltrn,                trnuser,            batch,          notrn,          kodetrn,
            dracc,                  drmodul,            cracc,          crmodul,        dc,
            dokumen,                nominal,            tglval,         ket,            kodebpr,
            kodecab,                kodeloc,            ststrn,         inpuser,        inptgljam,
            inpterm,                prog,               groupno,        modul,          sbbperalihan_dr,
            sbbperalihan_cr,        stscetak,           thnbln,         jnstrnlx,       jnstrntx,
            trnke_dr,               trnke_cr,           stscetakcr,     kdaodr,         kdaocr,
            kdkoldr,                kdkolcr,            kdtrnbuku,      depfrom,        depto,
            namadr,                 namacr) VALUES 
            ('${tgltrn}',           '${trnuser}',       ${batch},       ${notrn},       '${kodetrn}',
            '${dracc}',             '${drmodul}',       '${cracc}',     '${crmodul}',   '${dc}',
            '${dokumen}',           ${nominal_fee},     '${tglval}',    '${ket}',       '${kodebpr}',
            '${kodecab}',           '${kodeloc}',       '${ststrn}',    '${inpuser}',   '${inptgljam}',
            '${inpterm}',           '${prog}',          ${groupno},     '${modul}',     '${sbbperalihan_dr}',
            '${sbbperalihan_cr}',   '${stscetak}',      '${thnbln}',    '${jnstrnlx}',  '${jnstrntx}',
            ${trnke_dr},            ${trnke_cr},        '${stscetakcr}','${kdaodr}',    '${kdaocr}',
            '${kdkoldr}',           '${kdkolcr}',       '${kdtrnbuku}', '${depfrom}',   '${depto}',
            '${namadr}',            '${namacr}')`

        await exect(query)
        if (jnsdracc == "2") {
            //    insert table transpc debet
            dc = "D"
            trnke = trnke_dr
            noacc = dracc
            query = `INSERT INTO transpc 
                (tgltrn,                batch,              notrn,              noacc,              dc,
                nominal,                stscetak,           kdtrnbuku,          trnke)
                VALUES "
                ('${tgltrn}',           ${batch},           ${notrn},           '${noacc}',         '${dc}',
                ${nominal_fee},         '${stscetak}',      '${kdtrnbuku}',     ${trnke})`
            await exect(query)
        }

        if (jnscracc == "2") {
            dc = "C"
            trnke = trnke_cr
            noacc = cracc
            query = `INSERT INTO transpc 
                (tgltrn,                batch,              notrn,              noacc,              dc,
                nominal,                stscetak,           kdtrnbuku,          trnke)
                VALUES 
                ('${tgltrn}',           ${batch},           ${notrn},           '${noacc}',         '${dc}',
                ${nominal_fee},         '${stscetak}',      '${kdtrnbuku}',     ${trnke})`
            await exect(query)
        }
    }
}
module.exports = { token_fee }