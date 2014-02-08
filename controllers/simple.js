module.exports.controller = function(app) {

/**
 * a home page route
 */
  app.get('/simple/signup', function(req, res) {
      // any logic goes here
      res.setHeader('Content-Type', 'application/json');
      res.send({type: "test", success: "yes"});
  });

/**
 * About page route
 */
  app.get('/login', function(req, res) {
      // any logic goes here
      res.render('users/login')
  });

}

