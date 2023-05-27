const bot = require("./Bot.js");

const express = require('express');
const bodyParser = require('body-parser');
//const cors = require('cors');
//const RiveScript = require('rivescript');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./modules/chatbots.db');

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

  static addBot(bot) {
    const sql = 'INSERT INTO bots (name, profile_url, status) VALUES (?, ?, ?)';
    db.run(sql, [bot.name, bot.profile_url, bot.status], function (err) {
      if (err) {
        console.error(err.message);
      } else {
        console.log(`A new entry has been added with ID ${this.lastID}`);

        //add the brains into the 'brains' table
        const sql2 = 'INSERT INTO brains (name, bot_id) VALUES (?,?)';
        bot.brains.forEach(async (brain) => {
          db.run(sql2, [brain, this.lastID], function (err) {
            if(err) {
              console.error(err.message);
            } else {
              console.log(`A new entry has been added into brains`);
            }
          });
        });

        //add the mouths into the 'mouths' table
        const sql3 = 'INSERT INTO mouths (name, bot_id) VALUES (?,?)';
        bot.mouths.forEach(async (mouth) => {
          db.run(sql3, [mouth, this.lastID], function (err) {
            if(err) {
              console.error(err.message);
            } else {
              console.log(`A new entry has been added into mouths`);
            }
          });
        });
      }
    });
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

  static getBots() {
    return new Promise((resolve, reject) => {
      let results = [];
      db.all('SELECT * FROM bots', (err, rows) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          console.log(rows);
  
          // Promises array for brains and mouths queries
          const promises = rows.map((bot) => {
            return new Promise((resolveBot, rejectBot) => {
              const sql = 'SELECT name FROM brains WHERE bot_id = ?';
              db.all(sql, [bot.id], function (err, brains) {
                if(err) {
                  console.error(err.message);
                  rejectBot(err);
                } else {
                  let brains_array = brains.map((brain) => brain.name);
                  bot.brains = brains_array;
  
                  const sql2 = 'SELECT name FROM mouths WHERE bot_id = ?';
                  db.all(sql2, [bot.id], function (err, mouths) {
                    if(err) {
                      console.error(err.message);
                      rejectBot(err);
                    } else {
                      let mouths_array = mouths.map((mouth) => mouth.name);
                      bot.mouths = mouths_array;
                      results.push(bot);
                      resolveBot();
                    }
                  });
                }
              });
            });
          });
  
          Promise.all(promises)
            .then(() => {
              resolve(results);
            })
            .catch((error) => {
              reject(error);
            });
        }
      });
    });
  }
  /*
  static getBots() {
    let results = [];
    db.all('SELECT * FROM bots', (err, rows) => {
      if (err) {
        console.error(err);
      } else {
        console.log(rows);

        // Retrieve the brains and the mouths for each bot
        const sql = 'SELECT name FROM brains WHERE bot_id = ?';
        rows.forEach((bot) => {
          db.all(sql, [bot.id], function (err, brains) {
            if(err) {
              console.error(err.message);
            } else {
              let brains_array = [];
              brains.forEach((brain) => { 
                brains_array.push(brain.name);
              })
              bot.brains = brains_array;

              const sql2 = 'SELECT name FROM mouths WHERE bot_id = ?';
              db.all(sql2, [bot.id], function (err, mouths) {
                if(err) {
                  console.error(err.message);
                } else {
                  let mouths_array = [];
                  mouths.forEach((mouth) => { 
                    mouths_array.push(mouth.name);
                  })
                  bot.mouths = mouths_array;
                  results.push(bot);

                  //first console.log
                  console.log("First: " + results);
                }
              });
              //second console.log
              console.log("Second: " + results);
            }
          });
        })
      }
    });
  }*/

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

    const port = INIT_PORT + bot.id;

    
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