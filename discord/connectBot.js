const { Client, GatewayIntentBits } = require('discord.js');
const Message = require ('../models/messages')
require('dotenv').config()

// Adding bot link
// https://discord.com/api/oauth2/authorize?client_id=1174752417791889448&permissions=8&scope=bot


console.log('reading discord setup out')

let client;

async function connectToDiscord(token) {

  console.log('reading discord setup in')

  if (client) {
    return client;
  }

  client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
      // Ajoutez d'autres intents au besoin
    ],
  });

  client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });

  // Collecting all new messages from discord server
  client.on("messageCreate", (message) => {

  const newMessage = new Message({
    channelId: message.channelId,
    guildId: message.guildId,
    id: message.id,
    createdTimestamp: message.createdTimestamp,
    type: message.type,
    content: message.content,
    author: message.author.username,
  })
  newMessage.save();  
  console.log(message)

  })

  // RECEIVE GUILD MEMBERS ADD
  client.on('guildMemberAdd', (member) => {
    // Code à exécuter lorsque qu'un membre rejoint une guilde
    console.log(`${member.user.tag} a rejoint la guilde ${member.guild.name}`);
  });

  // RECEIVE INVITE CREATION AND CHECK IF BOT
  client.on('inviteCreate', (invite) => {
    // Code à exécuter lorsque qu'une invitation est créée
    console.log(`Une invitation a été créée : ${invite.url}`);
  
    // Vérifie si le bot a été ajouté à une guilde via cette invitation
    if (invite.bot && invite.bot.id === client.user.id) {
      console.log(`Le bot a été ajouté à la guilde via cette invitation.`);
    }
  });

    // Setting bot presence display
    /*client.user.setPresence({
        activities: [{
            name: "analysing"
        }],
        status: "dnd"
    });*/

    // Simple action from command bot
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isChatInputCommand()) return;
      
        if (interaction.commandName === 'ping') {
          await interaction.reply('Pong!');
        }
      });


///LOGIN TO DISCORD API
await client.login(token);

  return client;
}

connectToDiscord(process.env.DISCORD_BOT_SECRET);

module.exports = connectToDiscord;
