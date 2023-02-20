const express = require('express');
const sql = require('msnodesqlv8');
var path = require('path');
require('dotenv').config();
const bodyParser = require("body-parser");
const cors = require("cors");
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const { PORT_API } = process.env;
let { VERSION_API } = process.env;

const app = express();

var inquiryrouter = require('./routes/Inquiry');
var PPOBRouter = require('./routes/PPOB');
var tariktunaiRouter = require('./routes/tariktunai');
var transferrouter = require('./routes/transfer');
var echorouter = require('./routes/echo');


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.raw());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


app.use('/inquiry', inquiryrouter);
app.use('/ppob', PPOBRouter);
app.use('/tariktunai', tariktunaiRouter);
app.use('/transfer', transferrouter);
app.use('/echo', echorouter);

app.listen(PORT_API, function () {
  console.log('==============================================');
  console.log('Welcome to Rest FULL API BPR ANGGA PERKASA');
  console.log('Version: ' + VERSION_API);
  console.log('@PT. Permata Niaga Nusantara');
  console.log('Author: ANAND');
  console.log('Server is running on port ' + PORT_API);
  console.log('==============================================');
});
