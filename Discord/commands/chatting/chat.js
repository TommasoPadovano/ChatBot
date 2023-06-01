const { SlashCommandBuilder } = require('discord.js');
const { loadBrain, getBotReply } = require('../../../script/bot.js');
const BotService = require('../../../modules/BotService');

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
            await interaction.reply({ content: 'Please select the user first using /users.', ephemeral: true });
            return;
        }
        if (typeof selectedBot === 'undefined') {
            await interaction.reply({ content: 'Please select a bot first using /available_bots.', ephemeral: true });
            return;
        }

        const message = interaction.options.getString('message');
        let selectedBotId = await BotService.findBotIdByName(selectedBot[0]);
        let botbrains = await BotService.getBotBrains(selectedBotId);//here we should have the selected bot id
        let brainPaths = botbrains.map(botbrain => `./assets/data/${botbrain.name}`);

        // Now you can load each brain in a loop
        for (let path of brainPaths) {
            await loadBrain(path);
        }

        const botReply = await getBotReply(message);
        //saves the interaction in the database
        BotService.saveMessages(selectedBotId, selectedUser[0], message, botReply).then(async () => {
            await interaction.reply({ content: `${selectedBot}: ${botReply}`, ephemeral: true });
        });
    },
};
