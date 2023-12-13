const mongodb = require('mongoose');
const Guild = require ('../models/guilds');
const Invite = require('../models/invites');
const JoinEvent = require('../models/joinEvents');
const Member = require ('../models/members');
const Message = require ('../models/messages');
const discordToMongoId = require('../utils/idConversion/discordToMongoId');

async function upsertGuildInDb(guild) {
    
    // Updating the guild in DB 
    let guildFromDb = await Guild.findById(discordToMongoId(guild.id));

    if(guildFromDb){
        console.log('guild found in db')
    } else {
        console.log(`saving guild ${guild.id} in db`)
        try {
            const newGuild = new Guild({
                _id: discordToMongoId(guild.id),
                discordId: guild.id ,
                name: guild.name,
                icon: guild.icon,
                permissions: '', 
                ownerId: guild.ownerId,
                joinedTimestamp: guild.joinedTimestamp,
            })

            const save = await newGuild.save();
            console.log('save',save);
        } catch {
          error => {
          console.error('error while saving guild in mongoDB:', error)
          }
        }

        guildFromDb = await Guild.findById(discordToMongoId(guild.id));
    }

    return guildFromDb;

};

module.exports = upsertGuildInDb;