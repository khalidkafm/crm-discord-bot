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

/* POST /populate a guild's invite in db with mock data  */
router.post('/populate', async function(req, res, next) {
  
  if (req.body && req.body.inviteId){
    const invite = await Invite.findOne({_id: new ObjectId(discordToMongoId(req.body.inviteId))});
    if ( invite ) {
      console.log(invite)

          const memberNames = ["m.allan.01","Georgina203","Khalid influencer","raida7885","frqnku","lepandamalade","neevaik","docs2309","khalidkaf89","Cedric"]
          const members = [];
          const joinEvents = [];
          const messages = [];
          
          for (let i=0; i<1; i++){
            for(let memberName of memberNames){
              const newMember = new Member({
                  discordId: `${discordToMongoId(Math.floor(Math.random()*1000000))}`,
                  username: memberName + Math.floor(Math.random()*1000),
                  globalName: memberName,
                  discriminator: "0",
                  isBot: false,
                  isSystem: false,
                  avatar: null,
                  banner: null,
                  permissions: [],
                  roles: [],
                  joinedTimestamp: (new Date()).getTime(),
                  premiumSinceTimestamp: (new Date()).getTime(),
                })
              //console.log('saving newMember :', newMember)
              const member = await newMember.save()
              members.push(member)
              //console.log('members array :',members)

              // Calculer le timestamp maximum (date actuelle)
              const maxTimestamp = (new Date()).getTime();
              // Calculer le timestamp minimum (il y a trois semaines)
              const minTimestamp = maxTimestamp - 3 * 7 * 24 * 60 * 60 * 1000; // 3 semaines en millisecondes
              const joinTimestamp = Math.floor(Math.random() * (maxTimestamp - minTimestamp + 1)) + minTimestamp;

              const newJoinEvent = new JoinEvent({
                  timestamp: joinTimestamp,
                  guild: invite.guild,
                  member: member._id,
                  invite: invite._id,
              })
              //console.log('saving newJoinEvent :', newJoinEvent)
              const joinEvent = await newJoinEvent.save()
              joinEvents.push(joinEvent)
              //console.log('saved joinEvent :', joinEvent)

                for (let i=0; i<30; i++){
                  const messageTimestamp = Math.floor(Math.random() * (maxTimestamp - joinTimestamp + 1)) + joinTimestamp;
                  const newMessage = new Message({
                    discordId: invite.guild.toString(),
                    channelId: "1045256538618597436",
                    guild: invite.guild,
                    createdTimestamp: messageTimestamp,
                    type: 0,
                    content: "generated message" + Math.floor(Math.random()*100000000),
                    author: member._id,
                })
                  //console.log("newMessage : ", newMessage)
                  const message = await newMessage.save();
                  messages.push(message);
                  //console.log("messages : ", messages)
                }
            }
          }

      res.json({
        result: true,
        populated: `${messages.length} messages, ${members.length} members, ${joinEvents.length} joinEvents, for invite ${invite.code},on guild ${invite.guild.toString()}`,
        })
    } else {
      res.json({
        result: false,
        message: "invite not found in db",
        })
    }

  } else {
    res.json({
      result: false,
      message: "missing inviteId in request's body",
      })
  }
  
});


module.exports = router;
