const mongodb = require('mongoose');
const Guild = require ('../models/guilds');
const Invite = require('../models/invites');
const JoinEvent = require('../models/joinEvents');
const Member = require ('../models/members');
const Message = require ('../models/messages');
const discordToMongoId = require('../utils/idConversion/discordToMongoId');

async function upsertInviteInDb(invite, guildFromDb) {

    let inviteFromDb = await Invite.findOne({code: invite.code})
    
    if(inviteFromDb){
        console.log('invite found in db')
    } else{
        console.log('invite NOT found in db..inserting invite in DB')
        // create new invite to save in db
        const newInvite = new Invite({
            code: invite.code,
            name: invite.code,
            guild: guildFromDb._id,
        });

        // saving new invite in db
        try {
            await newInvite.save()
        } catch {
            error => {
            console.error('error while saving invite in mongoDB:', error)
            }
        }
      inviteFromDb = await Invite.findOne({code: invite.code})
    }

    return inviteFromDb;

};

module.exports = upsertInviteInDb;