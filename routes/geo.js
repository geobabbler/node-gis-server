var pg = require('pg');

var conString = "postgres://{username}:{password}@{host}:{port}/{database}"; //TODO: point to RDS instance

exports.bbox = function(req, res) {
    var client = new pg.Client(conString);
    client.connect();
    var crsobj = {"type": "name","properties": {"name": "urn:ogc:def:crs:EPSG:6.3:4326"}};
    var idformat = "'" + req.params.id + "'";
    idformat = idformat.toUpperCase();
    var spatialcol = "";
var arr = [];
    var meta = client.query("select * from geometry_columns where f_table_name = 'ne_countries'"); 
    meta.on('row', function(row) { 
    var coll = {type: "FeatureCollection", features: []};
        spatialcol = row.f_geometry_column;
    var query = client.query("select st_asgeojson(st_envelope(" + spatialcol + ")) as geojson, * from ne_countries where continent = 'South America';"); // iso_a3 = " + idformat + ";"); 
     query.on('row', function(result) {
        //console.log(r.rows.length);
        //client.end();
    	var props = new Object;
        if (!result) {
          return res.send('No data found');
        } else {
 	    for (var k in result){
    	        if (result.hasOwnProperty(k)) {
		    var nm = "" + k;
		    //var o = {k};
		    if ((nm != "geojson") && nm != spatialcol){
		        props[nm] = result[k];
                    }
   	         }
	    }
	    coll.features.push({type: "Feature",crs: crsobj, geometry: JSON.parse(result.geojson), properties:props});
//console.log(coll.features);
        }
      });

     query.on('end', function(result) {
            res.setHeader('Content-Type', 'application/json');
            res.send(coll);
     
      });
 
//  query.on('error', function(error) {
//    res.send(error);
//  });

    }); 
//end(coll);
    
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
