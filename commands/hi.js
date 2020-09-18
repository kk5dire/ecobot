const tools = require('../tools');
// const {} = require('discord.js');
// const {} = require('../config.json');

module.exports = {
	name: 'hi',
	category: "Economy",
	aliases: ["hello"],
	description: "Hiii",
	minArgs: 0,
	cooldown: 5000,
	ownerOnly: false,
	guildOnly: false,
	async run(client, message, args) {
		const embed = tools.embed('Meow!');
		message.channel.send(embed);
		return message.channel;
	}
}