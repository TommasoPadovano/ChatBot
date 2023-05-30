const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder } = require('discord.js');
const BotService = require('../../../modules/BotService');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('available_bots')
        .setDescription('Replies with the active bots!'),
    async execute(interaction) {

        const select = new StringSelectMenuBuilder()
            .setCustomId('select_bot')
            .setPlaceholder('Select your Bot');
        

        BotService.getBotsActiveOnDiscord().then(async (results) => {
            const options = [];
            results.forEach((bot) =>{
                let option = {
                    label: bot.name,
                    value: bot.name,
                }
                options.push(option);
            })

            options.forEach(option => {
                select.addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel(option.label)
                        .setValue(option.value)
                );
            });
    
            const row = new ActionRowBuilder()
                .addComponents(select);
    
            await interaction.reply({
                content: 'Select the bot you want to chat with!',
                components: [row],
                ephemeral: true
            });
        });
    },
};