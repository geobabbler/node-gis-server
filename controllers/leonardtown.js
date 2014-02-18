var pg = require('pg');
var geojson = require('../helpers/geojson');

module.exports.controller = function (app) {

	/* feature retrieval */

	/**
	 * retrieve all Leonardtown building of specified property type
	 */
	app.get('/leonardtown/buildings/:geom', function (req, res, next) {
		var client = new pg.Client(app.conString);
		var geom = req.params.geom.toLowerCase();
		if ((geom != "features") && (geom != "geometry")) {
			res.status(404).send("Resource '" + geom + "' not found");
			return;
		}
		var tablename = "leonardtown_bldgs";
		var schemaname = "public";
		var fullname = schemaname + "." + tablename;
		var spatialcol = "";
		var proptype = req.query.type;
		var whereclause = ";";
		if (typeof proptype != "undefined"){
		if (proptype.toLowerCase() != "all") {
			whereclause = " where structure_ = '" + proptype + "';";
		}
		}
		var coll;
		var sql = "";
		client.connect(function (err) {
			//var meta = client.query("select * from geometry_columns where f_table_name = '" + tablename + "' and f_table_schema = '" + schemaname + "';");
			if (err) {
				res.status(500).send(err);
				//client.end();
				return console.error('could not connect to postgres', err);				
			}
			client.query("select * from geometry_columns where f_table_name = '" + tablename + "' and f_table_schema = '" + schemaname + "';", function (err, result) {
				if (err) {
					res.status(500).send(err);
					client.end();
					return console.error('error running query', err);
				}
				console.log("meta: " + result.rows.length);
				spatialcol = result.rows[0].f_geometry_column;
				if (geom == "features") {
					sql = "select st_asgeojson(st_transform(" + spatialcol + ",4326)) as geojson, * from " + fullname + whereclause;
					coll = {
						type : "FeatureCollection",
						features : []
					};
				} else if (geom == "geometry") {
					sql = "select st_asgeojson(st_transform(" + spatialcol + ",4326)) as geojson from " + fullname + whereclause
						coll = {
						type : "GeometryCollection",
						geometries : []
					};
				}
				console.log(spatialcol);
				client.query(sql, function (err, result) {
					if (err) {
						res.status(500).send(err);
						client.end();
						return console.error('error running query', err);
					}
//					console.log(result.rows.length);
					for (var i = 0; i < result.rows.length; i++) {
						if (geom == "features") {
							coll.features.push(geojson.getFeatureResult(result.rows[i], "shape"));
						} else if (geom == "geometry") {
							var shape = JSON.parse(result.rows[i].geojson);
							//shape.crs = crsobj;
							coll.geometries.push(shape);
						}
					}
					client.end();
					res.send(coll);
				});
			});
		});
	});

}