var pg = require('pg');

module.exports.controller = function (app) {

	/* feature retrieval */

	/**
	 * retrieve all features (this could be really slow and is probably not what you really want to do)
	 */
	app.get('/leonardtown/buildings/:bldgtype/:geom', function (req, res, next) {
		var client = new pg.Client(app.conString);
		var geom = req.params.geom.toLowerCase();
		if ((geom != "features") && (geom != "geometry")) {
			res.status(404).send("Resource '" + geom + "' not found");
			return;
		}
		var proptype = req.params.bldgtype;
		var whereclause = ";";
		if (proptype.toLowerCase() != "all"){
			whereclause = " where structure_ = '" + proptype + "';";
		}
		var tablename = "leonardtown_bldgs";
		var schemaname = "public";
		var fullname = "public.leonardtown_bldgs";
		client.connect();
		var crsobj = {
			"type" : "name",
			"properties" : {
				"name" : "urn:ogc:def:crs:EPSG:6.3:4326"
			}
		};
		var idformat = "'" + req.params.id + "'";
		idformat = idformat.toUpperCase();
		var spatialcol = "";
		var meta = client.query("select * from geometry_columns where f_table_name = '" + tablename + "' and f_table_schema = '" + schemaname + "';");
		meta.on('row', function (row) {
			var query;
			var coll;
			spatialcol = row.f_geometry_column;
			if (geom == "features") {
				query = client.query("select st_asgeojson(st_transform(" + spatialcol + ",4326)) as geojson, * from " + fullname + whereclause);
				coll = {
					type : "FeatureCollection",
					features : []
				};
			} else if (geom == "geometry") {
				query = client.query("select st_asgeojson(st_transform(" + spatialcol + ",4326)) as geojson from " + fullname + whereclause);
				coll = {
					type : "GeometryCollection",
					geometries : []
				};
			}
			query.on('row', function (result) {
				if (!result) {
					return res.send('No data found');
				} else {
					if (geom == "features") {
						coll.features.push(getFeatureResult(result, spatialcol));
					} else if (geom == "geometry") {
						var shape = JSON.parse(result.geojson);
						//shape.crs = crsobj;
						coll.geometries.push(shape);
					}
				}
			});

			query.on('end', function (err, result) {
				res.setHeader('Content-Type', 'application/json');
				res.send(coll);
			});
			
			query.on('error', function (error) {
				//handle the error
				//res.status(500).send(error);
				//next();
			});
		});
	});
	
		function getFeatureResult(result, spatialcol) {
		var props = new Object;
		var crsobj = {
			"type" : "name",
			"properties" : {
				"name" : "urn:ogc:def:crs:EPSG:6.3:4326"
			}
		};
		for (var k in result) {
			if (result.hasOwnProperty(k)) {
				var nm = "" + k;
				if ((nm != "geojson") && nm != spatialcol) {
					props[nm] = result[k];
				}
			}
		}

		return {
			type : "Feature",
			crs : crsobj,
			geometry : JSON.parse(result.geojson),
			properties : props
		};
	}
}