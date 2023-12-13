const mongodb = require("mongoose");

const Guild = mongodb.models.Guild || mongodb.model("Guild",
new mongodb.Schema(
	{
        discordId: {
			type: String,
			required: true
		},
		name: {
			type: String,
			required: true
		},
		icon: {
			type: String,
			required: false
		},
		permissions: {
			type: String,
			required: false
		}, 
		ownerId: {
			type: String,
			required: false
		},
        joinedTimestamp: {
			type: Number,
			required: true
		},
	}
));

module.exports = Guild;