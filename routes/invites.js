var express = require('express');
var router = express.Router();
const Invite = require('../models/invites')
const { Client, GatewayIntentBits, ClientUser } = require('discord.js');
require('dotenv').config()


router.get('/', function async (req, res, next) {
   const data =async ()=>
   await Invite.findOne({_id: '657c8793f08cb9a86c3491f7'})
    res.json({result: true, data: data})
});

module.exports = router;