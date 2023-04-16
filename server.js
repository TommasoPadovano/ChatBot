const express = require('express')
const app = express()
const port = 3000

app.use(express.static('assets'))
app.use(express.static('data'))
app.use('/data', express.static('data'));

app.set('view engine', 'ejs');
/*app.use('/static', express.static('public', {
  setHeaders: function(res, path, stat) {
    res.set('Content-Type', 'text/css');
  }
}));*/

app.get('/', (req, res) => {
  let bots = [];
  res.render("administration_page");
})

app.get('/login', function(req, res) {
  res.render('login');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})



