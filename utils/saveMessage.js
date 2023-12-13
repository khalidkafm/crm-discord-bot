const mongodb = require('mongoose');
const Guild = require ('../models/guilds');
const Invite = require('../models/invites');
const JoinEvent = require('../models/joinEvents');
const Member = require ('../models/members');
const Message = require ('../models/messages');
const discordToMongoId = require('../utils/idConversion/discordToMongoId');

async function saveMessage(message) {


    const newMessage = new Message({
        _id: discordToMongoId(message.id),
        channelId: message.channelId,
        guild: discordToMongoId(message.guildId),
        discordId: message.id,
        createdTimestamp: message.createdTimestamp,
        type: message.type,
        content: message.content,
        author: discordToMongoId(message.author.id),
      })
      const savedMessage = await newMessage.save();  

      return savedMessage

};

module.exports = saveMessage;