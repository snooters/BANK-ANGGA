var express = require('express');
var router = express.Router();
var path = require('path');

router.post('/', async (req, res) => {
    res.status(200).send('Welcome To BPR ANGGA PERKASA RESTFULL API. \r\nCopyright @PT. Permata Niaga Nusantara')
});
router.get('/', async (req, res) => {
    res.status(200).send('Welcome To BPR ANGGA PERKASA RESTFULL API. \r\nCopyright @PT. Permata Niaga Nusantara')
});
module.exports = router