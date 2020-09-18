// Load the required modules.
const {Client, Collection, MessageEmbed} = require('discord.js')
, fs = require('fs')
, config = require('./config.json')
, { readdirSync } = require("fs")
, tools = require('./tools')
, client = new Client()
, cooldowns = new Collection();
client.commands = new Collection();
client.snipeMap = new Map();
client.editSnipeMap = new Map();

// Initialize **or load** the server configurations
const Enmap = require('enmap');

// I attach settings to client to allow for modular bot setups
// In this example we'll leverage fetchAll:false and autoFetch:true for
// best efficiency in memory usage. We also have to use cloneLevel:'deep'
// to avoid our values to be "reference" to the default settings.
// The explanation for why is complex - just go with it.
client.settings = new Enmap({
  name: "settings",
  fetchAll: false,
  autoFetch: true,
  cloneLevel: 'deep'
});

const defaultSettings = {	
  prefix: "~"		
}

// Load the command files from ./commands/
fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
.forEach(file => {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
	cooldowns.set(command.name, new Collection());
})
 

// Message handler, see https://discordjs.guide/command-handling/
client.on('message', async message => {
	// Ignore bot and non-command messages.
	// const {prefix} = config;
	  // We can use ensure() to actually grab the default value for settings,
  // if the key doesn't already exist. 
if(!message.guild) return;
  const guildConf = client.settings.ensure(message.guild.id, defaultSettings);

	const prefixMention = new RegExp(`^<@!?${client.user.id}> `);
	const prefix = !message.author.bot && message.content.match(prefixMention) ? !message.author.bot && message.content.match(prefixMention)[0] : guildConf.prefix;
	// const prefix = guildConf.prefix;
	if(!message.author.bot && message.content.match(new RegExp(`^<@!?${client.user.id}>( |)$`))){
		await message.channel.send('<a:hello:749646013488431194>')
		.then(msg => {
			setTimeout(function() {
				const embed = tools.embed('')
				embed.setDescription(`My prefixes are ${guildConf.prefix} and <@${client.user.id}>\nRun ${guildConf.prefix}setprefix <prefix> to change my prefix.`)
				embed.setFooter(`Run ${guildConf.prefix}help for more info!`)
				msg.edit(`<@${message.author.id}>`, embed)
			}, 3000);
	})
}

if(!message.author.bot && message.content.match(new RegExp(`^<@!?${client.user.id}> prefix`))){
			const embed = tools.embed('')
			embed.setDescription(`My prefixes are ${guildConf.prefix} and <@${client.user.id}>\nRun ${guildConf.prefix}setprefix <prefix> to change my prefix.`)
			embed.setFooter(`Run ${guildConf.prefix}help for more info!`)
			await message.channel.send(`<@${message.author.id}>`, embed);
}

if (!message.content.startsWith(prefix)) return;
if (message.author.bot) return;

// 
// 	
// 

	// Separate the message content into the command and arguments.
	const args = message.content.slice(prefix.length).split(' ');
	const commandName = args.shift().toLowerCase();
	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	// Exit if no command was found.
	if (!command) return;

	// If the user is on cooldown, exit.
	const {name, usage, cooldown = 2000, minArgs = 0, ownerOnly, guildOnly, requires, reqrole, run} = command;
	const timestamps = cooldowns.get(name);
	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldown;
		if (Date.now() < expirationTime) {
			const timeLeft = tools.timer(expirationTime);
			return tools.error(message, `<a:pepetime:756479898000031804> This command is in cooldown for **${timeLeft}**`);
		}
	}

	// If the command's requirements aren't met, exit.
	if (args.length < minArgs)
		return tools.error(message, `${name} requires at least ${minArgs} args: \`${usage}\``);
	if (ownerOnly && !config.owners.includes(message.author.id))
		return tools.error(message, `${name} is set to owner only`);
	if (guildOnly && !['text', 'news'].includes(message.channel.type))
		return tools.error(message, `${name} is set to guild only`);
	if (requires && !message.member.permissions.has(requires))
		return tools.error(message, `${name} requires the ${command.requires} permission`);
	if (reqrole && !message.member.roles.cache.some((r) => r.name === (reqrole)))
	return tools.error(message, `${name} requires the ${command.reqrole} role.`);

	// Run the command.
	try {
		const result = await run(client, message, args);
		if (result) {
			// If the command succeeded, send the result and set a cooldown.
			message.channel.send(result).catch(error => {
				if (error.code == 50013) {
					return message.channel.send('<a:aError:747343462042566706> I need `EMBED_LINKS` permissions!');
				}
			});
			timestamps.set(message.author.id, Date.now());
			setTimeout(() => timestamps.delete(message.author.id), cooldown);
		}
	} catch (error) {
			if (error.code == 50013) {
				return message.channel.send('<a:aError:747343462042566706> I need `EMBED_LINKS` permissions!');
			}else{
				tools.error(message, error.message);
			}
	}
})

.on('guildCreate', (guild) => {
    try {
        let bots = 0;
        let people = 0;
        guild.members.cache.forEach(mem => {
            if (mem.user.bot) { bots += 1; }
            else {
                people += 1;
            }
        });

        let logChannel = config.logChannel;

        let embed = tools.embed(`Just __joined__ ${guild.name} (${guild.id})`);
		embed.setDescription(`**${guild.owner.user.username}#${guild.owner.user.discriminator}** is the owner of the guild.\nGuild has **${guild.members.cache.size}** members.\n\n`);
		embed.addField("People: ", people, true);
		embed.addField("Bots: ", bots, true);
		embed.setTimestamp();

        client.channels.cache.get(logChannel).send(embed)
    } catch (err) {
        console.log(err);
    }
})

.on('guildDelete', (guild) => {
    try {
		client.settings.delete(guild.id);
        let logChannel = config.logChannel;

        let embed = tools.embed(`Just __left__ ${guild.name}`);
		embed.setDescription(`**${guild.owner.user.username}#${guild.owner.user.discriminator}** is the owner of the guild.\nGuild has **${guild.members.cache.size}** members.\n\n`);
		embed.setTimestamp();

        client.channels.cache.get(logChannel).send(embed)
    } catch (err) {
        console.log(err);
    }
})

// Save deleted messages so the snipe command can reveal them.
.on('messageDelete', message => {
	client.snipeMap.set(message.channel.id, {
		author: message.author.tag,
		content: message.content,
		attachments: message.attachments,
		embed: message.embeds[0]
	})
})

// Save edited messages so the editsnipe command can reveal them.
.on('messageUpdate', (oldMessage, newMessage) => {
	client.editSnipeMap.set(newMessage.channel.id, {
		author: newMessage.author.tag,
		oldContent: oldMessage.content,
		newContent: newMessage.content
	})
})

// If the amount of accessible guilds changes, update the status.
.on('guildCreate', guild => tools.setStatus(client))
.on('guildDelete', guild => tools.setStatus(client))

// When the bot logs in, set its status.
.on('ready', () => {
	tools.setStatus(client);
	console.log('ready!');
	const cuties = ['waking up 🥱', 'uwu 🥨', 'iyr is amazing', 'hewwo', 'aya is cute 😍', 'ready and waiting', 'aya is awesome'];
	const cutiesR = cuties[Math.floor(Math.random() * cuties.length)];
	let embed0 = tools.embed('<a:exclamationMark:746950886580027465> Booting up, Please standby!');
	embed0.setTimestamp();

	let embed1 = tools.embed('Successfully Restarted!');
	embed1.setTimestamp();
	embed1.setFooter(cutiesR);

const channelId = config.logChannel;
try {
	const channel = client.channels.cache.get(channelId);
	channel.send(embed0).then(msg => {
		setTimeout(function() {
			msg.edit({
				embed: embed1
			});
		}, 6000);
})
}
catch(e) {
	console.error(`Unable to find channel: ${channelId}`)
}
})

// Log in using the token file.
const token = fs.readFileSync('token.txt').toString();
client.login(token);