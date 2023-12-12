const mongodb = require("mongoose");

const Message = mongodb.models.Message || mongodb.model("Message",
new mongodb.Schema(
	{
		channelId: {
			type: String,
			required: true
		},
        guild: {
			type: mongodb.Schema.Types.ObjectId,
			ref: 'Guild',
			required: true
		},
        id: {
			type: String,
			required: true
		},
        createdTimestamp: {
			type: String,
			required: true
		},
        type: {
			type: Number,
			required: true
		},
        content: {
			type: String,
			required: false
		},
        author: {
			type: mongodb.Schema.Types.ObjectId,
			ref: 'Member',
			required: true
		},	
	}
));

module.exports = Message;