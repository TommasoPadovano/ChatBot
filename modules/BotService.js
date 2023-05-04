const Bot = require("./Bot.js");

const express = require('express');
const bodyParser = require('body-parser');
const prisma = require("../prisma/prisma.js");
//const cors = require('cors');
const RiveScript = require('rivescript');

const INIT_PORT = 4001;

const activeBots = [];

class BotService {

  constructor(data) {
  }


  static async create(brains = [], mouths = [], name = "Bot with no name :(", image = "assets/images/image1.png") {
    const bot = new Bot({ brains, mouths, name, image });
    await bot.add_to_DB();
    return bot;
  }

  static async addBot(bot) {
    //depends on the database we use
    // Add Bot info to DB
    try {
      const createdBot = await prisma.bot.create({
        data: {
          name: bot.name,
          brains: bot.brains,
          mouths: bot.mouths,
          history: bot.history,
          image: bot.image,
          status: bot.status,
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
    console.log('Adding bot');
  }

  /**
 * Tie a brain file to a rivescript object
 * @param {*} id The bot's id
 * @param {*} brain The name of the brain file; has to be in src/public/brains
 * @returns
 */
  static async addBrain(id, brain) {
    let rive = new RiveScript({
      utf8: true,
    });
    rive.display = {
      id: id,
      status: 'off',
    };
    rive
      .loadFile('src/public/brains/' + brain + '.rive')
      .then(() => {
        rive.sortReplies();
        data.chatbots[id].info.brain = brain;
        data.chatbots[id].rive = rive;
        console.log(
          `Brain loaded: '${brain}.rive' for chatbot (${id} - ${data.chatbots[id].info.name})`
        );
      })
      .catch(loading_error);
    return rive;
  }


  //from PUT
  async replaceBot(id, aBot) {
    //depends on the database we use   
  }

  //from PATCH
  async updateBot(id, data) {
    //depends on the database we use
    try {
      const updatedBot = await prisma.bot.update({
        where: { id: Number(id) },
        data: {
          ...data,
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async removeBot(id) {
    //depends on the database we use
    try {
      const deletedBot = await prisma.bot.delete({
        where: { id: Number(id) },
      });
    } catch (error) {
      next(error);
    }
  }

  async getBot(id) {
    try {
      const bot = await prisma.bot.findUnique({
        where: {
          id: Number(id),
        },
      });
      if (bot) {
        return bot;
      } else {
        const err = new Error('Chatbot not found! 🤖');
        err.statusCode = 404;
        throw err;
      }
    } catch (error) {
      throw error;
    }
  }


  async getBots() {
    try {
      const bots = await prisma.bot.findMany();
      return bots;
    } catch (error) {
      throw error;
    }
  }


  async initialize_DB() {
    // initialize bot database here
    // e.g., connect to a database server, load files, etc.
    // set up any other necessary resources
    // Create chatbot objects from information stored in the DB
  }

  async addBrain(id, brain) {
    try {
      const bot = await prisma.bot.findUnique({
        where: { id: Number(id) },
      });
      if (!bot) {
        throw new Error('Chatbot not found! 🤖');
      }
      const rive = new RiveScript({ utf8: true });
      rive.display = { id: bot.id, status: 'off' };
      await rive.loadFile(`src/public/brains/${brain}.rive`);
      rive.sortReplies();
      await prisma.bot.update({
        where: { id: bot.id },
        data: { brains: [...bot.brains, brain] },
      });
      return rive;
    } catch (error) {
      throw error;
    }
  }


  async removeBrain(id, brain) {
    try {
      const bot = await prisma.bot.findUnique({
        where: { id: Number(id) },
      });
      if (!bot) {
        throw new Error('Chatbot not found! 🤖');
      }
      const index = bot.brains.indexOf(brain);
      if (index === -1) {
        throw new Error('Brain file not found on this Chatbot!');
      }
      const newBrains = [...bot.brains];
      newBrains.splice(index, 1);
      await prisma.bot.update({
        where: { id: bot.id },
        data: { brains: newBrains },
      });
    } catch (error) {
      throw error;
    }
  }


  /*   async addMouth(bot,mouth) {
    bot.mouths.push(mouth);
    return `added mouth ${mouth}`;
  }
  
    async removeMouth(bot,mouth) {
    const index = this.mouths.findIndex((e) => e === mouth);
    if (index > -1) {
      this.mouths.splice(index, 1);
      return `removed mouth ${mouth}`;
    }
    throw new Error(`cannot find mouth ${mouth}`);
  }
   */

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

  async addtohistory(id, input, response, time) {
    const historyObj = { input, response, time };
    try {
      const updatedBot = await prisma.bot.update({
        where: { id: botId },
        data: { history: { push: historyObj } }
      });
      return updatedBot.history;
    } catch (error) {
      throw error;
    }
  }

  async loadBots() {
    try {
      const botRecords = await getBots();
      const bots = botRecords.map(botRecord => ({
        id: botRecord.id.toString(),
        name: botRecord.name,
        profile_url: botRecord.image,
        brains: botRecord.brains,
        mouths: botRecord.mouths,
        history: botRecord.history,
        status: botRecord.status,
      }));
      return bots;
    } catch (error) {
      throw error;
    }
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