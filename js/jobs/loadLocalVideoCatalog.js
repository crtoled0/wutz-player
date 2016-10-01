/* 
 * Copyright (C) 2016 CRTOLEDO.
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 * MA 02110-1301  USA
 */

var fs = require('fs');
var path = require('path');
var os = require('os');
var jsmediatags = require("jsmediatags");


//var StringDecoder = require('string_decoder').StringDecoder;
//var decoder = new StringDecoder('utf8');


var logger = require('../lib/log4Wutz');

var walkLocalVideos = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walkLocalVideos(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } 
        else {
          if(file.toLowerCase().indexOf(".mp4") !== -1  || 
             file.toLowerCase().indexOf(".ogg") !== -1 || 
             file.toLowerCase().indexOf(".webm") !== -1) {
                results.push(file);
          }
          if (!--pending) done(null, results);
        }
      });
    });
  });
};
