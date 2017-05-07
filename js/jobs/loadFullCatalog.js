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

var walkMedia = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walkMedia(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } 
        else {
          if(file.toLowerCase().indexOf(".mp3") !== -1 || 
             file.toLowerCase().indexOf(".m4a") !== -1 || 
             file.toLowerCase().indexOf(".mp4") !== -1  || 
             file.toLowerCase().indexOf(".ogg") !== -1 || 
             file.toLowerCase().indexOf(".tube") !== -1 || 
             file.toLowerCase().indexOf(".webm") !== -1) {
                results.push(file);
          }
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

var walkIMG = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walkIMG(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } 
        else {
          if(file.toLowerCase().indexOf(".jpg") !== -1 || 
             file.toLowerCase().indexOf(".png") !== -1) {
                results.push(file);
          }
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

String.prototype.capitalize = function(){
   return this.replace( /(^|\s)([a-z])/g , function(m,p1,p2){ return p1+p2.toUpperCase(); } );
};
console.log("LOADING CATALOG PROCESS HERE TOO...");
 var homePath = os.homedir()+"/.wutz";
var config = JSON.parse(fs.readFileSync(homePath+"/json/config.json"));
  var musPath = config.musicPath;
   var sep = config.separator;
  
  var endedLoading = false;
  var songList = [];
  
  var glbExtOnLoading = null;
  var glbExtOnFinish = null;

var initLoading = function(onLoading, onFinish){
   
   console.log("LOADING FILES PROCESS"); 

   glbExtOnLoading = onLoading;
   glbExtOnFinish = onFinish;

   walkMedia(musPath, function(err, results) {
           //  console.log("Looping Folders");
                if (err) throw err;

                for(var i=0;i< results.length;i++){

                  var songFullPath = results[i];
                  var songRelPath = songFullPath.replace(musPath,"");
                  songRelPath = JSON.parse( JSON.stringify( songRelPath ) );
                  var splited = songRelPath.split(sep);

                  var songArtist = (splited[1] !== "")?splited[1]:"Others";
                  var songAlbum = (splited[splited.length-2] !== "")?splited[splited.length-2]:"Unknown";

                  tempSong = {};
                  tempSong.songArtist = songArtist;
                  tempSong.songAlbum = songAlbum;
                  tempSong.songFileName = splited[splited.length-1];
                  tempSong.songPath = songFullPath.replace(tempSong.songFileName,"");
                  tempSong.track = "";
                  tempSong.pic = "";
                  var extAr = tempSong.songFileName.split(".");
                  var ext = extAr[extAr.length-1];
                  tempSong.songName = extAr[0];
                  tempSong.extension = ext;
                  if(["mp3","m4a"].indexOf(ext.toLowerCase()) !== -1){
                      tempSong.mediaType = "audio";
                  }
                  else{
                      tempSong.mediaType = "video";
                  }
                  if("tube".indexOf(ext.toLowerCase()) !== -1){
                     // tempSong.mediaType = "youtube";
                      tempSong.songPath = "http://youtube.com/embed/";
                      tempSong.songFileName = fs.readFileSync(songFullPath).toString();
                  }

                    // console.log(tempSong);      
                    songList.push(tempSong);     
                  }        
                // console.log(songList);
                 endedLoading = true;
                 results = null;
     });

     var interv = setInterval(function(){
        if(endedLoading){
           clearInterval(interv);
           var i = 0;
           var count = songList.length;
           getArrayMd3(i,count);
      }

     },1000);

};

//var mp3t = require('../lib/mp3Tools');

//var strUtls = id3.StringUtils;
var getArrayMd3 = function(index, total){

    if(index < total){
     //   var fileBuffer = fs.readFileSync(songList[index].songPath+sep+songList[index].songFileName);
        
        try{
                songList[index].songArtist = songList[index].songArtist.capitalize();
                songList[index].songAlbum = songList[index].songAlbum.capitalize();
                var ext = songList[index].extension;
                songList[index].songName = songList[index].songName.replace(ext,"");
                songList[index].track = "";
                songList[index].pic = "";
         if(songList[index].extension !== "tube"){ 
          new jsmediatags.Reader(songList[index].songPath+sep+songList[index].songFileName)
                  .setTagsToRead(["title", "album", "track"])
                  .read({
            onSuccess: function(tags) {
              var res = tags["tags"];
            //  logger.info("How it looks null ? : album " + res.album);
              console.log(res);
               var perc = Math.round((index/total)*100);
                       // console.log("["+Math.round((index/total)*100)+"%] Loaded");
                        songList[index].songName = res.title?res.title.replace("  "," "):songList[index].songFileName;
                        var id3Artist = songList[index].songArtist;//res.artist?res.artist.replace("  "," "):songList[index].songArtist; 
                        var id3Album = res.album?res.album.replace("  "," "):songList[index].songAlbum;
                        id3Artist = id3Artist.capitalize();
                        id3Album = id3Album.capitalize();
                        //id3Artist.replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g,"");
                        //id3Album = id3Album.replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g,"");
                        
                        var ext = songList[index].extension;
                        songList[index].songArtist = id3Artist;
                        songList[index].songAlbum = id3Album;
                        songList[index].songName = songList[index].songName.replace(ext,"");
                        songList[index].track = res.track?res.track:"";
                        songList[index].pic = "";
                        songList[index].songArtist = songList[index].songArtist.trim();
                        songList[index].songAlbum = songList[index].songAlbum.trim();
                        //logger.info(songList[index].songAlbum + " : :" + songList[index].track);
                        
                        songList[index].songFileName = (songList[index].songFileName).replace(/\+/ig,"%2B");

                        logger.info(JSON.stringify({"perc":perc,"song":songList[index].songFileName}));
                       glbExtOnLoading({"perc":perc,"song":songList[index].songFileName});
                     //   console.log(JSON.stringify({"perc":perc,"song":songList[index].songName}));
                        
                        walkIMG(songList[index].songPath, function(err, results) {
                            if (err) {
                                //throw err
                                //logger.info(JSON.stringify({"error":err}));
                                glbExtOnLoading({"error":err});
                                console.log(JSON.stringify({"error":err}));
                                return ;
                            };
                            try {
                                for(var i=0;i<results.length;i++){
                                    var picExt = results[i].substring(results[i].length - 3, results[i].length);
                                    var picPathName = homePath+"/img/fronts/"+songList[index].songAlbum+"."+picExt;
                                    if(results[i].toLowerCase().indexOf("front") !== -1)
                                        fs.createReadStream(results[i]).pipe(fs.createWriteStream(picPathName));
                                }
                            }
                            catch(err) {
                            //    logger.info(JSON.stringify({"error":err}));
                                glbExtOnLoading({"error":err});
                                console.log(JSON.stringify({"error":err}));
                            }
                            finally{
                                res = null;
                                index++;
                                getArrayMd3(index, total);
                            }
                        });
            },
            onError: function(error) {
              logger.info('Cant load  ID3 info:(', error.type, error.info);
              //res = null;
              index++;
              getArrayMd3(index, total);
            }
          });
         }
         else{
             index++;
             getArrayMd3(index, total);
         }
          
      }
      catch(e){
          logger.info("Te pille  ... "+e);
      }
        /**
        id3.parse(fileBuffer).then(function (res){
          
        });
        **/
    }
    else{
       var cat2Save = {};
       cat2Save.bar_id = config.bar_id;
       cat2Save.songs = songList;
       
       fs.writeFile(homePath+"/json/catalog.json", JSON.stringify(cat2Save),function(err){
            if(err){
              //  logger.info(JSON.stringify({"error":err}));
                glbExtOnLoading({"error":err});
                console.log(JSON.stringify({"error":err}));
            } 
            else {
              //  logger.info(JSON.stringify({"done":true}));
              glbExtOnLoading({"done":true});
                console.log(JSON.stringify({"done":true}));
            }
            glbExtOnFinish();
       });
       return;
    }
};


module.exports = {
  initLoading: initLoading
};