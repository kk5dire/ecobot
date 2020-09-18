const tools = require('../tools');
const {categories} = require('../config.json');

module.exports = {
	name: 'help',
	category: 'General',
	aliases: ['?'],
	description: "Shows the command list or command info.",
	usage: '[command]',
	async run(client, message, [commandName]) {
		const prefix = client.settings.get(message.guild.id, "prefix");
		if (commandName) {
			// If a command was specified, find the command's info.
			const command = message.client.commands.get(commandName)
			|| message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

			// If no command was found, exit.
			if (!command) return tools.error(message, 'Invalid command');
			const cltime = command.cooldown/1000;
			// Format the command's info into an embed.
			const embed = tools.embed(`${command.name} command`)
			let desc = '';
			if (command.aliases) desc += `Aliases: ${command.aliases.join(', ')}\n`;
			if (command.category) desc += `Category: ${command.category}\n`;
			if (command.description) desc += `Description: ${command.description}\n`;
			if (command.usage) desc += `Usage: ${command.usage}\n`;
			if (command.requires) desc += `Requires: ${command.requires}\n`;
			if (command.cooldown) desc += `Cooldown: ${cltime} seconds\n`;
			// if (command.guildOnly) desc += `This command is guild only.\n`;
			if (command.ownerOnly) desc += `This command is owner only.`;

			// Send the embed.
			return embed.setDescription(`\`\`\`${desc}\`\`\``);
		} else {
			// If no command was specified, show every command in a list.
			const embed = tools.embed(`Command List`);
			embed.setDescription(`Run \`${prefix}help <command_name>\` to view help on a command.`);
			embed.setThumbnail(client.user.displayAvatarURL());
			// Create a command list for each command category.
			categories.forEach(category => {
				let list = '';
				message.client.commands.forEach(command => {
					if (command.category != category) return;
					list += `\`${command.name}\`, `
				})
				embed.addField(category, list.slice(0, -2));
			})

			// Send the embed.
			return embed;
		}
	}
}

