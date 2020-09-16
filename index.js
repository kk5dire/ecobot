const { CommandoClient } = require('discord.js-commando');
const path = require('path');

const client = new CommandoClient({
	commandPrefix: '~',
	owner: '686039988605026304',
    invite: 'https://discord.gg/bRCvFy9',
    unknownCommandResponse: false,
});

client.registry
	.registerDefaultTypes()
	.registerGroups([
		['general', 'Your First Command Group'],
		['economy', 'Your Second Command Group'],
	])
	.registerDefaultGroups()
	.registerDefaultCommands()
    .registerCommandsIn(path.join(__dirname, 'commands'));

    // .registerDefaultCommands({
    //     help: false,
    // })

client.once('ready', () => {
        console.log(`Logged in as ${client.user.tag}! (${client.user.id})`);
        client.user.setActivity('with Commando');
});
    
client.on('error', console.error);

client.login('NzU2MjQyMDgwMzIxMzcyMTky.X2O_Ug.tVY7tdTn7xrLSAl9dujsryjP3Dc');