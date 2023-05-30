const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('available_bots')
        .setDescription('Replies with the active bots!'),
    async execute(interaction) {

        const select = new StringSelectMenuBuilder()
            .setCustomId('select_bot')
            .setPlaceholder('Select your Bot');
        // You have to change this to the active bots in your server 
        const options = [
            { label: 'Bulbasaur', description: 'The dual-type Grass/Poison Seed Pokémon.', value: 'Bulbasaur' },
            { label: 'Charmander', description: 'The Fire-type Lizard Pokémon.', value: 'Charmander' },
            { label: 'Squirtle', description: 'The Water-type Tiny Turtle Pokémon.', value: 'Squirtle' }
        ];

        options.forEach(option => {
            select.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(option.label)
                    .setDescription(option.description)
                    .setValue(option.value)
            );
        });


        const row = new ActionRowBuilder()
            .addComponents(select);

        await interaction.reply({
            content: 'Select the bot you want to chat with!',
            components: [row],
        });
    },
};