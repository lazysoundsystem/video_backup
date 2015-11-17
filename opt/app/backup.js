#!/usr/bin/env node

/*
 * Backup youtube playlists.
 *
 * Usage: backup
 */

var apiKey = process.env.YOUTUBE_API_KEY;

var https = require('https');
var playlists = require('./playlists');
var fs = require('fs');
var dataStore = {};


var writeFile = function(playlistName, playlistId, items) {
  var path = "/opt/data/" + playlistName.replace(/\//g, '-') + "-" + new Date().toJSON().slice(0,10) + ".json";

  fs.open(path, 'w+', function(error, fd) {
    if(error) {
      return console.log('Error opening ' + path, error);
    }
    fs.writeFile(path, '{' + playlistId + ':' + JSON.stringify(items) + '}', function(error) {
      if(error) {
        return console.log('Error writing data to ' + path, error);
      }
      console.log("Processed data saved to " + path);
    });
  });
}

var queryApi = function(playlistName, playlistId, nextPageToken) {

  var body = '', videoDetail = {};
  var fields = encodeURIComponent('nextPageToken,items/snippet(position,title,resourceId/videoId)');

  var options = {
    hostname: 'www.googleapis.com',
    path: '/youtube/v3/playlistItems?part=snippet&maxResults=50&fields=' + fields + '&playlistId=' + playlistId + '&key=' + apiKey + '&pageToken=' + nextPageToken
  };

  https.get(options, function(res) {
    res.on('data', function(d) {
      body += d;
    });
    res.on('end', function() {
      var parsed = JSON.parse(body);
      var items = parsed['items'];
      for (key in items) {
        if (items.hasOwnProperty(key)) {
          videoDetail = {};
          videoDetail['title'] = items[key]['snippet']['title'];
          videoDetail['videoId'] = items[key]['snippet']['resourceId']['videoId'];
          dataStore[items[key]['snippet']['position']] = videoDetail;
        }
      }
      if (parsed['nextPageToken'] != undefined) {
        queryApi(playlistName, playlistId, parsed['nextPageToken']);
      }
      else {
        writeFile(playlistName, playlistId, dataStore);
      }
    });
  }).on('error', function(e) {
    console.error(e);
  });
}

var run = function() {
  for (key in playlists) {
    if (playlists.hasOwnProperty(key)) {
      var playlistId = playlists[key];
      dataStore = {};
      queryApi(key, playlistId, '');
    }
  }
}

run();
