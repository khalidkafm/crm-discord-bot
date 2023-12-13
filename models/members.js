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
		avatar: {
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
			type: Number,
			required: false
		},
	}
));

module.exports = Member;