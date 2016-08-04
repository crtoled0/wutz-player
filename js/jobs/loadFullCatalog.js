var fs = require('fs');
var path = require('path');
var id3 = require('id3-parser');
var os = require('os');

var logger = require('../lib/log4Wutz');

var walkMP3 = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walkMP3(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } 
        else {
          if(file.toLowerCase().indexOf(".mp3") !== -1) {
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

//console.log("LOADING CATALOG ...");
logger.info("LOG FROM PROCESS");
 var homePath = os.homedir()+"/.wutz";
var config = JSON.parse(fs.readFileSync(homePath+"/json/config.json"));
  var musPath = config.musicPath;
   var sep = config.separator;
  
  var endedLoading = false;
  var songList = [];

   walkMP3(musPath, function(err, results) {
        
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
    //  console.log("getting ID3 ");
      var i = 0;
      var count = songList.length;
          
       getArrayMd3(i,count);
       
   }

},1000);


var mp3t = require('../lib/mp3Tools');
var getArrayMd3 = function(index, total){
  
    if(index < total){
        mp3t.getTagsFromPath(songList[index].songPath+sep+songList[index].songFileName, function(res){
                        var perc = Math.round((index/total)*100)+"%";
                       // console.log("["+Math.round((index/total)*100)+"%] Loaded");
                        songList[index].songName = res.title?res.title.replace("  "," "):songList[index].songFileName;
                        var id3Artist = songList[index].songArtist;//res.artist?res.artist.replace("  "," "):songList[index].songArtist; 
                        var id3Album = res.album?res.album.replace("  "," "):songList[index].songAlbum;
                        //id3Artist.replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g,"");
                        //id3Album = id3Album.replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g,"");
                        
                        songList[index].songArtist = id3Artist;
                        songList[index].songAlbum = id3Album;
                        songList[index].songName = songList[index].songName.replace(".mp3","");
                        songList[index].track = res.track?res.track:"";
                        songList[index].pic = "";

                        //logger.info(JSON.stringify({"perc":perc,"song":songList[index].songName}));
                        console.log(JSON.stringify({"perc":perc,"song":songList[index].songName}));
                        
                        walkIMG(songList[index].songPath, function(err, results) {
                            if (err) {
                                //throw err
                                //logger.info(JSON.stringify({"error":err}));
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
                                console.log(JSON.stringify({"error":err}));
                            }
                            finally{
                                res = null;
                                index++;
                                getArrayMd3(index, total);
                            }
                        });
                        
                       
        });
    }
    else{
       var cat2Save = {};
       cat2Save.bar_id = config.bar_id;
       cat2Save.songs = songList;
       
       fs.writeFile(homePath+"/json/catalog.json", JSON.stringify(cat2Save),function(err){
            if(err){
              //  logger.info(JSON.stringify({"error":err}));
                console.log(JSON.stringify({"error":err}));
            } 
            else {
              //  logger.info(JSON.stringify({"done":true}));
                console.log(JSON.stringify({"done":true}));
            }
       });
       return;
    }
};