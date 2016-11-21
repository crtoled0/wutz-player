var fs = require('fs');
var ID3 = require("jsmediatags");//require('id3-parser');
//var stream = require('stream');
var os = require('os');
var logger = require('./log4Wutz');

 var homePath = os.homedir()+"/.wutz";

/**
exports.getAndLoadSong = function(song) {
  //logger.info('Started');
  var filPath = song.file_path;
  var filName = song.file_name;  
  var songPath = filPath+"/"+filName;
  fs.createReadStream(songPath).pipe(fs.createWriteStream(homePath+'/audio/currSong.mp3'));
  
  return true;
};
**/


var getTagsFromPath = function(songPath, callback){
    
    ID3.read(songPath, {
            onSuccess: function(tags) {
              var res = tags["tags"];
              //console.log(res);
              callback(res);
            },
            onError: function(error) {
              logger.info(':(', error.type, error.info);
              return ;
            }
    });
};


var getAllTags = function(song, callback){
    var filPath = song.file_path;
    var filName = song.file_name;  
    var songPath = filPath+"/"+filName;
    getTagsFromPath(songPath, callback);
   
};

var loadFrontAlbumPic = function(song, callback){
    var filPath = song.file_path;
    var filName = song.file_name;  
    var songPath = filPath+"/"+filName;
    // filePath as string 
   try{
        if(song.album){
            var possImg = homePath+"/img/fronts/"+song.album;
            if (fs.existsSync(possImg+".jpg")) {
                song.pic = possImg+".jpg";
                callback(song);
                return;
            }
            else if (fs.existsSync(possImg+".png")) {
                song.pic = possImg+".png";
                callback(song);
                return;
            }
        }
        
        if(song.album_info){
            var albInfo = JSON.parse(song.album_info);
            if(albInfo && albInfo.album && albInfo.album.image){
                albInfo.album.image.forEach(function(imgNode){
                     if(imgNode.size === "large"){
                         song.pic = imgNode["#text"];
                         callback(song);
                         return ;
                     }
                });
            }
        }
        
        if(fs.existsSync(songPath)){
           // var fileBuffer = fs.readFileSync(songPath);
            getTagsFromPath(songPath,function (tag) {

                if(!tag.picture){
                   // callback(song);
                    return;
                }
                //logger.info(tag);
                var mime = tag.picture.format;
                var picExt = mime==="image/png"?"png":"jpg";
                var picPathName = homePath+"/img/fronts/"+tag.album+"."+picExt;
                song.pic = picPathName;

                if (fs.existsSync(picPathName)) {
                    //logger.info('Found file');
                    callback(song);
                    return;
                }
                else{
                 //   var imgDataArr = tag.image.data;
                 //   var myStream = new stream.Readable();
                    var i = 0;
                    fs.createWriteStream(picPathName);
                    fs.appendFile(picPathName, new Buffer(tag.picture.data), function (err) {
                        if (err) {
                            logger.info(err);
                            return ;
                        } else {
                          //logger.info("File Size "+ tag.image.data.length);
                          //logger.info("File Created");
                          callback(song);
                        }
                    });
                }
            });
        }
        else{
            song.err = true;
            song.exc = "File ["+songPath+"] NOT Found";
            callback(song);
            return ;
        }
   }catch(e){
       
       song.err = true;
       song.exc = e;
       callback(song);
       return ;
   }
};



module.exports = {
  loadFrontAlbumPic: loadFrontAlbumPic,
  getAllTags: getAllTags,
  getTagsFromPath: getTagsFromPath
};