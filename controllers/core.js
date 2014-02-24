var pg = require('pg');
var geojson = require('../helpers/geojson');

module.exports.controller = function (app) {

	/* feature retrieval */

	/**
	 * retrieve all features (this could be really slow and is probably not what you really want to do)
	 */
	app.get('/vector/:schema/:table/:geom', function (req, res, next) {
		var client = new pg.Client(app.conString);
		var geom = req.params.geom.toLowerCase();
		if ((geom != "features") && (geom != "geometry")) {
			res.status(404).send("Resource '" + geom + "' not found");
			return;
		}
		var schemaname = req.params.schema;
		var tablename = req.params.table;
		var fullname = schemaname + "." + tablename;
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
				query = client.query("select st_asgeojson(st_transform(" + spatialcol + ",4326)) as geojson, * from " + fullname + ";");
				coll = {
					type : "FeatureCollection",
					features : []
				};
			} else if (geom == "geometry") {
				query = client.query("select st_asgeojson(st_transform(" + spatialcol + ",4326)) as geojson from " + fullname + ";");
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
						coll.features.push(geojson.getFeatureResult(result, spatialcol));
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
				next();
			});
		});
	});

	/**
	 * retrieve all features that intersect the input GeoJSON geometry
	 */
	app.post('/vector/:schema/:table/:geom/intersect', function (req, res, next) {
		//console.log(JSON.stringify(req.body));
		var queryshape = JSON.stringify(req.body);
		//res.status(501).send('Intersect not implemented');
		var geom = req.params.geom.toLowerCase();
		if ((geom != "features") && (geom != "geometry")) {
			res.status(404).send("Resource '" + geom + "' not found");
			return;
		}
		var client = new pg.Client(app.conString);
		var schemaname = req.params.schema;
		var tablename = req.params.table;
		var fullname = schemaname + "." + tablename;
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
				query = client.query("select st_asgeojson(st_transform(" + spatialcol + ",4326)) as geojson, * from " + fullname + " where ST_INTERSECTS(" + spatialcol + ", ST_SetSRID(ST_GeomFromGeoJSON('" + queryshape + "'),4326));");
				coll = {
					type : "FeatureCollection",
					features : []
				};
			} else if (geom == "geometry") {
				query = client.query("select st_asgeojson(st_transform(" + spatialcol + ",4326)) as geojson from " + fullname + " where ST_INTERSECTS(" + spatialcol + ", ST_SetSRID(ST_GeomFromGeoJSON('" + queryshape + "'),4326));");
				coll = {
					type : "GeometryCollection",
					geometries : []
				};
			}

			query.on('row', function (result) {
				var props = new Object;
				if (!result) {
					return res.send('No data found');
				} else {
					if (geom == "features") {
						coll.features.push(geojson.getFeatureResult(result, spatialcol));
					} else if (geom == "geometry") {
						var shape = JSON.parse(result.geojson);
						//shape.crs = crsobj;
						coll.geometries.push(shape);
					}
				}
			});

			query.on('end', function (result) {
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

	/*  Schema inspection functions  */

	/* fetch table schema */
	app.get('/vector/layer/:schema/:table/schema', function (req, res, next) {
		console.log("in");
		var client = new pg.Client(app.conString);
		var schemaname = req.params.schema;
		var tablename = req.params.table;
		var fullname = schemaname + "." + tablename;
		console.log(fullname);
		var sql = "SELECT n.nspname as schemaname,c.relname as table_name,a.attname as column_name,format_type(a.atttypid, a.atttypmod) AS type,col_description(a.attrelid, a.attnum) as comments";
		sql = sql + " FROM pg_class c INNER JOIN pg_namespace n ON c.relnamespace = n.oid LEFT JOIN pg_attribute a ON a.attrelid = c.oid";
		sql = sql + " WHERE a.attnum > 0 and c.relname = '" + tablename + "' and n.nspname = '" + schemaname + "';";
		var retval = {
			schema : schemaname,
			table : tablename,
			columns : []
		};
		client.connect();
		var query = client.query(sql);
		query.on('row', function (result) {
			var props = new Object;
			if (!result) {
				return res.send('No data found');
			} else {
				retval.columns.push({
					column : result.column_name,
					dataType : result.type,
					description : result.comments
				});
			}
		});

		query.on('end', function (result) {
			res.setHeader('Content-Type', 'application/json');
			res.send(retval);
			//
		});

	});

	/* fetch table schema (not compatible with PostGIS versions prior to 1.5) */
	app.get('/vector/layers/:geotype', function (req, res, next) {
		var client = new pg.Client(app.conString);
		var sql = "SELECT 'geometry' as geotype, * FROM geometry_columns;";
		if (req.params.geotype.toLowerCase() == "geography") {
			sql = "SELECT 'geography' as geotype, * FROM geography_columns;";
		} else if (req.params.geotype.toLowerCase() == "all") {
			sql = "SELECT 'geometry' AS geotype, * FROM geometry_columns UNION SELECT 'geography' as geotype, * FROM geography_columns;";
		}
		var retval = [];
		client.connect();
		var query = client.query(sql);
		query.on('row', function (result) {
			var props = new Object;
			if (!result) {
				return res.send('No data found');
			} else {
				retval.push(getRow(result, req.params.geotype.toLowerCase()));
			}
		});

		query.on('end', function (result) {
			res.setHeader('Content-Type', 'application/json');
			res.send(retval);
		});

	});

	function getRow(result, geomtype) {
		var retval = {
			geoType : result.geotype,
			database : result.f_table_catalog,
			schema : result.f_table_schema,
			table : result.f_table_name,
			spatialColumn : null,
			dimension : result.coord_dimension,
			srid : result.srid,
			spatialType : result.type
		};
		if ((geomtype == "geometry") || (geomtype == "all")) {
			retval.spatialColumn = result.f_geometry_column;
		} else {
			retval.spatialColumn = result.f_geography_column;
		}
		return retval;
	}
}