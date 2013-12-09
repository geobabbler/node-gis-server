var express = require('express'),
    gadm = require('./routes/gadm');
 
var app = express();
 
app.get('/countries/:id/bbox', gadm.bbox);
app.get('/countries/:id/bbox/:srid', gadm.bboxSrid);
app.get('/countries/:id/polygon', gadm.polygon);
app.get('/countries/:id/polygon/:srid', gadm.polygonSrid);
 
app.listen(3000);
console.log('Listening on port 3000...');
