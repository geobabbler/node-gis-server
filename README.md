Node GIS Server
============

Node.js application to provide a GeoJSON-based REST interface to PostGIS data.

See package.json for dependencies.

Changelog
---------
2014-02-08 - Began implementing MVC as per http://timstermatic.github.io/blog/2013/08/17/a-simple-mvc-framework-with-node-and-express/

2014-02-11 - Added core.js to implement basic feature query. Implemented return of GeoJSON FeatureCollection.

2014-02-14 - Added function to perform intersect query using input GeoJSON geometry. Added function to return schema of a specified table. Defaulted all output features to WGS84.
