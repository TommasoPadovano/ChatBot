const bot = require("./Bot.js");

const express = require('express');
const bodyParser = require('body-parser');
//const cors = require('cors');
//const RiveScript = require('rivescript');

const INIT_PORT = 4001;

const activeBots = [];

class BotService {

  constructor(data) {
  }

  static async create(id, brains, mouths, name, image) {
    const bot = new bot({ id, brains, mouths, name, image });
    await bot.initialize();
    return bot;
  }

  static async addBot(bot) {
    //depends on the database we use
    console.log('Adding bot');
  }

  //from PUT
  async replaceBot(id, aBot) {
    //depends on the database we use   
  }

  //from PATCH
  async updateBot(id, aBot) {
    //depends on the database we use
  }

  async removeBot(id) {
    //depends on the database we use
  }

  getBot(id) {
    //depends on the database we use
  }

  getBots() {
    //depends on the database we use
  }

  async initialize() {
    // initialize bot database here
    // e.g., connect to a database server, load files, etc.
    // set up any other necessary resources
  }

  async addBrain(brain) {
    this.brains.push(brain);
    return `added brain ${brain}`;
  }

  async removeBrain(brain) {
    const index = this.brains.findIndex((e) => e === brain);
    if (index > -1) {
      this.brains.splice(index, 1);
      return `removed brain ${brain}`;
    }
    throw new Error(`cannot find brain ${brain}`);
  }

  async addMouth(mouth) {
    this.mouths.push(mouth);
    return `added mouth ${mouth}`;
  }

  async removeMouth(mouth) {
    const index = this.mouths.findIndex((e) => e === mouth);
    if (index > -1) {
      this.mouths.splice(index, 1);
      return `removed mouth ${mouth}`;
    }
    throw new Error(`cannot find mouth ${mouth}`);
  }

  //we should rethink it once we handle the responses and implement the history too for now it's useless
  async processInput(input) {
    const promises = [];
    for (const brain of this.brains) {
      promises.push(brain.processInput(input));
    }
    const results = await Promise.all(promises);
    const response = results.find((r) => r !== undefined);
    if (response !== undefined) {
      const promises = [];
      for (const mouth of this.mouths) {
        promises.push(mouth.output(response));
      }
      return Promise.all(promises);
    }
    return undefined;
  }

  async addtohistory(input, response, time) {
    const historyObj = { input, response, time };
    this.history.push(historyObj);
    await this.save();
  }

  async save() {
    // save bot data to database or file
  }

  static load() {
    // load bot data from database or file
    // of course, the following lines are just here as a placeholder for the actual code
    let bots2 = [
      {
        id: "1",
        name: "Steeve",
        profile_url: "image1.png",
        brains: ["brain.rive"],
        mouths: ["discord", "slack"],
        history: [],
        status: 'active',
      },
      {
        id: "2",
        name: "Jhon",
        profile_url: "image2.png",
        brains: ["brain.rive"],
        mouths: ["discord", "mastodon"],
        history: [],
        status: 'inactive',
      },
      {
        id: "3",
        name: "Bill",
        profile_url: "image5.png",
        brains: ["brain.rive"],
        mouths: ["mastodon"],
        history: [],
        status: 'active',
      },
    ];
    return bots2;
  }

  static activateBot(bot) {
    console.log('I will now proceed to activate the bot with id: ' + bot.id);
    const appBot = express();
    // support json encoded bodies
    appBot.use(bodyParser.json());
    // support url encoded bodies
    appBot.use(bodyParser.urlencoded({ extended: true }));

    appBot.use(express.static('assets'))
    appBot.use(express.static('data'))
    appBot.use('/data', express.static('data'));
    appBot.use('/static', express.static('views'));

    const port = INIT_PORT + parseInt(bot.id);

    
    appBot.get('/', (req, res) => {
      console.log("Redirecting...")
      res.redirect('/static/index.html');
    });

    appBot.get('/getBotInfo', (req, res) => {
      console.log("Hello!");
      //provide the requested bot


      res.status(200).json(bot);
    });

    /*
    appBot.post('/', (req, res) => {
      const { login, message } = req.body;
      bots[id].rive
        .reply(login, message)
        .then(function (reply) {
          res.send({ name: bots[id].info.name, message: reply });
        })
        .catch((err) => console.log(err));
    });*/


    const server = appBot.listen(port, () => {
      console.log(`Chatbot listening on port ${port}`)
    });

    //aggiungi il server alla lista di bot attivi
    activeBots.push(server);
  }

  static closeActiveBots() {
    //close all active bots
    activeBots.forEach(bot => {
        bot.close();
    });
}
}

module.exports = BotService;