exports.getJsonP = function (callback, result) {
	var retval = "";
	if (typeof callback != "undefined") {
		retval = callback.replace("?","") + "({0});";
		retval = String.format(retval, JSON.stringify(result));
	} else {
		retval = JSON.stringify(result);
	}
	return retval;
};

String.format = function () {
	var s = arguments[0];
	for (var i = 0; i < arguments.length - 1; i++) {
		var reg = new RegExp("\\{" + i + "\\}", "gm");
		s = s.replace(reg, arguments[i + 1]);
	}
	return s;
};