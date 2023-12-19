const { BOT_ID } = require('../config/secret.json');
const axios = require('axios');
const { logger } = require('./logger');
const { statyPing } = require('./tester');

const statyStarter = async (guildId, guild) => {
  try {
    const setup = await axios({
      method: "get",
      url: "http://localhost:3000/setup",
      params: {
        guild: guildId
      },
      headers: {
        statyid: BOT_ID
      }
    });

    if(setup.data.data) {
      const { role, channel } = setup.data.data;
      const statsChannel = guild.channels.cache.find(statsChannel => statsChannel.id === channel);

      // List all guildId api
      try {
        const allApiRequest = await axios({
          method: "get",
          url: "http://localhost:3000/api/all",
          params: {
              guild: guildId
          },
          headers: {
            statyid: BOT_ID
          }
        });

        const allApiList = allApiRequest.data.data;
        let pingArray = [];

        // Lancement de tout les pings

        allApiList.map((item, index) => {
          statyPing(item, {
            state: statsChannel,
            role: role,
            guild: guild
          });

          pingArray.push(item.api_name);
        });

        const allThreads = statsChannel.threads.cache;
        await allThreads.map(thread => {
          if(pingArray.indexOf(thread.name.slice(3)) < 0) {
            try { thread.delete(); }
            catch(error) { logger(`🔴 | ${error}`); }
          }
        });

      }
      catch(error) {
        logger(`🔴 [starter:get_all_api] ${error}`);
      }
    }
  }
  catch(error) {
    logger(`🔴 [starter:get_setup] ${error}`);
  }
}

const newApiStarter = async (guildId, guild, apiId) => {
  try {
    const setup = await axios({
      method: "get",
      url: "http://localhost:3000/setup",
      params: {
        guild: guildId
      },
      headers: {
        statyid: BOT_ID
      }
    });

    if(setup.data.data) {
      const { role, channel } = setup.data.data;
      const statsChannel = guild.channels.cache.find(statsChannel => statsChannel.id === channel);

      // List all guildId api
      try {
        const apiRequest = await axios({
          method: "get",
          url: `http://localhost:3000/api/${apiId}`,
          headers: {
            statyid: BOT_ID
          }
        });

        const apiList = apiRequest.data.data;
        let pingArray = [];

        statyPing(apiList, {
          state: statsChannel,
          role: role,
          guild: guild
        });
        pingArray.push(apiList.api_name);

        const allThreads = statsChannel.threads.cache;
        await allThreads.map(thread => {
          if(pingArray.indexOf(thread.name.slice(3)) < 0) {
            try { thread.delete(); }
            catch(error) { logger(`🔴 | ${error}`); }
          }
        });
      }
      catch(error) {
        logger(`🔴 [starter:get_all_api] ${error}`);
      }
    }
  }
  catch(error) {
    logger(`🔴 [starter:get_setup] ${error}`);
  }
}

module.exports = { statyStarter, newApiStarter }