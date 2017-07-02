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


var packager = require('electron-packager');
var uglifyJS = require("uglify-js");
var fs = require("fs");
var path = require('path');

var walkJS = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walkJS(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        }
        else {
          if(file.toLowerCase().indexOf(".js") !== -1) {
                results.push(file);
          }
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

var packageForOS = function(options){
   packager(options, function done_callback (err, appPaths) {
        if(err){
         console.log("ERRO: "+err);
         return ;
       }

         appPaths.forEach(function(path){
             walkJS(path+"/resources/app/js",function(err, _jsFiles){
                 // console.log(_jsFiles);
                  _jsFiles.forEach(function(_val,idx){
                      var result = uglifyJS.minify(_val);
                      console.log("Minifying ... "+_val);
                      fs.writeFile(_val, result.code,function(err){
                          if(err){
                              console.log(JSON.stringify({"error":err}));
                          }
                      });
                  });
             });
         });
     });
};


var optionsLinux = {dir:".",
           platform:"linux",
           arch:"all",
           ignore: "(.gitignore|nbproject|utils.txt|build.js|installer.js|build)",
           icon: "D:/WorkP/projects/electron/dist/icon.icns",
           out:"D:/WorkP/projects/electron/dist",
           overwrite:true,
           prune:true};

var optionsWin = {dir:".",
           platform:"win32",
           arch:"all",
           ignore: "(.gitignore|nbproject|utils.txt|build.js|installer.js|build)",
           icon: "D:/WorkP/projects/electron/dist/icon.ico",
           out:"D:/WorkP/projects/electron/dist",
           overwrite:true,
           prune:true};

//packageForOS(optionsLinux);
packageForOS(optionsWin);
