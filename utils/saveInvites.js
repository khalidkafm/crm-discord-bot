const Invite = require ('../models/invites')

async function saveInvites(guildId, codes) {

      if(!codes[0]){return}

      // fetching all invite for guildId
      const invitesInDb = await Invite.find({ guild: guildId })

      for(let code of codes){
        // checking if invite already exists in db

        if(!invitesInDb.some(item => item.code == code)){

          console.log(`saving invite ${code} in db`)

          // create new invite to save in db
          const newInvite = new Invite({
            code: code,
            name: code,
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
        }
      }
    };

    module.exports = saveInvites;