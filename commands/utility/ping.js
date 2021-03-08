module.exports = {
	name: 'ping',
  cooldown: 5,
	execute(message) {
		message.channel.send('${client.ws.ping} ms ');
	},
};
