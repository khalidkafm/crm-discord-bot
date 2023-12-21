var express = require('express');
var router = express.Router();
const Invite = require('../models/invites')
const { Client, GatewayIntentBits, ClientUser } = require('discord.js');
require('dotenv').config()
const { ObjectId } = require('mongodb');
const discordToMongoId = require('../utils/idConversion/discordToMongoId');
const connectToDiscord = require('../discord/connectBot')


router.put('/edit/:_id', function (req, res, next) {
    try {
        Invite.updateOne({ _id: req.params._id }, { name: req.body.name, description: req.body.description }).then(() => {
            Invite.findOne({ _id: req.params._id }).then(data => res.json({ result: true, data: data }))
        })
    } catch (error) {
        console.error(error)
    }

});



router.post('/newLink', async (req, res, next) => {
    try {
        const client = await connectToDiscord("MTE3OTExMjI5NjQxMzQxNzU4NA.Go96Yl.pym5GrhFzkiop_IKq8D-zvNGYuoqdS_slPyGU8");
        // const guildId = req.body.guild
        const guildId = req.body.guild;
        const guild = await client.guilds.fetch(guildId);

        const textChannels = guild.channels.cache.filter(channel => channel.type == '0');
        // console.log(textChannels)
        if (textChannels.size > 0) {
            const textChannel = textChannels.first();
            const invite = await textChannel.createInvite({ maxAge: 0, unique: true });
            
            const newInvite = new Invite({
                code: invite.code,
                name: req.body.name,
                description: req.body.description,
                guild: new ObjectId(discordToMongoId(guildId)),
                // creator: req.body.creator, // not necessary
            });

            newInvite.save().then(() => {
                Invite.findOne({code: invite.code}).then(data => res.json({ result: true, data: data }));
                
            });
        } else {
            res.status(500).json({ result: false, error: 'Aucun canal texte trouvé dans le serveur.' });
        }
    } catch (error){
        console.error("error")
        res.status(500).json({ result: false, error: error.message });
    }

})



module.exports = router;

