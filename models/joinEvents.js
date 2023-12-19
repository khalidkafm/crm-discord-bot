const mongodb = require("mongoose");

const JoinEvent = mongodb.models.JoinEvent || mongodb.model("JoinEvent",
new mongodb.Schema(
	{
		timestamp: {
			type: Date,
			required: true
		},
		guild: {
			type: mongodb.Schema.Types.ObjectId,
			ref: 'Guild',
			required: false
		},
		member: {
			type: mongodb.Schema.Types.ObjectId,
			ref: 'Member',
			required: true
		},
		invite: {
			type: mongodb.Schema.Types.ObjectId,
			ref: 'Invite',
			required: false
		},
		
	}
));

module.exports = JoinEvent;