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

app.use(session({
  secret: 'my-secret-key',
  resave: false,
  saveUninitialized: false
}));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  // Check that the user is logged in
  if(req.session.username) {
    console.log("hello");
    // First retrieve all the bots
    botManager.getBots()
    .then((results) => {

      // Close the bots already active;
      botManager.closeActiveBots();

      // Active bots
      results.forEach((bot) => {
        if(bot.status === 'active') {
          botManager.activateBot(bot);
        }
      });

      // Retrieve rivescripts available
      botManager.getRivescripts().then((rive_res) => {
        let rivescripts = [];
        rive_res.forEach((rivescript) => {
          rivescripts.push(rivescript.name);
        })

        res.status(200).json({bots: results, rivescripts: rivescripts, isLoggedIn: true});
      });
    })
    .catch((error) => {
      console.error(error);
    });
  } else {
    console.log("Please log in")
    res.status(200).json({isLoggedIn: false});
  }
})

app.get('/:id', (req, res) =>{
  let bot_id = req.params.id;
  botManager.getBotMouths(bot_id).then((mouths) => {
    botManager.getBotBrains(bot_id).then((brains) => {
      res.status(200).json({brains: brains, mouths: mouths});
    })
  })
})

//create a new bot
app.post('/',(req,res) => {
  let botToAdd = req.body;
  console.log(botToAdd);
  botManager.addBot(botToAdd);
  res.status(201).send('All is OK');
})

app.post('/logout', (req, res) => {
  console.log("Logging out...")
  req.session.username = null;
  res.redirect('/static/login.html');
})

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

app.delete('/:id', (req, res) => {
  let id = req.params.id;

  botManager.removeBot(id);

  res.status(201).send('All is OK');
})

app.patch('/', (req, res) => {
  let botInfo = req.body;
  console.log(botInfo);

  botManager.updateBot(botInfo).then(() => {
    botManager.removeBrains(botInfo).then(() => {
      botManager.addBrains(botInfo).then(() => {
        botManager.removeMouths(botInfo).then(() => {
          botManager.addMouths(botInfo).then(() => {
            res.status(201).send('All is OK');
          })
        })
      })
    });
  });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})



