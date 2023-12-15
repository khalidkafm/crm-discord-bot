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
  const client = await connectToDiscord()
  
// à améliorer car lorsque le client n'est pas 'on', la route dans le vide indéfiniment
// avec setTimeOut, ça devrait être corrigé
try {
  if (client && client.user) {
    const botId = client.user.id;
    console.log(botId)
    const newtableau = [];
    await client.guilds.fetch(); // mise à jour des guilds du BOT dans le cache
    if (client.guilds.cache) {
      for (const guild of client.guilds.cache.values()) {// vérif guild par guild
        try{
          await guild.members.fetch({ user: req.params.memberId }); // guilds auxquelles on a accès et où le user est connecté 
        }catch(error){
          console.error("Erreur lors de la recherche de guilds:", error);
        }
        const mybot = guild.members.cache.get(botId);// BOT ID 
        if (mybot.permissions.toArray().includes('Administrator')) {// où mon BOT est administrateur
          if (guild.members.cache) {//vérif qu'on a une valeur pour continuer la logique
            for (const member of guild.members.cache.values()) {//on passer par chaque member pour remplir l'objet memberInfo
              let memberInfo = {// objet Membre, on aura que les membres dont l'ID sera celui de l'USER
                guild_id: member.guild.id,
                guild_name: member.guild.name, 
                user_id: member.id,
                username: member.user.username,
                roles_array: member.roles.cache.map((role) => role.id),
                permissions: member.permissions.toArray(),

              };
              if (memberInfo.permissions.includes('ManageGuild')) {//si le membre a le droit manageGuild, on le push dans notre tableau
                newtableau.push(memberInfo);
              }
            }
          }
        }
      }
      if(newtableau[0]){
        res.json({ result: true, arraylength: newtableau.length, tableau: newtableau, });
      }else{
        res.json({result: false});
      }
    }
  }
}
  catch (error) {
    console.error("Erreur lors de la connexion à Discord:", error);
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