const Bot = require('./Bot');

class BotService {
  constructor(data) {
  }

  static async create(id, brains, mouths, name, image) {
    const bot = new Bot({ id, brains, mouths, name, image });
    await bot.initialize();
    return bot;
  }

  async addBot(bot) {
    //depends on the database we use
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

  async load() {
    // load bot data from database or file
  }
}

module.exports = BotService;