require('dotenv').config()
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const mongodb = require('mongoose');
const Message = require ('../models/messages');
const Guild = require ('../models/guilds');
const Member = require ('../models/members');
const upsertAllGuildInvites = require('../utils/upsertAllGuildInvites');
const saveJoinEvent = require('../utils/saveJoinEvent');
const upsertMemberInDb = require('../utils/upsertMemberInDb');
const upsertGuildInDb = require('../utils/upsertGuildInDb');
const upsertInviteInDb = require('../utils/upsertGuildInviteInDb');
const discordToMongoId = require('../utils/idConversion/discordToMongoId');
const mongoToDiscordId = require('../utils/idConversion/mongoToDiscordId');
const saveMessage = require ('../utils/saveMessage')

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

      // Updating the guild in DB 
      const guildFromDb = await upsertGuildInDb(guild)

      //to clean after checkup
      //const guildId = guildFromDb._id

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
        await upsertAllGuildInvites( guildFromDb , codes);

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
      const guildFromDb = await upsertGuildInDb(guild)

      // We've been added to a new Guild. Let's fetch all the invites, and save it to our cache
      const firstInvites = await guild.invites.fetch();

      // Set the key as Guild ID, and create a map which has the invite code, and the number of uses
      invites.set(guild.id, new Collection(firstInvites.map((invite) => [invite.code, invite.uses])));
      // Saving guild Invites in DB 
      try { 
        // convert firstInvites array to invite codes array
        const codes = firstInvites.map((invite) => invite.code);
        // saving codes to db
        await upsertAllGuildInvites( guildFromDb , codes);

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
      // A real basic message with the information we need. 
      const saveOk = await saveJoinEvent(timestamp, member, invite)
      console.log('joinEvent saved in db : ', saveOk)
    });

    //---------------------------------------------------------------------------------------------------------
    //
    //              SAVING MESSAGES TO DB (only from tracked members)
    //
    //---------------------------------------------------------------------------------------------------------

    // Collecting all new messages from discord server
    client.on("messageCreate", async (message) => {


      const memberFromDb = await Member.findById(discordToMongoId(message.author.id))
          if(memberFromDb){

            const savedMessage = await saveMessage(message);
            console.log('saved message: ', savedMessage._id)
              
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
