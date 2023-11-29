// NOT USED AT THE MOMENT

const { REST, Routes } = require('discord.js') ;

console.log('reading registerCommand out')

// Register a slash command

const registerDiscordCommand = async (clientId, token) => {

    console.log('reading registerCommand in')

    const commands = [
    {
        name: 'ping',
        description: 'Replies with Pong!',
    },
    ];

    const rest = new REST({ version: '10' }).setToken(token);

    try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(clientId), { body: commands });

    console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
    console.error(error);
    }
}

module.exports = registerDiscordCommand;








