class Bot {
    constructor(data) {
      this.id = data.id || 0;
      this.brains = data.brains || [];
      this.mouths = data.mouths || [];
      this.db = {};
      this.name = data.name || "";
      this.image = data.image || "";
      this.history = data.history || [];
    }
  
    static async create(name, image) {
      const bot = new Bot({ name, image });
      await bot.initialize();
      return bot;
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
    
    //we should rethink it once we handle the responses and implement the history too it's too basic
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
  
    async train(data) {
      const promises = [];
      for (const brain of this.brains) {
        promises.push(brain.train(data));
      }
      return Promise.all(promises);
    }
  
    async save() {
      // save bot data to database or file
    }
  
    async load() {
      // load bot data from database or file
    }
  }
  
  export { Bot };
  