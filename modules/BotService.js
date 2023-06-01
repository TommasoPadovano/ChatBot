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
            if (err) {
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
            if (err) {
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
  static updateBot(botId, newBot) {
    return new Promise((resolve, reject) => {
      const { name, status, profile_url } = newBot;

      // If the user has inserted at least one of these values, update it
      if (name || status || profile_url) {
        // Construction of the update query
        let updateQuery = 'UPDATE bots SET';

        // Adding the fields to update
        if (name) {
          updateQuery += ` name = '${name}',`;
        }
        if (status) {
          updateQuery += ` status = '${status}',`;
        }
        if (profile_url) {
          updateQuery += ` profile_url = '${profile_url}',`;
        }

        // Removing the last comma
        updateQuery = updateQuery.slice(0, -1);

        // Identification of the specific bot to update
        updateQuery += ` WHERE id = ${botId};`;
  
        // Execution of the query
        db.run(updateQuery, function (err) {
          if (err) {
            console.error('Error during the update of the bot:', err.message);
            reject(err);
          } else {
            console.log(`Bot with ID ${botId} updated successfully.`);
            resolve();
          }
        });
      } else {
        resolve(); // Resolve immediately if no fields to update
      }
    });
  }

  static removeBot(id) {
    const sql = 'DELETE FROM bots WHERE id = ?';
    db.run(sql, [id], function (err) {
      if (err) {
        console.error(err.message);
      } else {
        console.log(`Bot with ID ${id} has been successfully deleted.`);
      }
    });
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
                if (err) {
                  console.error(err.message);
                  rejectBot(err);
                } else {
                  let brains_array = brains.map((brain) => brain.name);
                  bot.brains = brains_array;

                  const sql2 = 'SELECT name FROM mouths WHERE bot_id = ?';
                  db.all(sql2, [bot.id], function (err, mouths) {
                    if (err) {
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

  static findBotIdByName(botName) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT id FROM bots WHERE name = ?';
      db.get(query, [botName], (err, row) => {
        if (err) {
          console.error(err.message);
          reject(err);
        } else {
          if (row) {
            resolve(row.id);
          } else {
            resolve(null);
          }
        }
      });
    });
  }

  static getBotsActiveOnDiscord() {
    return new Promise((resolve, reject) => {
      let results = [];
      db.all('SELECT * FROM bots', (err, rows) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          // Promises array for brains and mouths queries
          const promises = rows.map((bot) => {
            return new Promise((resolveBot, rejectBot) => {
              const sql = 'SELECT name FROM brains WHERE bot_id = ?';
              db.all(sql, [bot.id], function (err, brains) {
                if (err) {
                  console.error(err.message);
                  rejectBot(err);
                } else {
                  let brains_array = brains.map((brain) => brain.name);
                  bot.brains = brains_array;

                  const sql2 = 'SELECT name FROM mouths WHERE bot_id = ?';
                  db.all(sql2, [bot.id], function (err, mouths) {
                    if (err) {
                      console.error(err.message);
                      rejectBot(err);
                    } else {
                      let mouths_array = mouths.map((mouth) => mouth.name);
                      if (mouths_array.includes('discord')) {
                        bot.mouths = mouths_array;
                        results.push(bot);
                      }
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

  static getBotBrains(bot_id) {
    return new Promise((resolve, reject) => {
      let query = `SELECT name FROM brains WHERE bot_id = ?`;
      db.all(query, [bot_id], (err, rows) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static addBrains(botId, newBot) {
    return new Promise((resolve, reject) => {
      const { brains_toAdd } = newBot;

      if (brains_toAdd) {
        const deletePromises = brains_toAdd.map((brain) => {
          return new Promise((resolve, reject) => {
            let brainsAddQuery = `INSERT INTO brains (name, bot_id) VALUES ('${brain}', ${botId})`;
            db.run(brainsAddQuery, function (err) {
              if (err) {
                console.error(err.message);
                reject(err);
              } else {
                console.log(`Brains for bot with ID ${botId} have been successfully added.`);
                resolve();
              }
            });
          });
        });

        Promise.all(deletePromises)
          .then(() => {
            resolve();
          })
          .catch((err) => {
            reject(err);
          });
      } else {
        resolve(); // Resolve immediately if no brains to delete
      }
    });
  }

  static removeBrains(botId, newBot) {
    return new Promise((resolve, reject) => {
      const { brains_toDelete } = newBot;

      if (brains_toDelete) {
        const deletePromises = brains_toDelete.map((brain) => {
          return new Promise((resolve, reject) => {
            let brainsDeleteQuery = `DELETE FROM brains WHERE bot_id = ${botId} AND name = '${brain}'`;
            db.run(brainsDeleteQuery, function (err) {
              if (err) {
                console.error(err.message);
                reject(err);
              } else {
                console.log(`Brains for bot with ID ${botId} have been successfully deleted.`);
                resolve();
              }
            });
          });
        });

        Promise.all(deletePromises)
          .then(() => {
            resolve();
          })
          .catch((err) => {
            reject(err);
          });
      } else {
        resolve(); // Resolve immediately if no brains to delete
      }
    });
  }

  static getBotMouths(bot_id) {
    return new Promise((resolve, reject) => {
      let getMouths = `SELECT name FROM mouths WHERE bot_id = ${bot_id}`;
      db.all(getMouths, function (err, rows) {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          //let mouths = rows.map(row => row.name);
          resolve(rows);
        }
      });
    });
  }

  static addMouths(botId, newBot) {
    return new Promise((resolve, reject) => {
      const { mouths_toAdd } = newBot;

      if (mouths_toAdd) {
        const addPromises = mouths_toAdd.map((mouth) => {
          return new Promise((resolve, reject) => {
            let mouthsAddQuery = `INSERT INTO mouths (name, bot_id) VALUES ('${mouth}', ${botId})`;
            db.run(mouthsAddQuery, function (err) {
              if (err) {
                console.error(err.message);
                reject(err);
              } else {
                console.log(`Mouths for bot with ID ${botId} have been successfully added.`);
                resolve();
              }
            });
          });
        });

        Promise.all(addPromises)
          .then(() => {
            resolve();
          })
          .catch((err) => {
            reject(err);
          });
      } else {
        resolve(); // Resolve immediately if no brains to delete
      }
    });
  }

  static removeMouths(botId, newBot) {
    return new Promise((resolve, reject) => {
      const { mouths_toRemove } = newBot;

      if (mouths_toRemove) {
        const deletePromises = mouths_toRemove.map((mouth) => {
          return new Promise((resolve, reject) => {
            let mouthsDeleteQuery = `DELETE FROM mouths WHERE bot_id = ${botId} AND name = '${mouth}'`;
            db.run(mouthsDeleteQuery, function (err) {
              if (err) {
                console.error(err.message);
                reject(err);
              } else {
                console.log(`Mouths for bot with ID ${botId} have been successfully deleted.`);
                resolve();
              }
            });
          });
        });

        Promise.all(deletePromises)
          .then(() => {
            resolve();
          })
          .catch((err) => {
            reject(err);
          });
      } else {
        resolve(); // Resolve immediately if no brains to delete
      }
    });
  }

  static saveMessages(botId, username, userMessage, botReply) {
    let timestamp = new Date().getTime();
    return new Promise((resolve, reject) => {
      let addChatQuery = `INSERT INTO chats (bot_id, username, timestamp, user_msg, bot_answer) VALUES (?, ?, ?, ?, ?)`;
      db.run(addChatQuery, [botId, username, timestamp, userMessage, botReply], function (err) {
        if (err) {
          console.error(err.message);
          reject(err);
        } else {
          console.log(`Chat between bot with ID ${botId} and ${username} has been successfully added.`);
          resolve();
        }
      });
    });
  }

  static retrieveMessages(botId, username, numOfMessages) {
    return new Promise((resolve, reject) => {
      let retrieveMessagesQuery = `SELECT user_msg, bot_answer FROM chats WHERE bot_id = ? AND username = ? ORDER BY timestamp DESC LIMIT ?`;
      db.all(retrieveMessagesQuery, [botId, username, numOfMessages], function (err, rows) {
        if (err) {
          console.error(err.message);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static getRivescripts() {
    return new Promise((resolve, reject) => {
      let getRivescripts = `SELECT name FROM rivescripts`;
      db.all(getRivescripts, function (err, rows) {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static activateBot(bot) {
    const session = require('express-session');
    const userManager = require('./UserService.js');

    console.log('Activating the bot with id: ' + bot.id);

    const appBot = express();
    // support json encoded bodies
    appBot.use(bodyParser.json());
    // support url encoded bodies
    appBot.use(bodyParser.urlencoded({ extended: true }));

    appBot.use(express.static('assets'))
    appBot.use(express.static('data'))
    appBot.use('/data', express.static('data'));
    appBot.use('/static', express.static('views'));
    appBot.use(session({
      secret: 'my-secret-key',
      resave: false,
      saveUninitialized: false
    }));

    const port = INIT_PORT + bot.id;

    // This endpoint is called immediately to redirect to the chat page
    // If the user is NOT logged in, it will redirect it to the user login page instead
    appBot.get('/', (req, res) => {
      console.log("Redirecting...")
      if (req.session.username) {
        res.redirect('/static/index.html');
      } else {
        res.redirect('/static/user_login.html');
      }
    });

    // This endpoint retrieves the information about the bot of this server
    appBot.get('/bot', (req, res) => {
      // Provide the requested bot
      res.status(200).json(bot);
    });

    // This endpoints retrieves the chat between user currently logged in and the bot of this server
    appBot.get('/bots/chat/:numOfMessages', (req, res) => {
      let numOfMessages = req.params.numOfMessages;

      this.retrieveMessages(bot.id, req.session.username, numOfMessages).then((result) => {
        res.status(200).json(result);
      });
    })

    // This endpoint takes the username and password from the request body
    // and checks that there exists a user with these credentials
    // if so, it will redirect to the chat page, otherwise it will tell that the credentials are incorrect
    appBot.post('/', (req, res) => {
      const username = req.body.username;
      const password = req.body.password;

      userManager.checkUserCredentials(username, password).then((isValid) => {
        if (isValid) {
          req.session.username = username;
          res.redirect('/static/index.html');
        } else {
          res.json('Error, wrong credentials')
        }
      }).catch((error) => {
        console.error(error);
      });
    })

    // This endpoint will insert the pair (userMessage - botReply) into the database
    appBot.post('/bots/chat/', (req, res) => {
      let message = req.body.message;
      let reply = req.body.reply;

      this.saveMessages(bot.id, req.session.username, message, reply).then(() => {
        res.json("Done");
      });
    });


    const server = appBot.listen(port, () => {
      console.log(`Chatbot listening on port ${port}`)
    });

    //Add the server to the list of active bots
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