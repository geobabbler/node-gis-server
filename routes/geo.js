var pg = require('pg');
var conString = "postgres://{username}:{password}@{host}:{port}/{database}"; //TODO: point to RDS instance

exports.bbox = function(req, res) {
    var client = new pg.Client(conString);
    client.connect();
    var crsobj = {"type": "name","properties": {"name": "urn:ogc:def:crs:EPSG:6.3:4326"}};
    var idformat = "'" + req.params.id + "'";
    idformat = idformat.toUpperCase();  
    var query = client.query("select st_asgeojson(st_envelope(shape)) as geojson from ne_countries where iso_a3 = " + idformat + ";"); 
    var retval = "no data";
    query.on('row', function(result) {
        //console.log(result);
        client.end();
    
        if (!result) {
          return res.send('No data found');
        } else {
          res.setHeader('Content-Type', 'application/json');
          res.send({type: "feature",crs: crsobj, geometry: JSON.parse(result.geojson), properties:{"iso": req.params.id, "representation": "extent"}});
        }
      }); 
    
};

exports.bboxSrid = function(req, res) {
    var client = new pg.Client(conString);
    client.connect();
    var crsobj = {"type": "name","properties": {"name": "urn:ogc:def:crs:EPSG:6.3:" + req.params.srid}};
    var idformat = "'" + req.params.id + "'";
    idformat = idformat.toUpperCase();  
    var query = client.query("select st_asgeojson(st_envelope(st_transform(shape, " + req.params.srid + "))) as geojson from ne_countries where iso_a3 = " + idformat + ";"); 
    var retval = "no data";
    query.on('row', function(result) {
        //console.log(result);
         client.end();
   
        if (!result) {
          return res.send('No data found');
        } else {
          res.setHeader('Content-Type', 'application/json');
          res.send({type: "feature",crs: crsobj, geometry: JSON.parse(result.geojson), properties:{"iso": req.params.id, "representation": "extent"}});
        }
      }); 
};

exports.polygon = function(req, res) {
    //TODO: Flesh this out. Logic will be similar to bounding box.
    var client = new pg.Client(conString);
    client.connect();
    var crsobj = {"type": "name","properties": {"name": "urn:ogc:def:crs:EPSG:6.3:4326"}};
    var idformat = "'" + req.params.id + "'";
    idformat = idformat.toUpperCase();  
    var query = client.query("select st_asgeojson(shape) as geojson from ne_countries where iso_a3 = " + idformat + ";"); 
    var retval = "no data";
    query.on('row', function(result) {
        //console.log(result);
         client.end();
   
        if (!result) {
          return res.send('No data found');
        } else {
          res.setHeader('Content-Type', 'application/json');
          res.send({type: "feature", crs: crsobj, geometry: JSON.parse(result.geojson), properties:{"iso": req.params.id, "representation": "boundary"}});
        }
      }); };

exports.polygonSrid = function(req, res) {
    var client = new pg.Client(conString);
    client.connect();
    var crsobj = {"type": "name","properties": {"name": "urn:ogc:def:crs:EPSG:6.3:" + req.params.srid}};
    var idformat = "'" + req.params.id + "'";
    idformat = idformat.toUpperCase();  
    var query = client.query("select st_asgeojson(st_transform(shape, " + req.params.srid + ")) as geojson from ne_countries where iso_a3 = " + idformat + ";"); 
    var retval = "no data";
    query.on('row', function(result) {
        //console.log(result);
         client.end();
   
        if (!result) {
          return res.send('No data found');
        } else {
          res.setHeader('Content-Type', 'application/json');
          res.send({type: "feature",crs: crsobj, geometry: JSON.parse(result.geojson), properties:{"iso": req.params.id, "representation": "boundary"}});
        }
      }); };

exports.queryByPoly - function(req, res) {
    var client = new pg.Client(conString);
    client.connect();
    var queryShape = req.query.shape;
    
};
