var express = require('express'),
    gadm = require('./routes/gadm');
 
var app = express();
 
app.get('/bbox/:id', gadm.bbox);
app.get('/polygon/:id', gadm.polygon);
 
app.listen(3000);
console.log('Listening on port 3000...');
