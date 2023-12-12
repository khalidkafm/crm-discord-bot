const { Client, GatewayIntentBits, Collection } = require('discord.js');
const mongodb = require('mongoose')
const Message = require ('../models/messages')
const Guild = require ('../models/guilds')
const Member = require ('../models/members')
const saveInvites = require('../utils/saveInvites')
const saveMemberToDb = require('../utils/saveMemberToDb')
require('dotenv').config()

// Adding bot link
// https://discord.com/api/oauth2/authorize?client_id=1174752417791889448&permissions=8&scope=bot

let client;

async function connectToDiscord() {

  //returns the active client if already created to be used in routes or other modules
  if (client) {
    return client;
  }

  client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildInvites,
      // Ajoutez d'autres intents au besoin
    ],
  });

  client.on('ready', async () => {
    // WARNING "ready" isn't really ready. We need to wait a spell. setTimout(1000) could be required!!

    // CONSOLE LOGS AT LAUNCH
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity(`on ${client.guilds.cache.size} servers`);
    console.log(`Ready to serve on ${client.guilds.cache.size} servers, for ${client.users.cache.size} users.`);

    // Managing errors, warns, and debugs from DiscordJS librairie
    client.on("error", (e) => console.error(e));
    client.on("warn", (e) => console.warn(e));
    client.on("debug", (e) => console.info(e));

    // KEEP OUT OF THE LOOP ON GUILDS - the invites collection is for all guilds
    const invites = new Collection();
    
    // Loop over all the guilds
    client.guilds.cache.forEach(async (guild) => {

      console.log(`updating ${guild.name} (guild_id: ${guild.id})`)

      //---------------------------------------------------------------------------------------------------------
      //
      //              SAVING Guild in MongoDB
      //
      //---------------------------------------------------------------------------------------------------------

      // Updating all the guilds in DB 
      const guildId = new mongodb.Types.ObjectId(`${guild.id.toString(16).padStart(24, '0')}`); // convert to hex and pad with zeros
      try {
        const result = await Guild.updateOne(
          { _id: guildId },
          { id: guild.id ,
            name:guild.name,
            icon: guild.icon,
            permissions: '', 
            ownerId: guild.ownerId,
            joinedTimestamp: guild.joinedTimestamp, },
          { upsert: true }
        );
      } catch {
        error => {
          console.error('error while updating guild in mongoDB:', error)
        }
      }

      //---------------------------------------------------------------------------------------------------------
      //
      //              FETCHING Guild Members with permissions and roles. NOT SAVED TO DB at the moment
      //
      //---------------------------------------------------------------------------------------------------------

      // calling the saveMembers function to fetch All guild members and save them to DB.
      //const allMembers = await saveMembers(guild);

      //---------------------------------------------------------------------------------------------------------
      //
      //              FETCHING and SAVING Guild invites
      //
      //---------------------------------------------------------------------------------------------------------

      // Fetch Guild Invites
      const firstInvites = await guild.invites.fetch();

      // Set the key as Guild ID, and create a map which has the invite code, and the number of uses
      invites.set(guild.id, new Collection(firstInvites.map((invite) => [invite.code, invite.uses])));
      // Saving guild Invites in DB 
      try { 
        // convert firstInvites array to invite codes array
        const codes = firstInvites.map((invite) => invite.code);
        
        // saving codes to db
        await saveInvites( guildId.toString() , codes);

      } catch {
        error => console.error('error while updating invites in mongoDB:', error)
      };

    });

    //---------------------------------------------------------------------------------------------------------
    //
    //              ACTIVATING real time listeners
    //
    //---------------------------------------------------------------------------------------------------------

    client.on("inviteDelete", (invite) => {
      // Delete the Invite from Cache
      invites.get(invite.guild.id).delete(invite.code);
    });
    
    //---------------------------------------------------------------------------------------------------------
    //
    //              MUST SAVE NEW INVITE TO DB
    //
    //---------------------------------------------------------------------------------------------------------

    client.on("inviteCreate", (invite) => {
      console.log(`Une invitation a été créée : ${invite.url}`);
      // Update cache on new invites
      invites.get(invite.guild.id).set(invite.code, invite.uses);
    });

    //---------------------------------------------------------------------------------------------------------
    //
    //              MUST SAVE NEW GUILD INVITES TO DB
    //
    //---------------------------------------------------------------------------------------------------------

    client.on("guildCreate", async (guild) => {

      // Updating the guild in DB 
      const guildId = new mongodb.Types.ObjectId(`${guild.id.toString(16).padStart(24, '0')}`); // convert to hex and pad with zeros
      try {
        const result = await Guild.updateOne(
          { _id: guildId },
          { id: guild.id ,
            name:guild.name,
            icon: guild.icon,
            permissions: '', 
            ownerId: guild.ownerId,
            joinedTimestamp: guild.joinedTimestamp, },
          { upsert: true }
        );
      } catch {
        error => {
          console.error('error while updating guild in mongoDB:', error)
        }
      }

      // We've been added to a new Guild. Let's fetch all the invites, and save it to our cache
      const firstInvites = await guild.invites.fetch();

      // Set the key as Guild ID, and create a map which has the invite code, and the number of uses
      invites.set(guild.id, new Collection(firstInvites.map((invite) => [invite.code, invite.uses])));
      // Saving guild Invites in DB 
      try { 
        // convert firstInvites array to invite codes array
        const codes = firstInvites.map((invite) => invite.code);
        // saving codes to db
        await saveInvites( guildId.toString() , codes);

      } catch {
        error => console.error('error while updating invites in mongoDB:', error)
      };

      
    });
    
    client.on("guildDelete", (guild) => {
      // We've been removed from a Guild. Let's delete all their invites
      invites.delete(guild.id);
    });

    //---------------------------------------------------------------------------------------------------------
    //
    //              MUST SAVE USER TO DB WITH INVTE CODE USED
    //
    //---------------------------------------------------------------------------------------------------------

    client.on("guildMemberAdd", async (member) => {
      const timestamp = member.joinedAt;
      console.log(`New User "${member.user.username}" has joined "${member.guild.name}"` );
      // To compare, we need to load the current invite list.
      const newInvites = await member.guild.invites.fetch()
      // This is the *existing* invites for the guild.
      const oldInvites = invites.get(member.guild.id);
      // Look through the invites, find the one for which the uses went up.
      const invite = newInvites.find(i => i.uses > oldInvites.get(i.code));
      // This is just to simplify the message being sent below (inviter doesn't have a tag property)
      let inviter;
      if(invite){
        inviter = await client.users.fetch(invite.inviter.id);
      }
      // Get the log channel (change to your liking)
      //const logChannel = member.guild.channels.cache.find(channel => channel.name === "general-original");
      // A real basic message with the information we need. 
      const saveOk = await saveMemberToDb(timestamp, member, invite, inviter)
      console.log('saveOk : ', saveOk)
    });

    //---------------------------------------------------------------------------------------------------------
    //
    //              SAVING MESSAGES TO DB (only from tracked members)
    //
    //---------------------------------------------------------------------------------------------------------

    // Collecting all new messages from discord server
    client.on("messageCreate", async (message) => {

      const authorId = new mongodb.Types.ObjectId(`${message.author.id.toString(16).padStart(24, '0')}`); // convert to hex and pad with zeros

      const memberFromDb = await Member.findById(authorId)
          if(memberFromDb){

            const guildId = new mongodb.Types.ObjectId(`${message.guildId.toString(16).padStart(24, '0')}`); // convert to hex and pad with zeros

            const newMessage = new Message({
              channelId: message.channelId,
              guild: guildId,
              id: message.id,
              createdTimestamp: message.createdTimestamp,
              type: message.type,
              content: message.content,
              author: authorId,
            })
            newMessage.save();  
      
            //Console.log messages for check on launch
            console.log(newMessage)
              
          } else {
              console.log(`Author NOT found in db for message: ${message.content}`)

              /*const newMember = new Member({
                  _id : memberId,
                  id: member.user.id,
                  name: member.user.username,
              })
              await newMember.save();*/
          }
      });

    // Simple action from command bot
    client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand()) return;
    
      if (interaction.commandName === 'ping') {
        await interaction.reply('Pong!');
      }
    });

  });

//LAUNCH THE DISCORDJS CLIENT TO CONNECT TO DISCORD'S API
await client.login(process.env.DISCORD_BOT_SECRET);

  //returns the client created to be used in routes or other modules
  return client;
}

//calling connectToDiscord to launch client. This function returns "client" to be used to interact with discord using discordJS
connectToDiscord();

module.exports = connectToDiscord;
