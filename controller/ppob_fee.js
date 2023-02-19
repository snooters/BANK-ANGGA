require('dotenv').config();
const { query } = require('express');
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
    KODE_TRN_BUKU_PINDAHBUKUFEE } = process.env;
let hasil

async function feeppob(gl_rek_db_2, gl_jns_db_2, gl_amount_db_2, gl_rek_cr_2, gl_jns_cr_2, gl_amount_cr_2, trx_type, rrn, product_name) {
    // proses TRX
    if (trx_type == "TRX") {
        dracc = gl_rek_db_2;
        jnsdracc = gl_jns_db_2;
        cracc = gl_rek_cr_2;
        jnscracc = gl_jns_cr_2;
        nominal_fee = gl_amount_db_2;

        const tgl = await gettanggal()
        if (jnsdracc == "2") {
            // proses debet tabungan nasabah
            let query = "update m_tabunganc set mutasidr= mutasidr + " + nominal_fee + ",trnke = trnke + 1,tgltrnakhir='" + tgl[0].tglsekarang + "',saldoakhir = saldoakhir - " + nominal_fee + " where noacc ='" + dracc + "'";
            await exect(query)
        }

        if (jnscracc == "2") {
            // proses kredit tabungan OY!
            let query = "update m_tabunganc set mutasicr= mutasicr + " + nominal_fee + ",trnke = trnke + 1,tgltrnakhir='" + tgl[0].tglsekarang + "',saldoakhir = saldoakhir + " + nominal_fee + " where noacc ='" + cracc + "'";
            await exect(query)
        }

        let inqueridr = await getsaldoacct(dracc, jnsdracc)
        let inquericr = await getsaldoacct(cracc, jnscracc)
        tgltrn = tgl[0].tglsekarang
        trnuser = USER_ID
        batch = BATCH
        kodetrn = KODE_TRN_PPOB
        if (jnsdracc == "1") {
            dracc = cracc.substr(0, 7) + "10" + dracc
        } else {
            dracc = dracc
        }
        drmodul = jnsdracc
        if (jnscracc == "1") {
            cracc = dracc.substr(0, 7) + "10" + cracc
        } else {
            cracc = cracc
        }
        crmodul = jnscracc
        dc = ""
        dokumen = tgltrn + rrn
        // nominal = nominal
        tglval = tgltrn
        ket = product_name
        kodebpr = dracc.substr(0, 3)
        kodecab = dracc.substr(3, 2)
        kodeloc = dracc.substr(5, 2)
        ststrn = "5"
        inpuser = USER_ID
        jam = new Date()
        inptgljam = tgltrn + jam.getHours() + jam.getMinutes() + jam.getSeconds()
        inpterm = "PPOB"
        prog = "w_ppob"
        groupno = 0
        modul = ""
        if (jnsdracc == "2") {
            sbbperalihan_dr = dracc.substr(0, 7) + "10" + inqueridr[0].sbbtab
        } else {
            sbbperalihan_dr = dracc
        }
        if (jnscracc == "2") {
            sbbperalihan_cr = dracc.substr(0, 7) + "10" + inquericr[0].sbbtab
        } else {
            sbbperalihan_cr = cracc
        }
        stscetak = "N"
        thnbln = tgltrn.substr(0, 6)
        jnstrnlx = ""
        jnstrntx = "03"
        trnke_dr = inqueridr[0].trnke
        trnke_cr = inquericr[0].trnke
        stscetakcr = "N"
        kdaodr = "N"
        kdaocr = "N"
        kdkoldr = "N"
        kdkolcr = "N"
        kdtrnbuku = KODE_TRN_BUKU_PPOBFEE
        depfrom = ""
        depto = ""
        namadr = inqueridr[0].fnama
        namacr = inquericr[0].fnama
        // ambil nomor transaksi per batch
        let query = "select nomor + 10 as nomor from nomaster where batch=" + BATCH
        hasil = await exect(query)
        notrn = hasil[0].nomor
        // update nomor transaksi per batch
        query = "update nomaster set nomor =" + notrn + " where batch=" + BATCH
        await exect(query)
        // insert table transaksi
        query = "INSERT INTO transaksi " +
            "(tgltrn,           trnuser,            batch,          notrn,          kodetrn," +
            "dracc,             drmodul,            cracc,          crmodul,        dc," +
            "dokumen,           nominal,            tglval,         ket,            kodebpr," +
            "kodecab,           kodeloc,            ststrn,         inpuser,        inptgljam," +
            "inpterm,           prog,               groupno,        modul,          sbbperalihan_dr," +
            "sbbperalihan_cr,   stscetak,           thnbln,         jnstrnlx,       jnstrntx," +
            "trnke_dr,          trnke_cr,           stscetakcr,     kdaodr,         kdaocr," +
            "kdkoldr,           kdkolcr,            kdtrnbuku,      depfrom,        depto," +
            "namadr,            namacr) VALUES " +
            "('" + tgltrn + "','" + trnuser + "'," + batch + "," + notrn + ",'" + kodetrn + "','" +
            dracc + "','" + drmodul + "','" + cracc + "','" + crmodul + "','" + dc + "','" +
            dokumen + "'," + nominal_fee + ",'" + tglval + "','" + ket + "','" + kodebpr + "','" +
            kodecab + "','" + kodeloc + "','" + ststrn + "','" + inpuser + "','" + inptgljam + "','" +
            inpterm + "','" + prog + "'," + groupno + ",'" + modul + "','" + sbbperalihan_dr + "','" +
            sbbperalihan_cr + "','" + stscetak + "','" + thnbln + "','" + jnstrnlx + "','" + jnstrntx + "'," +
            trnke_dr + "," + trnke_cr + ",'" + stscetakcr + "','" + kdaodr + "','" + kdaocr + "','" +
            kdkoldr + "','" + kdkolcr + "','" + kdtrnbuku + "','" + depfrom + "','" + depto + "','" +
            namadr + "','" + namacr + "')"

        await exect(query)
        if (jnsdracc == "2") {
            //    insert table transpc debet
            dc = "D"
            trnke = trnke_dr
            noacc = dracc
            let query = "INSERT INTO transpc " +
                "(tgltrn,               batch,              notrn,              noacc,              dc," +
                "nominal,               stscetak,           kdtrnbuku,          trnke)" +
                "VALUES " +
                "('" + tgltrn + "'," + batch + "," + notrn + ",'" + noacc + "','" + dc + "'," +
                nominal_fee + ",'" + stscetak + "','" + kdtrnbuku + "'," + trnke + ")"
            await exect(query)
        }

        if (jnscracc == "2") {
            dc = "C"
            trnke = trnke_cr
            noacc = cracc
            let query = "INSERT INTO transpc " +
                "(tgltrn,               batch,              notrn,              noacc,              dc," +
                "nominal,               stscetak,           kdtrnbuku,          trnke)" +
                "VALUES " +
                "('" + tgltrn + "'," + batch + "," + notrn + ",'" + noacc + "','" + dc + "'," +
                nominal_fee + ",'" + stscetak + "','" + kdtrnbuku + "'," + trnke + ")"
            await exect(query)
        }

    } else if (trx_type == "REV") {
        dracc = gl_rek_db_2;
        jnsdracc = gl_jns_db_2;
        cracc = gl_rek_cr_2;
        jnscracc = gl_jns_cr_2;
        nominal_fee = gl_amount_db_2

        let tgl = gettanggal()
        if (jnsdracc == "2") {
            // proses debet tabungan nasabah
            let query = "update m_tabunganc set mutasidr= mutasidr + " + nominal_fee + ",trnke = trnke + 1,tgltrnakhir='" + tgl[0].tglsekarang + "',saldoakhir = saldoakhir - " + nominal_fee + " where noacc ='" + dracc + "'";
            await exect(query)
        }

        if (jnscracc == "2") {
            // proses kredit tabungan OY!
            let query = "update m_tabunganc set mutasicr= mutasicr + " + nominal_fee + ",trnke = trnke + 1,tgltrnakhir='" + tgl[0].tglsekarang + "',saldoakhir = saldoakhir + " + nominal_fee + " where noacc ='" + cracc + "'";
            await exect(query)
        }

        let inqueridr = await getsaldoacct(dracc, jnsdracc)
        let inquericr = await getsaldoacct(cracc, jnscracc)
        tgltrn = tgl[0].tglsekarang
        trnuser = USER_ID
        batch = BATCH
        kodetrn = KODE_TRN_PPOB

        if (jnsdracc == "1") {
            dracc = cracc.substr(0, 7) + "10" + dracc
        } else {
            dracc = dracc
        }
        drmodul = jnsdracc

        if (jnscracc == "1") {
            cracc = dracc.substr(0, 7) + "10" + cracc
        } else {
            cracc = cracc
        }
        crmodul = jnscracc
        dc = ""
        dokumen = tgltrn + rrn
        // nominal = nominal
        tglval = tgltrn
        ket = product_name
        kodebpr = dracc.substr(0, 3)
        kodecab = dracc.substr(3, 2)
        kodeloc = dracc.substr(5, 2)
        ststrn = "5"
        inpuser = USER_ID
        jam = new Date()
        inptgljam = tgltrn + jam.getHours() + jam.getMinutes() + jam.getSeconds()
        inpterm = "PPOB"
        prog = "w_ppob"
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
        trnke_dr = inqueridr[0].trnke
        trnke_cr = inquericr[0].trnke
        stscetakcr = "N"
        kdaodr = "N"
        kdaocr = "N"
        kdkoldr = "N"
        kdkolcr = "N"
        kdtrnbuku = KODE_TRN_BUKU_PPOBFEE
        depfrom = ""
        depto = ""
        namadr = inqueridr[0].fnama
        namacr = inquericr[0].fnama
        // ambil nomor transaksi per batch
        let query = "select nomor + 10 as nomor from nomaster where batch='" + BATCH + "'"
        hasil = await exect(query)
        notrn = hasil[0].nomor
        // update nomor transaksi per batch
        query = "update nomaster set nomor =" + notrn + " where batch='" + BATCH + "'"
        await exect(query)
        // insert table transaksi
        query = "INSERT INTO transaksi " +
            "(tgltrn,           trnuser,            batch,          notrn,          kodetrn," +
            "dracc,             drmodul,            cracc,          crmodul,        dc," +
            "dokumen,           nominal,            tglval,         ket,            kodebpr," +
            "kodecab,           kodeloc,            ststrn,         inpuser,        inptgljam," +
            "inpterm,           prog,               groupno,        modul,          sbbperalihan_dr," +
            "sbbperalihan_cr,   stscetak,           thnbln,         jnstrnlx,       jnstrntx," +
            "trnke_dr,          trnke_cr,           stscetakcr,     kdaodr,         kdaocr," +
            "kdkoldr,           kdkolcr,            kdtrnbuku,      depfrom,        depto," +
            "namadr,            namacr) VALUES " +
            "('" + tgltrn + "','" + trnuser + "'," + batch + "," + notrn + ",'" + kodetrn + "','" +
            dracc + "','" + drmodul + "','" + cracc + "','" + crmodul + "','" + dc + "','" +
            dokumen + "'," + nominal_fee + ",'" + tglval + "','" + ket + "','" + kodebpr + "','" +
            kodecab + "','" + kodeloc + "','" + ststrn + "','" + inpuser + "','" + inptgljam + "','" +
            inpterm + "','" + prog + "'," + groupno + ",'" + modul + "','" + sbbperalihan_dr + "','" +
            sbbperalihan_cr + "','" + stscetak + "','" + thnbln + "','" + jnstrnlx + "','" + jnstrntx + "'," +
            trnke_dr + "," + trnke_cr + ",'" + stscetakcr + "','" + kdaodr + "','" + kdaocr + "','" +
            kdkoldr + "','" + kdkolcr + "','" + kdtrnbuku + "','" + depfrom + "','" + depto + "','" +
            namadr + "','" + namacr + "')"

        await exect(query)
        if (jnsdracc == "2") {
            //    insert table transpc debet
            dc = "D"
            trnke = trnke_dr
            noacc = dracc
            let query = "INSERT INTO transpc " +
                "(tgltrn,               batch,              notrn,              noacc,              dc," +
                "nominal,               stscetak,           kdtrnbuku,          trnke)" +
                "VALUES " +
                "('" + tgltrn + "'," + batch + "," + notrn + ",'" + noacc + "','" + dc + "'," +
                nominal_fee + ",'" + stscetak + "','" + kdtrnbuku + "'," + trnke + ")"
            await exect(query)
        }

        if (jnscracc == "2") {
            dc = "C"
            trnke = trnke_cr
            noacc = cracc
            let query = "INSERT INTO transpc " +
                "(tgltrn,               batch,              notrn,              noacc,              dc," +
                "nominal,               stscetak,           kdtrnbuku,          trnke)" +
                "VALUES " +
                "('" + tgltrn + "'," + batch + "," + notrn + ",'" + noacc + "','" + dc + "'," +
                nominal_fee + ",'" + stscetak + "','" + kdtrnbuku + "'," + trnke + ")"
            await exect(query)
        }
    }
}
module.exports = { feeppob }