var express = require('express');
var router = express.Router();
const Message = require('../models/messages')
const { Client, GatewayIntentBits, ClientUser } = require('discord.js');
require('dotenv').config()
const connectToDiscord = require('../discord/connectBot')

/* GET home page. */
router.get('/', function (req, res, next) {
  Message.find()
    .then(data => res.json({ data }))
});

// router.get('/guilds', async (req, res, next) => {
//   const client = await connectToDiscord(process.env.DISCORD_BOT_SECRET)
//   let guildes = [];

//   let guildesouonestadmin = [];

//   await client.guilds.fetch()
//   for(let guild of client.guilds.cache.values()){
//     guildes.push(guild)

//     console.log(guild)
//   }

//     res.send({ result: true, guildes: guildes, nbr: guildes.length })

// })

router.get('/workspaces/:memberId', async (req, res, next) => {
  const client = await connectToDiscord(process.env.DISCORD_BOT_SECRET)

  if (client) {
    const botId = client.user.id;
    const newtableau = [];
    await client.guilds.fetch({ cache: false }); // mise à jour des guilds dans le cache
    if (client.guilds.cache.values()) {
      for (const guild of client.guilds.cache.values()) {
        await guild.members.fetch({ user: "870287994173661254" }); // mise à jour des membres dans le cache
        const mybot = guild.members.cache.get(botId);// robot ID
        if (mybot.permissions.toArray().includes('Administrator')) {
          if (guild.members.cache.values()) {
            for (const member of guild.members.cache.values()) {
              let memberInfo = {
                guild_id: member.guild.id,
                guild_name: member.guild.name,
                user_id: member.id,
                username: member.user.username,
                roles_array: member.roles.cache.map((role) => role.id),
                permissions: member.permissions.toArray(),
              };
              if (memberInfo.permissions.includes('ManageGuild')) {
                newtableau.push(memberInfo);
              }
            }
          }
        }
      }
      res.send({ result: true, arraylength: newtableau.length, tableau: newtableau, });
    }
  }
});

module.exports = router;