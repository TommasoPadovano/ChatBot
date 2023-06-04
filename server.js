const bodyParser = require('body-parser');
const express = require('express')
const session = require('express-session');

const app = express()
const port = 3000
const users = require('./users.json')
const botManager = require('./modules/BotService.js');
const userManager = require('./modules/UserService.js');

app.use(express.static('assets'))
app.use(express.static('data'))
app.use('/data', express.static('data'));
app.use('/static', express.static('views'));

app.use(bodyParser.json()) 
app.use(bodyParser.urlencoded({ extended: true }))

// Used to save the username into the session
app.use(session({
  secret: 'my-secret-key',
  resave: false,
  saveUninitialized: false
}));

app.set('view engine', 'ejs');

// This endpoint is called immediately to redirect to the administration page
// If the user is NOT logged in, it will redirect it to the login page instead
app.get('/', (req, res) => {
  if(req.session.username) {
    res.redirect('/static/administration_page.html');
  } else {
    res.redirect('/static/login.html');
  }
})

// This endpoint is called in the administration page to get all the bots
// Before returning the bots, the endpoint also activates the ones whose status is "active"
app.get('/bots/', (req, res) => {
    // First retrieve all the bots
    botManager.getBots()
      .then((results) => {

        // Close the bots already active;
        botManager.closeActiveBots();

        // Activate bots
        results.forEach((bot) => {
          if(bot.status === 'active') {
            botManager.activateBot(bot);
          }
        });

        // Return the requested bots
        res.status(200).json(results);
      })
      .catch((error) => {
        console.error(error);
      });
})

// This endpoint returns the rivescripts names
app.get('/rivescripts/', (req, res) => {
  // Retrieve rivescripts available
  botManager.getRivescripts().then((rive_res) => {
    let rivescripts = [];
    rive_res.forEach((rivescript) => {
      rivescripts.push(rivescript.name);
    })

    res.status(200).json(rivescripts);
  });
})

// This endpoint is called to get the mouths of a specific bot in order to use them in the update form
app.get('/bots/:id/mouths', (req, res) =>{
  let bot_id = req.params.id;
  botManager.getBotMouths(bot_id).then((mouths) => {
    res.status(200).json(mouths);
  })
})

// This endpoint is called to get the brains of a specific bot in order to use them in the update form
app.get('/bots/:id/brains', (req, res) =>{
  let bot_id = req.params.id;
  botManager.getBotBrains(bot_id).then((brains) => {
    res.status(200).json(brains);
  })
})

// This endpoint creates a new bot
app.post('/bots/',(req,res) => {
  let botToAdd = req.body;

  botManager.addBot(botToAdd);
  res.status(201).json('Bot added successfully');
})

// This endpoint is used for the logout
app.post('/logout', (req, res) => {
  console.log("Logging out...")
  req.session.username = null;
  res.redirect('/static/login.html');
})

// This endpoint is used for the login
app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  userManager.checkCredentials(username, password).then((isValid) => {
    if(isValid) {
      req.session.username = username;
      res.redirect('/static/administration_page.html');
    } else {
      res.send('Error, wrong credentials')
    }
  }).catch((error) => {
    console.error(error);
  });
})

// This endpoint deletes the bot whose id is specified in the request parameter
app.delete('/bots/:id', (req, res) => {
  let id = req.params.id;
  botManager.removeBot(id);
  res.status(201).send('All is OK');
})

// This endpoint is used to update the bot identified by the id in the request parameter
app.patch('/bots/:id', (req, res) => {
  let botId = req.params.id;
  let botInfo = req.body;

  botManager.updateBot(botId, botInfo).then(() => {
    botManager.removeBrains(botId, botInfo).then(() => {
      botManager.addBrains(botId, botInfo).then(() => {
        botManager.removeMouths(botId, botInfo).then(() => {
          botManager.addMouths(botId, botInfo).then(() => {
            res.status(201).json('All is OK');
          })
        })
      })
    });
  });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})



