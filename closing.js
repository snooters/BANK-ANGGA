const readline = require('readline');
const axios = require('axios');
const { exect } = require('./controller/executequery');
let moment = require('moment');
const nodemon = require('nodemon');
const { API_SIGNIN } = process.env



const config = {
    headers: {
        'Content-Type': 'application/json'
    }
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function konfirmasiUlang() {
    rl.question('Apakah Anda yakin ingin menjalankan SignIn/SignOut? \r\n(Ketik SignIn Untuk Selesai CLOSING,SignOut Untuk Memulai CLOSING) \r\n', (answer) => {
        if (answer.toLowerCase() === 'signin') {
            const requestBody = {
                "bpr_id": "600931",
                "status": "1",
                "tgl_trans": moment().format("YYYYMMDDhhmmss")
            };
            axios.post(API_SIGNIN, requestBody, config)
                .then((response) => {
                    hasil = response.data
                    if (hasil.status.toLowerCase() === "success") {
                        let strquery = "update close_atm set stsclose ='N'"
                        exect(strquery)
                        strquery = "update TOFCLOSE set stsclose =''"
                        exect(strquery)
                    }
                    console.log("STATUS SERVER ON");
                })

                .catch((error) => {
                    console.log("GAGAL MENGUPDATE STATUS CLOSING");
                });

            rl.close();

        } else if (answer.toLowerCase() === 'signout') {
            const requestBody = {
                "bpr_id": "600931",
                "status": "0",
                "tgl_trans": moment().format('YYYYMMDDHHmmSS')
            };
            axios.post(API_SIGNIN, requestBody, config)
                .then((response) => {
                    hasil = response.data
                    if (hasil.status.toLowerCase() === "success") {
                        let strquery = "update close_atm set stsclose ='Y'"
                        exect(strquery)
                        strquery = "update TOFCLOSE set stsclose ='C'"
                        exect(strquery)
                    }
                    console.log("STATUS SERVER OFF");

                })
                .catch((error) => {
                    console.log("GAGAL MENGUPDATE STATUS CLOSING");
                });
            rl.close();
        } else {
            console.log('Pilihan tidak valid. Silakan coba lagi.');
            konfirmasiUlang();
        }
    });
}

konfirmasiUlang();