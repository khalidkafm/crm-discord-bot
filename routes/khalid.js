var express = require('express');
var router = express.Router();
const Message = require('../models/messages')

/* GET home page. */
router.get('/', function(req, res, next) {
  Message.find()
  .then(data => res.json({data}))
});

module.exports = router;