var express = require('express');
var router = express.Router();
const Message = require('../models/messages')
const { Client, GatewayIntentBits, ClientUser } = require('discord.js');
require('dotenv').config()
const connectToDiscord = require('../discord/connectBot')


router.get('/workspaces/:memberId', async (req, res, next) => {
  try {
    const client = await connectToDiscord();
    if (!client || !client.user) {
      return res.json({ result: false });
    }

    const botId = client.user.id;
    const newtableau = [];

    await client.guilds.fetch(); // Mettre à jour le cache des guildes du BOT

    for (const [guildId, guild] of client.guilds.cache) {
      try {
        const member = await guild.members.fetch(req.params.memberId);
        const mybot = guild.members.cache.get(botId);

        if (mybot && mybot.permissions.has('Administrator')) {
          const memberInfo = {
            guild_id: guild.id,
            guild_name: guild.name,
            guild_icon: guild.icon,
            user_id: member.id,
            username: member.user.username,
            roles_array: member.roles.cache.map((role) => role.id),
            permissions: member.permissions.toArray(),
          };

          if (memberInfo.permissions.includes('ManageGuild')) {
            newtableau.push(memberInfo);
          }
        }
      } catch (error) {
        //console.error("Erreur lors de la recherche de membres dans la guilde:", error);
      }
    }

    if (newtableau.length > 0) {
      res.json({ result: true, arraylength: newtableau.length, tableau: newtableau });
    } else {
      res.json({ result: false });
    }
  } catch (error) {
    console.error("Erreur lors de la connexion à Discord:", error);
    res.json({ result: false, error: "Erreur lors de la connexion à Discord" });
  }
});

router.get('/workspaces/:memberId/:guildId', async (req, res, next) => {
  const client = await connectToDiscord(process.env.DISCORD_BOT_SECRET)
//ma guilde : 1179468608410234941
//mon ID : 1044963840632303659
  if (client && client.user ) {//checker parce que parfois ça fait planter le lancement
    const botId = client.user.id;
    const theuser = [];
    const theguild = [];
    await client.guilds.fetch({ cache: false }); // mise à jour des guilds dans le cache
    if (client.guilds.cache.values()) {
      for (const guild of client.guilds.cache.values()) {
        // console.log('je veux l ID de ma guild: ', guild.id)
        if(guild.id ==req.params.guildId){
          await guild.members.fetch(); // mise à jour des membres dans le cache
        const mybot = guild.members.cache.get(botId);// robot ID
        for(let permission of mybot.permissions.toArray()){
          theguild.push(permission)
        }

        if (mybot.permissions.toArray().includes('Administrator')) {
          if (guild.members.cache.values()) {
            for (const member of guild.members.cache.values()) {
              console.log(member.user.id)
              if(member.user.id== req.params.memberId){
                let memberInfo = {
                  guild_id: member.guild.id,
                  guild_name: member.guild.name,
                  user_id: member.id,
                  username: member.user.username,
                  roles_array: member.roles.cache.map((role) => role.id),
                  permissions: member.permissions.toArray(),
                };
                if (memberInfo.permissions.includes('ManageGuild')) {
                  theuser.push(memberInfo);
                };
              }
              
            }
          }
        }
      }
        }

        
      res.send({ result: true, arraylength: theuser.length, permduuser: theuser[0].permissions, permdubot : theguild });
    }
  }
});

module.exports = router;