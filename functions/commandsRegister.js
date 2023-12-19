const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');
const { BOT_ID, BOT_TOKEN } = require('../config/secret.json');
const { database } = require('../config/global.json');
const { logger } = require('../functions/logger');

const commands = [];
const foldersPath = path.join(__dirname, '../commands');
const commandFolders = fs.readdirSync(foldersPath);

let client;

for(const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for(const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if('data' in command) {
            commands.push(command.data);
        } else {
            logger(`🔴 [commands:register][WARNING] The command at ${filePath} is missing a required "data" property.`);
        }
    }
}

const commandRegister = async (GUILD_ID) => {
    const rest = new REST().setToken(BOT_TOKEN);
    const guildName = client.guilds.cache.find(guild => guild.id === GUILD_ID).name;
    (async () => {
        try {
            await logger(`🚀 [commands:register] Started refreshing ${commands.length} application (/) commands for ${guildName}.`);
            const data = await rest.put(
                Routes.applicationGuildCommands(BOT_ID, GUILD_ID),
                { body: commands },
            );
            logger(`🟢 [commands:register] Successfully reloaded ${data.length} application (/) commands for ${guildName}.`);
        }
        catch (error) { console.error(error); }
    })();
}

const commandRegisterInit = async (clientItem) => {
    client = clientItem;

    try {
        const clientGuildQuantity = client.guilds.cache.map(guild => guild.id).length;
        const clientGuildIds = client.guilds.cache.map(guild => guild.id);

        for(let i = 0;i < clientGuildQuantity;i++) {
            await commandRegister(clientGuildIds[i]);
        }
    }
    catch(error) { logger(`🔴 [commands:register:init] ${error}`); }
}

module.exports = { commandRegister, commandRegisterInit };