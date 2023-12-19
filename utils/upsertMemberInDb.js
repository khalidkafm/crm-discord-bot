const mongodb = require('mongoose');
const Guild = require ('../models/guilds');
const Invite = require('../models/invites');
const JoinEvent = require('../models/joinEvents');
const Member = require ('../models/members');
const Message = require ('../models/messages');
const discordToMongoId = require('../utils/idConversion/discordToMongoId');

async function upsertMemberInDb(member) {

    let memberFromDb = await Member.findById(discordToMongoId(member.user.id))

            // Convert the string to a Date object
            const joinedDate = new Date(member.joinedTimestamp);
            const premiumSinceDate = new Date(member.premiumSinceTimestamp);
            // Get the timestamp (UNIX timestamp) from the Date object
            const joinedTimestamp = joinedDate.getTime();
            const premiumSinceTimestamp = premiumSinceDate.getTime();

            console.log('member : ', member);

    if(memberFromDb){
        console.log('member found in db')
    } else {
        const newMember = new Member({
            _id : discordToMongoId(member.user.id),
            discordId: member.user.id,
            username: member.user.username,
            globalName: member.user.globalName ,
            discriminator: member.user.discriminator,
            isBot: member.user.bot,
            isSystem: member.user.system,
            avatar: member.user.avatar,
            banner: member.user.banner,
            joinedTimestamp,
            premiumSinceTimestamp,
        })

        try {
        await newMember.save();
        } catch {
            error => {
            console.error('error while saving member in mongoDB:', error)
            }
        }

        memberFromDb = await Member.findById(discordToMongoId(member.user.id))
    }

    return memberFromDb;
};

module.exports = upsertMemberInDb;