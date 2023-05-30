const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('users')
        .setDescription('Replies with the stored users!'),
    async execute(interaction) {

        const select = new StringSelectMenuBuilder()
            .setCustomId('select_users')
            .setPlaceholder('Authentificate yourself');
        // You have to change this to the active bots in your server 
        const options = [
            { label: 'Oussama', value: 'Oussama' },
            { label: 'Tommaso', value: 'Tommaso' },
            { label: 'Vincent', value: 'Vincent' }
        ];

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
    },
};