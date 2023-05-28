const bodyParser = require('body-parser');
const express = require('express')
const app = express()
const port = 3000
const users = require('./users.json')
const cookieParser = require('cookie-parser');
const botManager = require('./modules/BotService.js');

app.use(express.static('assets'))
app.use(express.static('data'))
app.use('/data', express.static('data'));
app.use('/static', express.static('views'));

app.use(bodyParser.json()) 
app.use(bodyParser.urlencoded({ extended: true })) 
app.use(cookieParser());

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
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

      res.status(200).json({bots: results, rivescripts: rivescripts, admin: true});
      /*
      // Check if the user is authenticated
      const authenticated = req.cookies.chatbot_authenticated === 'true';
      if (authenticated) {
        // If the user is authenticated, serve the full content of the page
        res.status(200).json({bots: results, rivescripts: rivescripts, admin: true});
      } else {
        // If the user is not authenticated, serve a page with only partial content
        res.status(200).json({bots: results, rivescripts: rivescripts, admin: false});
      }*/
    });
  })
  .catch((error) => {
    console.error(error);
  });
})

app.get('/:id', (req, res) =>{
  let bot_id = req.params.id;
  botManager.getBotMouths(bot_id).then((mouths) => {
    botManager.getBotBrains(bot_id).then((brains) => {
      console.log(brains);
      console.log(mouths);
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
  res.cookie('chatbot_authenticated', false, {httpOnly: true});
  res.status(200).send();
})

app.post('/login', (req, res) => {
  const username = req.body.username;
  // Check if the user is in the list of allowed users
  if (users.users.includes(username)) {
    // Set a cookie to indicate that the user is authenticated
    console.log("Authenticated!")
    res.cookie('chatbot_authenticated', true, { httpOnly: true });

    res.redirect('/static/administration_page.html');
  } else {
    // If the user is not in the list of allowed users, show an error message
    res.send('Invalid username');
  }
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



