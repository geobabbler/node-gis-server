var pg = require('pg');
var conString = "postgres://rdsuser:ZAQ!xsw2@awspostgis.cj4hnqu23ghb.us-east-1.rds.amazonaws.com:5432/geodb"; //TODO: point to RDS instance
var client = new pg.Client(conString);

exports.bbox = function(req, res) {
    client.connect();
    //TODO: Select bounding box of GADM polygon based on ID, return as geojson.
//query = client.query('SELECT COUNT(date) AS count FROM visits WHERE date = $1', [date]);
    var idformat = "'" + req.params.id + "'";
    idformat = idformat.toUpperCase();  
    var query = client.query("select st_asgeojson(st_envelope(wkb_geometry)) as geojson from countries where iso = " + idformat + ";"); 
    var retval = "no data";
    query.on('row', function(result) {
        //console.log(result);
    
        if (!result) {
          return res.send('No data found');
        } else {
          //TODO: Do it this way or pure GeoJSON?
          res.send({id:req.params.id, shape: result.geojson});
        }
      }); 
    
    //res.send({iso:req.params.id, top: 90, bottom: -90, left: -180, right: 180});
};

exports.bboxSrid = function(req, res) {
    //TODO: Flesh this out. Logic will be similar to bounding box. Include transform to specified SRID.
    res.send({id:req.params.id, srid:req.params.srid, name: "bbox", description: "insert GeoJSON here"});
};

exports.polygon = function(req, res) {
    //TODO: Flesh this out. Logic will be similar to bounding box.
    res.send({id:req.params.id, name: "polygon", description: "insert GeoJSON here"});
};

exports.polygonSrid = function(req, res) {
    //TODO: Flesh this out. Logic will be similar to polygon. Include transform to specified SRID.
    res.send({id:req.params.id, srid:req.params.srid, name: "polygon", description: "insert GeoJSON here"});
};
