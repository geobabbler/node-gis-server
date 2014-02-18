var express = require('express'),
    fs = require('fs');

 
var app = express();
app.use(express.bodyParser());
app.use(app.router);
//app.use(error);

process.on('uncaughtException', function (error) {
   console.log(error.stack);
});

// dynamically include routes (Controller)
fs.readdirSync('./controllers').forEach(function (file) {
  if(file.substr(-3) == '.js') {
      route = require('./controllers/' + file);
      route.controller(app);
  }
});

/*function error(err, req, res, next) {
  // log it
  console.log(err);
  //console.error(err.stack);

  // respond with 500 "Internal Server Error".
  res.send(500);
}*/
 
app.listen(3000);
console.log('Listening on port 3000...');
