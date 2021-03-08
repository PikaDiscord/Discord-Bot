const fs = require("fs");
const Discord = require("discord.js");
const { Token, default_prefix } = require("./config.json");
const db = require("quick.db");

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFolders = fs.readdirSync("./commands");

for (const folder of commandFolders) {
  const commandFiles = fs
    .readdirSync(`./commands/${folder}`)
    .filter(file => file.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    client.commands.set(command.name, command);
  }
}


const cooldowns = new Discord.Collection();

client.on("ready", () => {
  console.log(`Ready!`)
  const activities = [
    `${client.users.cache.size} Users`,
    `${client.channels.cache.size} Channels`,
    `${client.guilds.cache.size} Servers`,
  ];
  let i = 0;
  setInterval(() => client.user.setActivity(`${activities[i++ % activities.length]}`, { type: `WATCHING` }), 10000)
});

client.on("message", message => {
  let prefix = db.get(`prefix_${message.guild.id}`)
  if(prefix === null) prefix = default_prefix;
  if (message.content.match(new RegExp(`^<@!?${client.user.id}>`))) {
      const embed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setDescription(`My Default Prefix Is\`${default_prefix}\`\n My Prefix For This Server Is\`${prefix}\``)
      .setTimestamp()
    return message.channel.send(embed);
  }
})

client.on("message", message => {
if(!message.guild) return;
  let prefix = db.get(`prefix_${message.guild.id}`)
  if(prefix === null) prefix = default_prefix;

  
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content
    .slice(prefix.length)
    .trim()
    .split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command =
    client.commands.get(commandName) ||
    client.commands.find(
      cmd => cmd.aliases && cmd.aliases.includes(commandName)
    );

  if (!command) return;

  if (command.guildOnly && message.channel.type === "dm") {
    return message.reply("I can't Execute That Command Inside Dms!");
  }

  if (command.permissions) {
    const authorPerms = message.channel.permissionsFor(message.author);
    if (!authorPerms || !authorPerms.has(command.permissions)) {
      return message.reply("You Can Not Use This Command!");
    }
  }

  if (command.args && !args.length) {
    let reply = `You Didn't Provide Any Arguments, ${message.author}!`;

    if (command.usage) {
      reply += `\nThe Proper Usage Would Be: \`${prefix}${command.name} ${command.usage}\``;
    }

    return message.channel.send(reply);
  }

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(
        `Please Wait ${timeLeft.toFixed(
          1
        )} More Second(s) Before Reusing The \`${command.name}\` Command!`
      );
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply(
      "error"
    );
  }
});

client.login(Token);
