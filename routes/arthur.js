var express = require('express');
var router = express.Router();
const Message = require('../models/messages')

/* GET home page. */
router.get('/', function(req, res, next) {

    // Initialize the invite cache
    const invites = new Collection();

    // A pretty useful method to create a delay without blocking the whole script.
    const wait = require("timers/promises").setTimeout;

    client.on("ready", async () => {
    // "ready" isn't really ready. We need to wait a spell.
    await wait(1000);

    // Loop over all the guilds
    client.guilds.cache.forEach(async (guild) => {
        // Fetch all Guild Invites
        const firstInvites = await guild.invites.fetch();
        // Set the key as Guild ID, and create a map which has the invite code, and the number of uses
        invites.set(guild.id, new Collection(firstInvites.map((invite) => [invite.code, invite.uses])));
    });

    console.log(invites)

});

});

module.exports = router;