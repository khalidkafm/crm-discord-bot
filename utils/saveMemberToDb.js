const Member = require ('../models/members')
const JoinEvent = require('../models/joinEvents')
const mongodb = require('mongoose');
const Invite = require('../models/invites');

async function saveMemberToDb(timestamp, member, invite, inviter) {

    //console.log('inviter : ', inviter.tag, inviter);
    //console.log('invite : ', invite.code, invite.guild.id);
    //console.log('member : ', member.user.id, member);


    const memberId = new mongodb.Types.ObjectId(`${member.user.id.toString(16).padStart(24, '0')}`); // convert to hex and pad with zeros
    const memberFromDb = await Member.findById(memberId)
    if(memberFromDb){
        console.log('member found in db')
    } else {
        const newMember = new Member({
            _id : memberId,
            id: member.user.id,
            name: member.user.username,
        })
        await newMember.save();
    }

    //---------------------------------------------------------------------------------------------------------
    //
    //              UPDATE GUILD IN DB AND CREATE IF NOT EXISTING
    //
    //---------------------------------------------------------------------------------------------------------

    const guildId = new mongodb.Types.ObjectId(`${invite.guild.id.toString(16).padStart(24, '0')}`); // convert to hex and pad with zeros
     // Updating the guild in DB 
     try {
       const result = await Guild.updateOne(
         { _id: guildId },
         { id: invite.guild.id ,
           name: invite.guild.name,
           icon: invite.guild.icon,
           permissions: '', 
           ownerId: invite.guild.ownerId,
           joinedTimestamp: invite.guild.joinedTimestamp, },
         { upsert: true }
       );
     } catch {
       error => {
         console.error('error while updating guild in mongoDB:', error)
       }
     }

    console.log('invite.code : ',invite.code )
    if(invite && invite.code){
        let inviteFromDb = await Invite.findOne({code: invite.code})
        //////
        if(inviteFromDb){
            console.log('invite found in db')
        } else{
            console.log('invite NOT found in db..Creating invite in DB')
            // create new invite to save in db
          const newInvite = new Invite({
            code: invite.code,
            name: invite.code,
            guild: guildId,
          });

          // saving new invite in db
          try {
            await newInvite.save()
          } catch {
            error => {
              console.error('error while updating guild in mongoDB:', error)
            }
          }
          inviteFromDb = await Invite.findOne({code: invite.code})
        }
        ////

        const newJoinEvent = await new JoinEvent({
            timestamp,
            guild: guildId,
            member: memberId,
            invite: inviteFromDb._id ,
        })
        await newJoinEvent.save();
    } else {
        console.log('invite code was not catch. Saving without invite code')
        const newJoinEvent = await new JoinEvent({
            timestamp,
            guild: guildId,
            member: memberId,
        })
        await newJoinEvent.save();
    }

    

    //logChannel.send(`${member.user.tag} joined using invite code ${invite.code} from ${inviter.tag}. Invite was used ${invite.uses} times since its creation.`)

    return true
};

module.exports = saveMemberToDb;