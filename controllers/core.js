var pg = require('pg');
var conString = "postgres://{username}:{password}@{host}:{port}/{database}";

module.exports.controller = function(app) {

/**
 * a home page route
 */
  app.get('/vector/:schema/:table/features', function(req, res) {
    var client = new pg.Client(conString);
    var schemaname = req.params.schema;
    var tablename = req.params.table;
    var fullname = schemaname + "." + tablename;
    client.connect();
    var crsobj = {"type": "name","properties": {"name": "urn:ogc:def:crs:EPSG:6.3:4326"}};
    var idformat = "'" + req.params.id + "'";
    idformat = idformat.toUpperCase();
    var spatialcol = "";
    var meta = client.query("select * from geometry_columns where f_table_name = '" + tablename + "' and f_table_schema = '" + schemaname + "';"); 
    meta.on('row', function(row) { 
    var coll = {type: "FeatureCollection", features: []};
        spatialcol = row.f_geometry_column;
    var query = client.query("select st_asgeojson(" + spatialcol + ") as geojson, * from " + fullname + " where continent = 'South America';"); // iso_a3 = " + idformat + ";"); 
     query.on('row', function(result) {
    	var props = new Object;
        if (!result) {
          return res.send('No data found');
        } else {
 	    for (var k in result){
    	        if (result.hasOwnProperty(k)) {
		    var nm = "" + k;
		    if ((nm != "geojson") && nm != spatialcol){
		        props[nm] = result[k];
                    }
   	         }
	    }
	    coll.features.push({type: "Feature",crs: crsobj, geometry: JSON.parse(result.geojson), properties:props});
        }
      });

     query.on('end', function(result) {
            res.setHeader('Content-Type', 'application/json');
            res.send(coll);
     
      });
 

    }); 

   }); 

app.post('/vector/:schema/:table/features/intersect', function(req, res) {
    var queryshape = req.query.shape;
});
}


