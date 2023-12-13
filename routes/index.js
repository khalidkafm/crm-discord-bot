var express = require('express');
var router = express.Router();
const Message = require('../models/messages')
const Member = require ('../models/members')
const JoinEvent = require('../models/joinEvents')
const mongodb = require('mongoose');
const Invite = require('../models/invites');
const discordToMongoId = require('../utils/idConversion/discordToMongoId');


/* GET home page. */
router.get('/members/:inviteId', async function(req, res, next) {
  JoinEvent.find({invite: req.params.inviteId})
  .then(data => res.json({
    result: true,
    members: data,
  }))
});

/* GET home page. */
router.get('/invites/:guildId', async function(req, res, next) {
  
  Invite.find({guild: discordToMongoId(req.params.guildId)})
  .then(data => {
      const members = [];
  
      res.json({
      result: true,
      invites: data,
    })
  });
});




module.exports = router;
