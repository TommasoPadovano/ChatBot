
let bot = new RiveScript();
const brains = [];

let message_container;
let info_box;
let form;

let myHeaders = new Headers();
myHeaders.append('Content-Type', 'application/json');
let myInit = { 
  method: 'GET',
  headers: myHeaders,
};

//launch the request
fetch('/getBotInfo', myInit)
  .then((httpResponse)=>{
    return httpResponse.text();
  })
  .then((responseBody)=>{
    botInfo = JSON.parse(responseBody);
    console.log(botInfo.brains);

    //add all the brains of our bot
    //NOTE: we have to test if the bot actually works with more than one brain
    botInfo.brains.forEach((brain) => {
      console.log('Adding: ' + '/data/' + brain)
      brains.push('/data/' + brain);
    })
    //load the brains and then call botReady
    bot.loadFile(brains).then(botReady).catch(botNotReady); // load the brains

    message_container = document.querySelector('.messages');
    form = document.querySelector('form');
    input_box = document.querySelector('input');
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      selfReply(input_box.value);
      input_box.value = "";
    });
    console.log(`response is ${responseBody}`);
  })
  .catch((err)=>{
    console.log(`ERROR : ${err}`);
  })
/*
brains.push('/data/brain.rive');
bot.loadFile(brains).then(botReady).catch(botNotReady); // load the brains

const message_container = document.querySelector('.messages');
const form = document.querySelector('form');
const input_box = document.querySelector('input');
form.addEventListener("submit", (e) => {
  e.preventDefault();
  selfReply(input_box.value);
  input_box.value = "";
});*/
function botReply(message){
  message_container.innerHTML += `<div class="bot">${message}</div>`;
  location.href = "#edge";
}
function selfReply(message){
  message_container.innerHTML += `<div class="self">${message}</div>`;
  location.href = "#edge";
  
  bot.reply("local-user", message).then(function(reply) {
    botReply(reply);
  });
}
function botReady(){
  bot.sortReplies();
  botReply("Hello");
}
function botNotReady(err){
}