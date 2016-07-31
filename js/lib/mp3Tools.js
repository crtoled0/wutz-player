var fs = require('fs');
var ID3 = require('id3-parser');
var stream = require('stream');
var os = require('os');

 var homePath = os.homedir()+"/.wutz";

/**
exports.getAndLoadSong = function(song) {
  //console.log('Started');
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
            console.log('Found file');
            song.pic = possImg+".jpg";
            callback(song);
            return;
        }
        else if (fs.existsSync(possImg+".png")) {
            console.log('Found file');
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
        console.log(tag);
        var mime = tag.image.mime;
        var picExt = mime==="image/png"?"png":"jpg";
        var picPathName = homePath+"/img/fronts/"+tag.album+"."+picExt;
        song.pic = picPathName;
        
        if (fs.existsSync(picPathName)) {
            console.log('Found file');
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
                  console.log(err);
                } else {
                  console.log("File Size "+ tag.image.data.length);
                  console.log("File Created");
                  callback(song);
                }
            });
        }
    });
};