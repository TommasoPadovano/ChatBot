const { SlashCommandBuilder } = require('discord.js');
const { loadBrain, getBotReply } = require('../../../script/bot.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chat')
        .setDescription('Replies using RiveScript!')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message that we want the bot to reply to!')
                .setRequired(true)),
    async execute(interaction) {
        if (typeof selectedUser === 'undefined') {
            await interaction.reply({ content:'Please select the user first using /users.',  ephemeral: true });
            return;
        }
        if (typeof selectedBot === 'undefined') {
            await interaction.reply({ content:'Please select a bot first using /available_bots.', ephemeral: true });
            return;
        }

        const message = interaction.options.getString('message');
        await loadBrain(`../assets/data/brain.rive`);
        const botReply = await getBotReply(message);
        await interaction.reply(`${selectedBot}: ${botReply}`);
    },
};
