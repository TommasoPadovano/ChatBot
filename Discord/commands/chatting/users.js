const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder } = require('discord.js');
const UserService = require('../../../modules/UserService');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('users')
        .setDescription('Replies with the stored users!'),
    async execute(interaction) {

        const select = new StringSelectMenuBuilder()
            .setCustomId('select_users')
            .setPlaceholder('Authentificate yourself');
        
        UserService.getUsers().then(async (results) => {
            let options = [];
            results.forEach((result)=>{
                let option = {
                    label: result.username,
                    value: result.username,
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
                content: 'Choose the user',
                components: [row],
                ephemeral: true
            });
        })
    },
};