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
  let bots = ['bot1', 'bot2', 'bot3'];
  let noBots = [];

  let bots2 = [
    {
      id: "1",
      name: "Steeve",
      profile_url: "image1.png",
      brains: ["standard.rive"],
      mouths: ["discord", "slack"],
      history: [],
      status: 'active',
    },
    {
      id: "2",
      name: "Jhon",
      profile_url: "image2.png",
      brains: ["standard.rive", "advanced.rive"],
      mouths: ["discord", "mastodon"],
      history: [],
      status: 'inactive',
    },
    {
      id: "3",
      name: "Bill",
      profile_url: "image5.png",
      brains: ["standard.rive", "advanced.rive"],
      mouths: ["mastodon"],
      history: [],
      status: 'active',
    },
  ];

  //first retrieve all the bots
  let my_bots = botManager.load();
  //close the bots already active;
  botManager.closeActiveBots();
  //then, for every bot whose status is active, initialize it
  my_bots.forEach((bot) => {
    if(bot.status === 'active') {
      botManager.activateBot(bot);
    }
  });

  // Check if the user is authenticated
  const authenticated = req.cookies.chatbot_authenticated === 'true';
  if (authenticated) {
    // If the user is authenticated, serve the full content of the page
    res.status(200).json({bots: bots2, admin: true});
    //res.render("administration_page");
  } else {
    // If the user is not authenticated, serve a page with only partial content
    res.status(200).json({bots: bots2, admin: false});
  }
})

//create a new bot
app.post('/',(req,res) => {
  let botToAdd = req.body;
  console.log(botToAdd);

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
  console.log(id);

  res.status(201).send('All is OK');
})

app.patch('/', (req, res) => {
  let botInfo = req.body;
  console.log(botInfo);

  res.status(201).send('All is OK');
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})



