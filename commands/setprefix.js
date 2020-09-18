const tools = require('../tools');
// const {} = require('discord.js');
// const {} = require('../config.json');
const {settings} = require('enmap');

module.exports = {
	name: 'setprefix',
	category: "Server Settings",
	description: "Change prefix for this server",
	usage: '<prefix>',
	requires: 'ADMINISTRATOR',
	minArgs: 1,
	cooldown: 5000,
	ownerOnly: false,
	guildOnly: true,
	async run(client, message, args) {
		const prop = 'prefix'
		const value =args.join(' ');

		client.settings.set(message.guild.id, value, prop);

		return tools.embed(`Server ${prop} changed to: ${value}`);
	}
}