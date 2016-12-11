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
 var request = require("request");
 
  var updateCatalog = function(catId, data, callback){
     var options = {
              method : "POST",
              url: "http://localhost:8001/WutzAdmin/updateLocalCatalog/"+catId,
              headers: {
                    "Content-Type":"application/json"
              }
    };
    options["body"] = JSON.stringify(data);
    request(options, function (err, resp, body){
        callback(body);
    });
 };
 
 var pullCatalog2Gen = function(catId, callback){
     var options = {
              method : "GET",
              url: "http://localhost:8001/WutzAdmin/pullCat2Gen/"+catId,
              headers: {
                    "Content-Type":"application/json"
              }
    };
    //options["body"] = JSON.stringify(data);
    request(options, function (err, resp, body){
        callback(body);
    });
 };
 
 var updateSongs = function(catId,songs){
     var tmpSubSongs = songs.splice(0,200);
     if(tmpSubSongs.length && tmpSubSongs.length > 0){
         var temCat = {bar_id:catalog.bar_id,songs:tmpSubSongs};
         updateCatalog(catId, temCat, function(_res){
                console.log("Songs Left "+songs.length);
                updateSongs(catId,songs);
         });
     }
     else{
         
         pullCatalog2Gen(catId,function(_res){
             console.log(_res);
         });
         return ;
     }
 };
 
 
 var catalog = JSON.parse(fs.readFileSync("C:/Users/CRTOLEDO/.wutz/json/catalog.json"));
 var songs = catalog.songs;
 var counter = 0;
 var smallArr = songs.splice(0,200);
 catalog.songs = smallArr;
 
var options = {
              method : "POST",
              url: "http://localhost:8001/WutzAdmin/uploadLocalCatalog",
              headers: {
                    "Content-Type":"application/json"
              }
    };
    options["body"] = JSON.stringify(catalog);
    request(options, function (err, resp, body){
        res = JSON.parse(body);
        var catId = res.catalog.cats[0].idcatalog;
        console.log("Created : CatId : "+res.catalog.cats[0].idcatalog);
        var counter = 200;
        console.log("Total Songs ["+songs.length+"]");
        updateSongs(catId, songs);
    });