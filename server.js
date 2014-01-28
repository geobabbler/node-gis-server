var express = require('express'),
    geo = require('./routes/geo');
 
var app = express();
app.use(express.bodyParser());
 
//get methods
app.get('/countries/:id/bbox', geo.bbox);
app.get('/countries/:id/bbox/:srid', geo.bboxSrid);
app.get('/countries/:id/polygon', geo.polygon);
app.get('/countries/:id/polygon/:srid', geo.polygonSrid);
//post methods
//app.post('/countries', geo.queryByPoly);
 
app.listen(3000);
console.log('Listening on port 3000...');
