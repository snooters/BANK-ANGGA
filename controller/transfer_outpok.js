require('dotenv').config();
const { query, response } = require('express');
var express = require('express');
const sql = require('msnodesqlv8');
const { gettanggal } = require('./get_tanggal');
const { getsaldoacct } = require('./inquiry_acct');
const { exect } = require('./executequery');
const { str,
    invelid_transaction,
    rek_tidakada,
    USER_ID,
    BATCH,
    KODE_TRN_PPOB,
    KODE_TRN_BUKU_PPOBPOK,
    KODE_TRN_TRTUN,
    KODE_TRN_TRFIN,
    KODE_TRN_TRFOUT,
    KODE_TRN_PINDAHBUKU,
    KODE_TRN_BUKU_PPOBFEE,
    KODE_TRN_BUKU_TARTUNPOK,
    KODE_TRN_BUKU_TARTUNFEE,
    KODE_TRN_BUKU_TRFINPOK,
    KODE_TRN_BUKU_TRFINFEE,
    KODE_TRN_BUKU_TRFOUTPOK,
    KODE_TRN_BUKU_TRFOUTFEE,
    KODE_TRN_BUKU_PINDAHBUKUPOK,
    KODE_TRN_BUKU_PINDAHBUKUFEE,
    KD_BANK,
    KD_CAB,
    KD_LOC, } = process.env;
let hasil

async function trf_out_pok(gl_rek_db_1, gl_jns_db_1, gl_amount_db_1, gl_rek_cr_1, gl_jns_cr_1, gl_amount_cr_1, trx_type, rrn, product_name) {
    // proses TRX
    if (trx_type == "TRX") {
        dracc = gl_rek_db_1;
        jnsdracc = gl_jns_db_1;
        cracc = gl_rek_cr_1;
        jnscracc = gl_jns_cr_1;
        nom_pok = gl_amount_db_1;

        tgl = await gettanggal()
        if (jnsdracc == "2") {
            let query = `update m_tabunganc set mutasidr= mutasidr +${nom_pok},
                        trnke = trnke + 1,tgltrnakhir='${tgl[0].tglsekarang}',
                        saldoakhir = saldoakhir -${nom_pok} where noacc ='${dracc}'`
            await exect(query)
        }

        if (jnscracc == "2") {
            let query = `update m_tabunganc set mutasicr= mutasicr + ${nom_pok},
                        trnke = trnke + 1,tgltrnakhir='${tgl[0].tglsekarang}',
                        saldoakhir = saldoakhir + ${nom_pok} where noacc ='${cracc}'`
            await exect(query)

        }

        let inqueridr = await getsaldoacct(dracc, jnsdracc)

        let inquericr = await getsaldoacct(cracc, jnscracc)

        tgltrn = tgl[0].tglsekarang
        trnuser = USER_ID
        batch = BATCH
        kodetrn = KODE_TRN_TRFOUT
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
        ket = product_name
        kodebpr = KD_BANK
        kodecab = KD_CAB
        kodeloc = KD_LOC
        ststrn = "5"
        inpuser = USER_ID
        jam = new Date()
        inptgljam = tgltrn + jam.getHours() + jam.getMinutes() + jam.getSeconds()
        inpterm = "trfout"
        prog = "w_trf"
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
        kdtrnbuku = KODE_TRN_BUKU_TRFOUTPOK
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
            (tgltrn,                trnuser,            batch,              notrn,          kodetrn,
            dracc,                  drmodul,            cracc,              crmodul,        dc,
            dokumen,                nominal,            tglval,             ket,            kodebpr,
            kodecab,                kodeloc,            ststrn,             inpuser,        inptgljam,
            inpterm,                prog,               groupno,            modul,          sbbperalihan_dr,
            sbbperalihan_cr,        stscetak,           thnbln,             jnstrnlx,       jnstrntx,
            trnke_dr,               trnke_cr,           stscetakcr,         kdaodr,         kdaocr,
            kdkoldr,                kdkolcr,            kdtrnbuku,          depfrom,        depto,
            namadr,                 namacr) VALUES 
            ('${tgltrn}',           '${trnuser}',       ${batch},           ${notrn},       '${kodetrn}',
            '${dracc}',             '${drmodul}',       '${cracc}',         '${crmodul}',   '${dc}',
            '${dokumen}',           ${nom_pok},         '${tglval}',        '${ket}',       '${kodebpr}',
            '${kodecab}',           '${kodeloc}',       '${ststrn}',        '${inpuser}',   '${inptgljam}',
            '${inpterm}',           '${prog}',          ${groupno},         '${modul}',     '${sbbperalihan_dr}',
            '${sbbperalihan_cr}',   '${stscetak}',      '${thnbln}',        '${jnstrnlx}',  '${jnstrntx}',
            ${trnke_dr},            ${trnke_cr},        '${stscetakcr}',    '${kdaodr}',    '${kdaocr}',
            '${kdkoldr}',           '${kdkolcr}',       '${kdtrnbuku}',     '${depfrom}',   '${depto}',
            '${namadr}',            '${namacr}')`

        await exect(query)

        if (jnsdracc == "2") {
            dc = "D"
            trnke = trnke_dr
            noacc = dracc
            query = `INSERT INTO transpc 
                (tgltrn,               batch,              notrn,              noacc,              dc,
                nominal,               stscetak,           kdtrnbuku,          trnke)
                VALUES 
                ('${tgltrn}',           ${batch},           ${notrn},           '${noacc}',         '${dc}',
                ${nom_pok},             '${stscetak}',      '${kdtrnbuku}',     ${trnke})`
            await exect(query)
        }

        if (jnscracc == "2") {
            dc = "C"
            trnke = trnke_cr
            noacc = cracc
            query = `INSERT INTO transpc 
                (tgltrn,               batch,              notrn,              noacc,              dc,
                nominal,               stscetak,           kdtrnbuku,          trnke)
                VALUES 
                ('${tgltrn}',           ${batch},           ${notrn},           '${noacc}',         '${dc}',
                ${nom_pok},             '${stscetak}',      '${kdtrnbuku}',     ${trnke})`
            await exect(query)
        }
        return namadr

    } else if (trx_type == "REV") {
        dracc = gl_rek_db_1;
        jnsdracc = gl_jns_db_1;
        cracc = gl_rek_cr_1;
        jnscracc = gl_jns_cr_1;
        nom_pok = gl_amount_db_1

        let tgl = await gettanggal()
        if (jnsdracc == "2") {
            query = `update m_tabunganc set mutasidr = mutasidr +${nom_pok},
                        trnke = trnke + 1,tgltrnakhir ='${tgl[0].tglsekarang}',
                        saldoakhir = saldoakhir - ${nom_pok} where noacc ='${dracc}'`
            await exect(query)
        }

        if (jnscracc == "2") {
            query = `update m_tabunganc set mutasicr = mutasicr + ${nom_pok},
                    trnke = trnke + 1,tgltrnakhir='${tgl[0].tglsekarang}',
                    saldoakhir = saldoakhir + ${nom_pok} where noacc ='${cracc}'`
            await exect(query)
        }

        let inqueridr = await getsaldoacct(dracc, jnsdracc)
        let inquericr = await getsaldoacct(cracc, jnscracc)
        tgltrn = tgl[0].tglsekarang
        trnuser = USER_ID
        batch = BATCH
        kodetrn = KODE_TRN_TRFOUT
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
        ket = product_name
        kodebpr = KD_BANK
        kodecab = KD_CAB
        kodeloc = KD_LOC
        ststrn = "5"
        inpuser = USER_ID
        jam = new Date()
        inptgljam = tgltrn + jam.getHours() + jam.getMinutes() + jam.getSeconds()
        inpterm = "trfout"
        prog = "w_trf"
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
        kdtrnbuku = KODE_TRN_BUKU_TRFOUTPOK
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
        let query = `select nomor + 10 as nomor from nomaster where batch=${BATCH}`
        hasil = await exect(query)
        notrn = hasil[0].nomor
        query = `update nomaster set nomor =${notrn} where batch=${BATCH}`
        await exect(query)
        query = `INSERT INTO transaksi 
            (tgltrn,                trnuser,            batch,              notrn,          kodetrn,
            dracc,                  drmodul,            cracc,              crmodul,        dc,
            dokumen,                nominal,            tglval,             ket,            kodebpr,
            kodecab,                kodeloc,            ststrn,             inpuser,        inptgljam,
            inpterm,                prog,               groupno,            modul,          sbbperalihan_dr,
            sbbperalihan_cr,        stscetak,           thnbln,             jnstrnlx,       jnstrntx,
            trnke_dr,               trnke_cr,           stscetakcr,         kdaodr,         kdaocr,
            kdkoldr,                kdkolcr,            kdtrnbuku,          depfrom,        depto,
            namadr,                 namacr) VALUES 
            ('${tgltrn}',           '${trnuser}',       ${batch},           ${notrn},       '${kodetrn}',
            '${dracc}',             '${drmodul}',       '${cracc}',         '${crmodul}',   '${dc}',
            '${dokumen}',           ${nom_pok},         '${tglval}',        '${ket}',       '${kodebpr}',
            '${kodecab}',           '${kodeloc}',       '${ststrn}',        '${inpuser}',   '${inptgljam}',
            '${inpterm}',           '${prog}',          ${groupno},         '${modul}',     '${sbbperalihan_dr}',
            '${sbbperalihan_cr}',   '${stscetak}',      '${thnbln}',        '${jnstrnlx}',  '${jnstrntx}',
            ${trnke_dr},            ${trnke_cr},        '${stscetakcr}',    '${kdaodr}',    '${kdaocr}',    
            '${kdkoldr}',           '${kdkolcr}',       '${kdtrnbuku}',     '${depfrom}',   '${depto}',
            '${namadr}',            '${namacr}')`

        await exect(query)
        if (jnsdracc == "2") {
            dc = "D"
            trnke = trnke_dr
            noacc = dracc
            query = `INSERT INTO transpc 
                (tgltrn,               batch,              notrn,              noacc,              dc,
                nominal,               stscetak,           kdtrnbuku,          trnke)
                VALUES 
                ('${tgltrn}',           ${batch},           ${notrn},           '${noacc}',         '${dc}',
                ${nom_pok},             '${stscetak}',      '${kdtrnbuku}',     ${trnke})`
            await exect(query)
        }

        if (jnscracc == "2") {
            dc = "C"
            trnke = trnke_cr
            noacc = cracc
            query = `INSERT INTO transpc 
                (tgltrn,               batch,              notrn,              noacc,              dc,
                nominal,               stscetak,           kdtrnbuku,          trnke)
                VALUES 
                ('${tgltrn}',           ${batch},           ${notrn},           '${noacc}',         '${dc}',
                ${nom_pok},             '${stscetak}',      '${kdtrnbuku}',     ${trnke})`
            await exect(query)
        }
    }
    return namadr
}
module.exports = { trf_out_pok }