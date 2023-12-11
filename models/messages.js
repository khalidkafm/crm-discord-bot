const mongodb = require("mongoose");

const Message = mongodb.models.Message || mongodb.model("Message",
new mongodb.Schema(
	{
		channelId: {
			type: String,
			required: true
		},
        guildId: {
			type: String,
			required: true
		},
        id: {
			type: String,
			required: true
		},
        createdTimestamp: {
			type: Number,
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
			type: String,
			required: true
		}		
	}
));

module.exports = Message;