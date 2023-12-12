var express = require('express');
var router = express.Router();
const Message = require('../models/messages')
const Member = require ('../models/members')
const JoinEvent = require('../models/joinEvents')
const mongodb = require('mongoose');
const Invite = require('../models/invites');

/* GET home page. */
router.get('/search', async function(req, res, next) {
  
});

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
  const guildId = new mongodb.Types.ObjectId(`${req.params.guildId.toString(16).padStart(24, '0')}`); // convert to hex and pad with zeros 
  Invite.find({guild: guildId}).populate('member')
  .then(data => {
      const members = [];
  
      res.json({
      result: true,
      invites: data,
    })
  });
});




module.exports = router;
