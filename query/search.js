
var logger = require('../src/logger'),
    queries = require('geopipes-elasticsearch-backend').queries,
    get_layers = require('../helper/layers'),
    sort = require('../query/sort');

function generate( params ){

  var centroid = null;

  if ( params.lat && params.lon ){
    centroid = {
      lat: params.lat,
      lon: params.lon
    };
  } 
  
  var query = queries.distance( centroid, { size: params.size } );
  
  if (params.bbox) {
    query = queries.bbox ( centroid, { size: params.size, bbox: params.bbox } );
  }

  // add search condition to distance query
  query.query.filtered.query = {
    'bool': {
      'must': [{ 
          'match': {
            'name.default': params.input
          }
        }
      ]   
    }
  };
  
  if (params.input_admin) {
    var admin_fields = get_layers(['admin','admin1_abbr','alpha3']);
    query.query.filtered.query.bool.should = [];

    admin_fields.forEach(function(admin_field) {
      var match = {};
      match[admin_field] = params.input_admin;
      query.query.filtered.query.bool.should.push({
         'match': match
      });
    });
  }

  query.sort = query.sort.concat(sort);
  // console.log( JSON.stringify( query, null, 2 ) );

  return query;
}

module.exports = generate;