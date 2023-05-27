const { SlashCommandBuilder } = require('discord.js');
const { getBotReply } = require('../../../script/bot.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chat')
        .setDescription('Replies using RiveScript!')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message that we want the bot to reply to!')
                .setRequired(true)),
    async execute(interaction) {
        if (typeof selectedBot === 'undefined') {
            await interaction.reply('Please select a bot first using /available_bots.');
            return;
        }

        const message = interaction.options.getString('message');
        const botReply = await getBotReply(message);
        await interaction.reply(`${selectedBot}: ${botReply}`);
    },
};
