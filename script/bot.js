const RiveScript = require('rivescript');

// Create a new RiveScript interpreter instance
const bot = new RiveScript();

// Load your brain.rive file
async function loadBrain(brain) {
    try {
        const result = await bot.loadFile(brain);
        return loading_done(result);
    } catch (error) {
        return loading_error(error);
    }
}

// Set up a function to get a response based on user input
function getBotReply(message) {
    return bot.reply("local-user", message);
}

function loading_done() {
    bot.sortReplies();
}

function loading_error(error, filename, lineno) {
    console.log("Error when loading files: " + error);
}

module.exports = {
    getBotReply,
    loadBrain
}