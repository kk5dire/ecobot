const { Command } = require('discord.js-commando');

module.exports = class MeowCommand extends Command {
	constructor(client) {
		super(client, {
            name: 'hi',
            aliases: ['mew', 'hello'],
			group: 'general',
			memberName: 'hi',
            description: 'Replies with a meow, kitty cat.',
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 10,
            },
		});
	}

	run(message) {
		return message.say('iy is lesbian');
	}
};