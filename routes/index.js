var express = require('express');
var router = express.Router();
const Message = require('../models/messages')
const Member = require ('../models/members')
const JoinEvent = require('../models/joinEvents')
const mongodb = require('mongoose');
const { ObjectId } = mongodb.Types;
const Invite = require('../models/invites');
const discordToMongoId = require('../utils/idConversion/discordToMongoId');


/* GET members list from inviteId. */
router.get('/members/:inviteId', async function(req, res, next) {

  try {
  // Get all first joinEvent per member for the inviteId AND add the member's nb of messages sent overall + over the last 7d
  const members = await JoinEvent.aggregate([
    { $match: { invite: new ObjectId(req.params.inviteId) } },
    { $sort: { timestamp: 1 } },
    {
      $group: {
        _id: "$member",
        firstJoinEvent: { $first: "$$ROOT" },
      },
    },
    {
      $replaceRoot: { newRoot: "$firstJoinEvent" },
    },
    {
      $lookup: {
        from: "messages",
        let: { memberId: "$member", guildId: "$guild" },
        pipeline: [
          {
            $match: {
              $expr: { $and: [{ $eq: ["$author", "$$memberId"] }, { $eq: ["$guild", "$$guildId"] }] },
            },
          },
        ],
        as: "messages",
      },
    },
    {
      $addFields: {
        totalMessages: { $size: "$messages" },
        messagesLast7Days: {
          $size: {
            $filter: {
              input: "$messages",
              as: "message",
              cond: { $gte: ["$$message.createdTimestamp", { $subtract: [new Date(), 7 * 24 * 60 * 60 * 1000] }] },
            },
          },
        },
      },
    },
    {
      $project: {
        messages: 0,
      },
    },
  ]);

    // Handle the data or send the response
    res.json({
      result: true,
      members,
      });

  } catch (error) {
    // Check if the error is due to a non-existent inviteId
    if (error.name === 'CastError' && error.path === 'invite') {
      // Handle the case where the inviteId is not found
      res.status(404).json({ error: 'Invite not found' });
    } else {
      // Handle other errors
      console.error('Error querying join events:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

});

/* GET invites list from guildId */
router.get('/invites/:guildId', async function(req, res, next) {
  
  const data = await Invite.find({guild: discordToMongoId(req.params.guildId)});

  res.json({
    result: true,
    invites: data,
    })

});




module.exports = router;
