const Discord = require("discord.js")

module.exports = {
  name: 'purge',
  description: 'Deletes Up To 99 Messages.',
  aliases: ['clear', 'prune'],
  usage: '[number]',
  cooldown: 3,
  execute(message, args, client) {
   if (!message.member.hasPermission("MANAGE_MESSAGES"))
      return message.channel.send(
        "You Need The `Manage Messages` Permission To Use This Command!"
      );

    if (!args[0])
      return message.channel.send(`Please Give Me Amounts Of Messages!`);

    if (isNaN(args[0]))
      return message.channel.send(`Please Give Me Number Value!`);

    if (args[0] < 4)
      return message.channel.send(
        `You Can Delete ${args[0]} By Your Self`
      );

    if (args[0] > 100)
      return message.channel.send(
        `I Can't Delete ${args[0]} Because Of Discord Limit!`
      );

    let Reason = args.slice(1).join(" ") || "No Reason Provided!";

    message.channel.bulkDelete(args[0]).then(Message => {
      let embed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setTitle(`Messages Deleted!`)
        .addField(`Moderator`, `${message.author}`)
        .addField(`Deleted Messages`, `${Message.size}`)
        .addField(`Reason`, `${Reason}`)
        .setFooter(`trying to hide something?`)
        .setTimestamp();
      return message.channel
        .send(embed)
        .then(msg => msg.delete({ timeout: 100000 }));
    });
  }
};
