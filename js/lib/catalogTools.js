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
var logger = require('./log4Wutz');
var request = require("request");
var os = require("os");
var homePath = os.homedir()+"/.wutz";

var genTool = require("./genericTools");

var getCatalogFromFileSystem = function(onLoading,onFinish){

    var catJob = require("../jobs/loadFullCatalog");
    catJob.initLoading(onLoading,onFinish);

};



var sendCat2WutzCloud = function(callback){

    logger.info("sending cat to cloud");
    var fs = require('fs');
    //var homePath = window.sessionStorage.getItem("homePath");
    var config = JSON.parse(fs.readFileSync(homePath+"/json/config.json"));
    var catalog = JSON.parse(fs.readFileSync(homePath+"/json/catalog.json"));
    var songs = catalog.songs;
    logger.info("Total Songs ["+songs.length+"]");
    var smallArr = songs.splice(0,200);
    catalog.songs = smallArr;
    callback({totalSongs:songs.length});
    var sesTkn = window.sessionStorage.getItem("wutzSessToken");
    window.AjaxWAdmin.callService("uploadLocalCatalog",catalog,"POST",sesTkn,function(data){
      logger.info("I'm back ...");
      logger.info(data.Transaction);
      var resJson = data.catalog;
      var catId = resJson.cats[0].idcatalog;
      config.catid = catId;
      callback({catalogId:catId});
      updateSongs(catalog.bar_id,catId, songs, callback);
      fs.createWriteStream(homePath+"/json/config.json");
      fs.appendFile(homePath+"/json/config.json", JSON.stringify(config), function (err) {
             if (err) {
                    logger.info(err);
                     return
              }
                    logger.info("Config Edited");
                    console.log("Config Edited");
                  //  callback(config);
       });
    });
};


var updateCatalog = function(catId, data, callback){
    var sesTkn = window.sessionStorage.getItem("wutzSessToken");
    window.AjaxWAdmin.callService("updateLocalCatalog/"+catId,data,"POST",sesTkn,function(_res){
        callback(_res);
    });
 };

 var pullCatalog2Gen = function(catId, callback){
    var sesTkn = window.sessionStorage.getItem("wutzSessToken");
    window.AjaxWAdmin.callService("pullCat2Gen/"+catId,null,"GET",sesTkn,function(_res){
        callback(_res);
    });
 };

 var updateSongs = function(barId,catId,songs, callback){
     var tmpSubSongs = songs.splice(0,200);
     if(tmpSubSongs.length && tmpSubSongs.length > 0){
         var temCat = {bar_id:barId,songs:tmpSubSongs};
         updateCatalog(catId, temCat, function(_res){
                logger.info("Songs Left "+songs.length);
                callback({songsLeft:songs.length});
                updateSongs(barId,catId,songs,callback);
         });
     }
     else{
         pullCatalog2Gen(catId,function(_res){
             callback({finished:true});
             return ;
         });
     }
 };


 var getCurrentCatalogStructure = function(cb){
    var fs = require('fs');
    var catalog = JSON.parse(fs.readFileSync(homePath+"/json/catalog.json"));
    var songs = catalog.songs;
    var catStructure = {};
    var finishCounter = catalog.songs-1;
    for(var idx in songs){
       var song = songs[idx];
       if(!catStructure[song.songArtist])
            catStructure[song.songArtist] = {};
       if(!catStructure[song.songArtist][song.songAlbum])
            catStructure[song.songArtist][song.songAlbum] = [];
       if(song.track && song.track !== ""){
           var pattern = /^\d+\/\d+$/;
           if(pattern.test(song.track)){
               song.track = ((song.track).split("/"))[0];
           }
        }
        var _sortedArr = window.arrTools.insertIntoSortedArray(catStructure[song.songArtist][song.songAlbum],song,"track");
        catStructure[song.songArtist][song.songAlbum] = JSON.parse(JSON.stringify(_sortedArr));
    }
    cb(catStructure);
 };

 var saveFromStr2Cat = function(songList, callback){
   var catalogFilePath = homePath+"/json/catalog.json";
   var fs = require('fs');
   var catalog = JSON.parse(fs.readFileSync(catalogFilePath));
   catalog.songs = songList;
   fs.createWriteStream(catalogFilePath);
   fs.appendFile(catalogFilePath, JSON.stringify(catalog), function (err) {
                 if (err) {
                   logger.info(err);
                   callback({done:false,error:err});
                   return
                 }
                // logger.info("Config Edited");
                 callback({done:true});
   });
 };

 var getCatalogArtistList = function(catId, callback){
   var sesTkn = window.sessionStorage.getItem("wutzSessToken");
   window.AjaxWAdmin.callService("getArtistList/"+catId,null,"GET",sesTkn,function(_res){
       callback(_res);
   });
 };

 var getPendingPlayList = function(catId, dayToken, callback){
   var sesTkn = window.sessionStorage.getItem("wutzSessToken");
   var params = {};
       params.catId = catId;
       params.token = dayToken;
   window.AjaxWAdmin.callService("rescuePendingList/",params,"POST",sesTkn,function(_ready){
        window.AjaxWAdmin.callService("getFullCatalog/",params,"POST",sesTkn,function(_res){
        console.log("Start Loop");
        for(var i in _res){
             var tempSong = _res[i];
             if(tempSong.album_info && tempSong.album_info !== ""){
               tempSong.album_info = JSON.parse(tempSong.album_info);
                for(var j in tempSong.album_info.album.image){
                   var img = tempSong.album_info.album.image[j];
                   if(img.size === "large"){
                       tempSong.pic=img["#text"];
                       break;
                   }
                }
             }
             _res[i] = JSON.parse(JSON.stringify(tempSong));
          }
          callback(_res);
       });
   });
 };

 module.exports = {
  getCatalogArtistList: getCatalogArtistList,
  getPendingPlayList: getPendingPlayList,
  sendCat2WutzCloud: sendCat2WutzCloud,
  getCatalogFromFileSystem: getCatalogFromFileSystem,
  getCurrentCatalogStructure: getCurrentCatalogStructure,
  saveFromStr2Cat: saveFromStr2Cat
};
