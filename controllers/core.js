var pg = require('pg');
//var conString = "postgres://{username}:{password}@{host}:{port}/{database}";
var conString = "postgres://bdollins:ZAQ!xsw2@localhost:5432/geo2";

module.exports.controller = function (app) {

	/* feature retrieval */

	/**
	 * retrieve all features (this could be really slow and is probably not what you really want to do)
	 */
	app.get('/vector/:schema/:table/features', function (req, res) {
		var client = new pg.Client(conString);
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
			var coll = {
				type : "FeatureCollection",
				features : []
			};
			spatialcol = row.f_geometry_column;
			var query = client.query("select st_asgeojson(st_transform(" + spatialcol + ",4326)) as geojson, * from " + fullname + ";"); // iso_a3 = " + idformat + ";");
			query.on('row', function (result) {
				var props = new Object;
				if (!result) {
					return res.send('No data found');
				} else {
					for (var k in result) {
						if (result.hasOwnProperty(k)) {
							var nm = "" + k;
							if ((nm != "geojson") && nm != spatialcol) {
								props[nm] = result[k];
							}
						}
					}
					coll.features.push({
						type : "Feature",
						crs : crsobj,
						geometry : JSON.parse(result.geojson),
						properties : props
					});
				}
			});

			query.on('end', function (result) {
				res.setHeader('Content-Type', 'application/json');
				res.send(coll);

			});

		});

	});

	/**
	 * retrieve all features that intersect the input GeoJSON geometry
	 */
	app.post('/vector/:schema/:table/features/intersect', function (req, res) {
		//console.log(JSON.stringify(req.body));
		var queryshape = JSON.stringify(req.body);
		//res.status(501).send('Intersect not implemented');

		var client = new pg.Client(conString);
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
			var coll = {
				type : "FeatureCollection",
				features : []
			};
			spatialcol = row.f_geometry_column;
			var query = client.query("select st_asgeojson(st_transform(" + spatialcol + ",4326)) as geojson, * from " + fullname + " where ST_INTERSECTS(" + spatialcol + ", ST_SetSRID(ST_GeomFromGeoJSON('" + queryshape + "'),4326));"); // iso_a3 = " + idformat + ";");
			query.on('row', function (result) {
				var props = new Object;
				if (!result) {
					return res.send('No data found');
				} else {
					for (var k in result) {
						if (result.hasOwnProperty(k)) {
							var nm = "" + k;
							if ((nm != "geojson") && nm != spatialcol) {
								props[nm] = result[k];
							}
						}
					}
					coll.features.push({
						type : "Feature",
						crs : crsobj,
						geometry : JSON.parse(result.geojson),
						properties : props
					});
				}
			});

			query.on('end', function (result) {
				res.setHeader('Content-Type', 'application/json');
				res.send(coll);

			});
			query.on('error', function (error) {
				//handle the error
				res.status(500).send(error)
			});

		});
	});

	/*  Schema inspection functions  */

	/* fetch table schema */
	app.get('/vector/:schema/:table/schema', function (req, res) {
		var client = new pg.Client(conString);
		var schemaname = req.params.schema;
		var tablename = req.params.table;
		var fullname = schemaname + "." + tablename;
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

		});

	});

	/* fetch table schema (not compatible with PostGIS versions prior to 1.5) */
	app.get('/vector/layers/:geotype', function (req, res) {
		var client = new pg.Client(conString);
		var sql = "SELECT 'geometry' as geotype, * FROM geometry_columns;";
		if (req.params.geotype.toLowerCase() == "geography")
		{
		sql = "SELECT 'geography' as geotype, * FROM geography_columns;";
		}
		else if (req.params.geotype.toLowerCase() == "all")
		{
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
				/*retval.push({
					geoType : "geometry",
					database : result.f_table_catalog,
					schema : result.f_table_schema,
					table : result.f_table_name,
					spatialColumn : result.f_geometry_column,
					dimension : result.coord_dimension,
					srid : result.srid,
					spatialType : result.type
				});*/
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
		}
		else{
			retval.spatialColumn = result.f_geography_column;
		}
		return retval;
	}
}