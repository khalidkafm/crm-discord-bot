var express = require('express');
var router = express.Router();

// Importez les modules nécessaires de DiscordJS for fetching guilds
const { Client, GatewayIntentBits } = require("discord.js");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


/* POST user guilds with user accessToken. */
router.post('/guilds', function(req, res, next) {

  const getUserGuilds = async (token) => {

    const encodedUserGuilds = await fetch('https://discord.com/api/users/@me/guilds', {
			headers: {
				authorization: `${'Bearer'} ${token}`,
			},
		})

    const userGuilds = await encodedUserGuilds.json();

		console.log(userGuilds)
    res.json({
      result: true, 
      userGuilds,
    })
  }

  if (req.body && req.body.accessToken){
    console.log('access token : ', req.body.accessToken)
    getUserGuilds(req.body.accessToken)
  } else {
    res.json({
      result: false, 
      message: "accessToken missing in request body"
    })
  }
	
  // END MANAGING GUILDS
});



module.exports = router;
