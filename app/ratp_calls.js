const https = require('https');
const host = 'api-ratp.pierre-grimaud.fr';
const port = 443;

'use strict';

const type_transport = {
  'métro':'metros',
  'métros':'metros',
  'metro':'metros',
  'metros':'metros',
  'bus':'bus',
  'rer':'rers',
  'rers':'rers',
  'tram':'tramways',
  'trams':'tramways',
  'tramway':'tramways',
  'tramways':'tramways'
}

var rejectedPromise = (error) =>  Promise.reject(new Error(error))
var resolvedPromise = (msg) => Promise.resolve(msg)


var get_type = (value) => {
  let transport_type = undefined;
  transport_type = type_transport[value.toLowerCase().trim()];
  if(transport_type === undefined) transport_type = value.toLowerCase().trim();
  return transport_type;
}

var api_calls = (options) => {
  return new Promise((resolve, reject) => {
    // Make the HTTP get request to get the API
    https.get(options, (res) => {
      let body = ''; // var to store the response chunks
      res.on('data', (d) => { body += d; }); // store each response
      res.on('end', () => {
        let result = JSON.parse(body).result
        //console.log(result)
        if(result === undefined) {
          reject(JSON.parse(body))
        }
        //regarde si la réponse de l'API contient directement message dans son result => c'est une erreur qui est envoyé par l'API 
        if (result.message !== undefined) {
          reject(JSON.parse(body))
        }
        else {
          resolve(JSON.parse(body))
        }
      });
      res.on('error', (error) => {
        reject(error);
      });
    });
  });
}

var verif_response = (response) => {
  let result = JSON.parse(body).result
  console.log( JSON.stringify(result))
  if (result.message !== undefined) {
    return rejectedPromise(response)
  }
  else {
     return resolvedPromise(response)
  }

}

//API Request: api-ratp.pierre-grimaud.fr/v3/stations/bus/58?_format=json
module.exports.call_stations = (type, code) => {
  let path = '/v3/stations/'+get_type(type)+'/'+code+'?_format=json';
  console.log('API Request: ' + host + path);
  return api_calls({host: host, path: path, port: port}).then( (content) => {
     //console.log( JSON.stringify(content.result.schedules));
     let stations = content.result.stations
     let output = stations.map( (station) => station.slug );
    return resolvedPromise(output)
  }).catch( (error) => {
    return rejectedPromise(error)
  });
}

var call_schedules = (type, code, station, way) => {
  let path = '/v3/schedules/'+get_type(type)+'/'+code+'/'+station+'/'+way+'?_format=json';
  console.log('API Request: ' + host + path);
  return api_calls({host: host, path: path, port: port}).then( (content) => {
     //console.log( JSON.stringify(content.result.schedules));
      return resolvedPromise(content.result.schedules)
      
    }).catch( (error) => {    
      return rejectedPromise(error)
  })
}


//GET /destinations/bus/58?_format=json
module.exports.call_destination = function (type, code) {
  let path = '/v3/destinations/'+get_type(type)+'/'+code+'?_format=json';
  console.log('API Request: ' + host + path);
  return api_calls({host: host, path: path, port: port}).then( (content) => {
     console.log( JSON.stringify(content.result.destinations));
     return resolvedPromise(content.result.destinations);
  }).catch( (error) => {
    return rejectedPromise(error)
  });
}

module.exports.call_schedules = call_schedules