const RiveScript = require('rivescript');

// Create a new RiveScript interpreter instance
const bot = new RiveScript();

// Load your brain.rive file
bot.loadFile('../assets/data/brain.rive')
    .then(loading_done)
    .catch(loading_error);

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
    getBotReply
}