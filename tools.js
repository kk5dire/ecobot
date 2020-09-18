const {MessageEmbed} = require('discord.js');
const config = require('./config.json');

module.exports = {
	embed(title) {
		return new MessageEmbed()
		.setTitle(title)
		.setColor(0x2F3136)
		// .setFooter('dsc.bio/IYR');
	},

	error(message, error) {
		const embed = this.embed('<a:aError:747343462042566706> Error')
		.setDescription(error);
		message.channel.send(embed).catch(error => {
			if (error.code == 50013) {
				return message.channel.send('<a:aError:747343462042566706> I need `EMBED_LINKS` permissions!');
			}
		});
		return false;
	},

	timer(timestamp) {
		const timeLeft = timestamp - Date.now();
		const days = Math.floor(timeLeft / 86400000);
		const hours = Math.floor(timeLeft / 3600000) - (days * 24);
		const minutes = Math.floor(timeLeft / 60000) - (days * 1440) - (hours * 60);
		const seconds = Math.floor(timeLeft / 1000) - (days * 86400) - (hours * 3600) - (minutes * 60);
		string = '';
		if (days) string = string + `${days}d `;
		if (hours) string = string + `${hours}h `;
		if (minutes) string = string + `${minutes}min `;
		if (seconds) string = string + `${seconds}sec`;
		if (!string.length) string = `${timeLeft}ms`;
		return string;
	},

	setStatus(client) {
		const guildCount = client.guilds.cache.size;
		client.user.setActivity(`${config.prefix}help in ${guildCount} servers`, {type: 'WATCHING'});
// 		    // List of available statuses
// const statuses = [
//     {status: 'online', activity: {name: `for ${config.prefix}help in ${guildCount} servers`, type: 'WATCHING'}},
// 	{status: 'dnd', activity: {name: `with Iyr & Aya ❤`, type: 'PLAYING'}}
//     // `responding to ${config.prefix}help in ${guildCount} servers`, `with Iyr & Aya ❤`
// ];

// setInterval(() => {
// const st = Math.floor(Math.random() * (statuses.length -1) +1);
//      client.user.setPresence(st);
// }, 20000);
	}
}