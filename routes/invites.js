var express = require('express');
var router = express.Router();
const Invite = require('../models/invites')
const { Client, GatewayIntentBits, ClientUser } = require('discord.js');
require('dotenv').config()
const {ObjectId} = require('mongodb');


router.put('/edit/:_id', function (req, res, next) {
    try {
        Invite.updateOne({_id: req.params._id}, {name: req.body.name, description: req.body.description}).then(()=>{
            Invite.findOne({_id: req.params._id}).then(data=>res.json({result:true, data: data}))
        })
    }catch(error){
        console.error(error)
    }
    
});

router.post('/newLink', function (req, res, next) {
    try {
        
        const newInvite = new Invite({
            discordId: req.body.discordId,
            code: "mockDataCode",
            name: req.body.name,
            description: req.body.description,
            guild: new ObjectId(req.body.guildId), 
            creator: "mockDataCreator",
        })
        newInvite.save().then(()=>{
            Invite.findOne().then(data=>res.json({result:true, data: data}))
            console.log('bravo')
        })
    }catch(error){
        console.error(error)
    }
    
});

module.exports = router;

// then(data =>
    // res.json({ result: true, data: data }))
// }catch(error){
// console.error(error)