var logger = require('./log4Wutz');
var request = require("request");
var os = require("os");
var homePath = os.homedir()+"/.wutz";

var genTool = require("./genericTools");

var getCatalogFromFileSystem = function(onLoading,onFinish){

    var catJob = require("../jobs/loadFullCatalog");
    catJob.initLoading(onLoading,onFinish);

};

var getCatalogFromFileSystem_OLD = function(onLoading,onFinish){

    var ipc = require('electron').ipcRenderer;
    var localAppPath = ipc.sendSync('getAppPath');
    var isDevMode = ipc.sendSync('isDevMode');
    if(isDevMode)
        localAppPath = ".";

    var spawn = require('child_process').spawn;
    var loadCatJob = spawn('node', [localAppPath+'/js/jobs/loadFullCatalog.js'],
    {
        detached: false //if not detached and your main process dies, the child will be killed too
       // stdio: [process.stdin, loadCatJob.stdout, loadCatJob.stderr] //those can be file streams for logs or wathever
    });


    loadCatJob.stdout.on('data',
        function(info){
          logger.info("Process Listener"+info);
          onLoading(""+info);
        });



    loadCatJob.stderr.on('data', function(data){
        logger.info("ps stderr:" +data);
     });

    loadCatJob.on('close', function(code) {
        logger.info("CODE "+code);
        loadCatJob = null;
        onFinish();
        //send socket informations about the job ending
    });
};


var sendCat2WutzCloud_OLD = function(callback){

    logger.info("sending cat to cloud");
   // var rest = require("./app2wutzAdm");
    var fs = require('fs');
   // var homePath = window.sessionStorage.getItem("homePath");
    var config = JSON.parse(fs.readFileSync(homePath+"/json/config.json"));
    var catalog = JSON.parse(fs.readFileSync(homePath+"/json/catalog.json"));
    //logger.info(config);
    //logger.info(catalog);
    window.AjaxWAdmin.callService("uploadLocalCatalog",catalog,"POST",function(data){
   // rest.uploadCurrCatalog(function(data){
      logger.info("I'm back ...");
      logger.info(data.Transaction);
      var resJson = data.catalog;//JSON.parse(data.catalog);
      var catId = resJson.cats[0].idcatalog;
      config.catid = catId;

      fs.createWriteStream(homePath+"/json/config.json");
      fs.appendFile(homePath+"/json/config.json", JSON.stringify(config), function (err) {
             if (err) {
                    logger.info(err);
                     return
              }
                    logger.info("Config Edited");
                    callback(config);
       });
    });
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

 module.exports = {
  sendCat2WutzCloud: sendCat2WutzCloud,
  getCatalogFromFileSystem: getCatalogFromFileSystem,
  getCurrentCatalogStructure: getCurrentCatalogStructure,
  saveFromStr2Cat: saveFromStr2Cat
};
