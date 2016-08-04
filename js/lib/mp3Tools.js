var fs = require('fs');
var ID3 = require('id3-parser');
var stream = require('stream');
var os = require('os');
//var logger = require('./log4Wutz');

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


exports.getTagsFromPath = function(songPath, callback){
    
    var fileBuffer = fs.readFileSync(songPath);
    ID3.parse(fileBuffer).then(function (tag) {
        callback(tag);
    });
};


exports.getAllTags = function(song, callback){
    var filPath = song.file_path;
    var filName = song.file_name;  
    var songPath = filPath+"/"+filName;
    // filePath as string 
    var fileBuffer = fs.readFileSync(songPath);

    ID3.parse(fileBuffer).then(function (tag) {
        callback(tag);
    });
};

exports.loadFrontAlbumPic = function(song, callback){
    var filPath = song.file_path;
    var filName = song.file_name;  
    var songPath = filPath+"/"+filName;
    // filePath as string 
    if(song.album){
        var possImg = homePath+"/img/fronts/"+song.album;
        if (fs.existsSync(possImg+".jpg")) {
           // logger.info('Found file');
            song.pic = possImg+".jpg";
            callback(song);
            return;
        }
        else if (fs.existsSync(possImg+".png")) {
          //  logger.info('Found file');
            song.pic = possImg+".png";
            callback(song);
            return;
        }
    }
    
    var fileBuffer = fs.readFileSync(songPath);
    ID3.parse(fileBuffer).then(function (tag) {
        
        if(!tag.image){
           // callback(song);
            return;
        }
        //logger.info(tag);
        var mime = tag.image.mime;
        var picExt = mime==="image/png"?"png":"jpg";
        var picPathName = homePath+"/img/fronts/"+tag.album+"."+picExt;
        song.pic = picPathName;
        
        if (fs.existsSync(picPathName)) {
            //logger.info('Found file');
            callback(song);
            return;
        }
        else{
            var imgDataArr = tag.image.data;
          //  var imgDataArr = new Buffer(imgDataArr);

            var myStream = new stream.Readable();
            var i = 0;
            fs.createWriteStream(picPathName);
            
            fs.appendFile(picPathName, new Buffer(tag.image.data), function (err) {
                if (err) {
                 // logger.info(err);
                } else {
                  //logger.info("File Size "+ tag.image.data.length);
                  //logger.info("File Created");
                  callback(song);
                }
            });
        }
    });
};