var express = require('express'),
    fs = require('fs');

var atry = require('./mistake.js');
 
var app = express();
app.use(express.bodyParser());
app.use(app.router);
//app.use(error);
 
// dynamically include routes (Controller)
fs.readdirSync('./controllers').forEach(function (file) {
  if(file.substr(-3) == '.js') {
      route = require('./controllers/' + file);
      route.controller(app);
  }
});

atry(function() {
    setTimeout(function(){
        throw "something";
    },1000);
}).catch(function(err){
    console.log("caught "+err);
});

/*function error(err, req, res, next) {
  // log it
  console.error(err.stack);

  // respond with 500 "Internal Server Error".
  res.send(500);
}*/
 
app.listen(3000);
console.log('Listening on port 3000...');
