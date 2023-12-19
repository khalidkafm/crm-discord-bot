const mongodb = require("mongoose");

const Member = mongodb.models.Member || mongodb.model("Member",
new mongodb.Schema(
	{
        discordId: {
			type: String,
			required: false
		},
		username: {
			type: String,
			required: true
		},
		globalName: {
			type: String,
			required: false
		},
		discriminator: {
			type: String,
			required: false
		},
		isBot: {
			type: Boolean,
			required: false
		},
		isSystem: {
			type: Boolean,
			required: false
		},
		avatar: {
			type: String,
			required: false
		},
		banner: {
			type: String,
			required: false
		},
		permissions: {
			type: [String], // This specifies that "roles" is an array of strings
			required: false
		}, 
        roles: {
			type: [String], // This specifies that "roles" is an array of strings
			required: false
		},
        joinedTimestamp: {
			type: Date,
			required: false
		},
		premiumSinceTimestamp: {
			type: Date,
			required: false
		},
	}
));

module.exports = Member;