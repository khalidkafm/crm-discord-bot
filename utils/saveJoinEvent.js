const Member = require ('../models/members');
const JoinEvent = require('../models/joinEvents');
const mongodb = require('mongoose');
const Invite = require('../models/invites');
const Guild = require ('../models/guilds');
const upsertMemberInDb = require('./upsertMemberInDb');
const upsertGuildInDb = require('./upsertGuildInDb');
const upsertGuildInviteInDb = require('./upsertGuildInviteInDb');
const discordToMongoId = require('../utils/idConversion/discordToMongoId');

async function saveJoinEvent(timestamp, member, invite) {

    //---------------------------------------------------------------------------------------------------------
    //
    //              MEMBER UPSERT IN DB (CREATE IF NOT EXISTING)
    //
    //---------------------------------------------------------------------------------------------------------

    const memberFromDb = await upsertMemberInDb(member)

    //---------------------------------------------------------------------------------------------------------
    //
    //              GUILD UPSERT IN DB (CREATE IF NOT EXISTING)
    //
    //---------------------------------------------------------------------------------------------------------

    const guildFromDb = await upsertGuildInDb(invite.guild)

    //---------------------------------------------------------------------------------------------------------
    //
    //              SAVING JOIN EVENT IN DB
    //
    //---------------------------------------------------------------------------------------------------------

    if(invite){ // checking if the invite used to join was found

        //---------------------------------------------------------------------------------------------------------
        //
        //              INVITE UPSERT IN DB (CREATE IF NOT EXISTING)
        //
        //---------------------------------------------------------------------------------------------------------

        const inviteFromDb = await upsertGuildInviteInDb(invite, guildFromDb)

        const newJoinEvent = await new JoinEvent({
            timestamp,
            guild: guildFromDb._id,
            member: memberFromDb._id,
            invite: inviteFromDb._id ,
        })

        try {
        await newJoinEvent.save();
      } catch {
        error => {
        console.error('error while saving joinEvent in mongoDB:', error)
        }
      }

    } else {
        console.log('invite code was not catch. Saving without invite code')
        const newJoinEvent = await new JoinEvent({
            timestamp,
            guild: guildFromDb._id,
            member: memberFromDb._id,
        })

        try{
        await newJoinEvent.save();
      } catch {
        error => {
        console.error('error while saving joinEvent in mongoDB:', error)
        }
      }
    }

    

    //logChannel.send(`${member.user.tag} joined using invite code ${invite.code} from ${inviter.tag}. Invite was used ${invite.uses} times since its creation.`)

    return true
};

module.exports = saveJoinEvent;