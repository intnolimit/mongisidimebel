var main = require('../controllers/main');
var basicroutes = require('./BasicRoutes');
var fileroutes = require('./FileRoutes');
var mainroutes = require('./MainRoutes');
var nontokenroutes = require('./NonTokenRoutes');
var midWare = require('../controllers/middleware');

module.exports =
{
  configure: function(app)
  {
    console.log('masuk ke the route')
    
    app.route('/bits/test').get(main.test);
    app.route('/bits/testenc').get(main.testenc);
    app.route('/bits/testdb').get(main.testdb);
    // app.route('/bits/testAWS').get(main.testAWS);
    app.use('/bits/BasicQuery', basicroutes);
    
    app.use('/bits/main', mainroutes);
    app.use(nontokenroutes);
    // app.use('/bits', midWare.authUser);
    app.use('/bits/file', fileroutes);
  }
};
