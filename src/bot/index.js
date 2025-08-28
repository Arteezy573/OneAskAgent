const { BotFrameworkAdapter } = require('botbuilder');
const TeamsBot = require('./teamsBot');

const adapter = new BotFrameworkAdapter({
    appId: process.env.TEAMS_APP_ID,
    appPassword: process.env.TEAMS_APP_PASSWORD
});

const bot = new TeamsBot();

adapter.onTurnError = async (context, error) => {
    console.error('[onTurnError]:', error);
    await context.sendActivity('❌ Sorry, I encountered an error. Please try again.');
};

const botHandler = (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        await bot.run(context);
    });
};

module.exports = {
    adapter,
    bot,
    botHandler
};