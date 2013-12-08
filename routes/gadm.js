var pg = require('pg');
var conString = "postgres://bdollins:moondog1@localhost:5432/leonardtown";
var client = new pg.Client(conString);

exports.bbox = function(req, res) {
	//query = client.query('SELECT COUNT(date) AS count FROM visits WHERE date = $1', [date]);
//console.log(client);
    client.connect();
    var query = client.query("select st_asgeojson(the_geom) as geojson from ltown_bldgs where cartodb_id = 1;");
    var retval = "no data";
    query.on('row', function(result) {
        console.log(result);
    
        if (!result) {
          return res.send('No data found');
        } else {
          //retval = result.geojson;
          res.send({id:req.params.id, shape: result.geojson});
        }
      }); 
    
    //res.send({iso:req.params.id, top: 90, bottom: -90, left: -180, right: 180});
};
 
exports.polygon = function(req, res) {
    res.send({id:req.params.id, name: "polygon", description: "insert GeoJSON here"});
};
