exports.getFeatureResult = function(result, spatialcol) {
		var props = new Object;
		var crsobj = {
			"type" : "name",
			"properties" : {
				"name" : "urn:ogc:def:crs:EPSG:6.3:4326"
			}
		};
		//builds feature properties from database columns
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
	};