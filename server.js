var express = require('express'),
    fs = require('fs');;
 
var app = express();
app.use(express.bodyParser());
app.use(app.router);
 
// dynamically include routes (Controller)
fs.readdirSync('./controllers').forEach(function (file) {
  if(file.substr(-3) == '.js') {
      route = require('./controllers/' + file);
      route.controller(app);
  }
});

 
app.listen(3000);
console.log('Listening on port 3000...');
