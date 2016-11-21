var logger = require('./log4Wutz');
var request = require("request");


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
    var homePath = window.sessionStorage.getItem("homePath");
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
    var homePath = window.sessionStorage.getItem("homePath");
    var config = JSON.parse(fs.readFileSync(homePath+"/json/config.json"));
    var catalog = JSON.parse(fs.readFileSync(homePath+"/json/catalog.json"));
    var songs = catalog.songs;
    console.log("Total Songs ["+songs.length+"]");
    var smallArr = songs.splice(0,200);
    catalog.songs = smallArr;
    
    window.AjaxWAdmin.callService("uploadLocalCatalog",catalog,"POST",function(data){
      logger.info("I'm back ...");
      logger.info(data.Transaction);
      var resJson = data.catalog;
      var catId = resJson.cats[0].idcatalog;
      config.catid = catId;
      updateSongs(catalog.bar_id,catId, songs, function(){
          callback(config);
      });        
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
    window.AjaxWAdmin.callService("updateLocalCatalog/"+catId,data,"POST",function(_res){
        callback(_res);
    });
 };
 
 var pullCatalog2Gen = function(catId, callback){
    window.AjaxWAdmin.callService("pullCat2Gen/"+catId,null,"GET",function(_res){
        callback(_res);
    });
 };
 
 var updateSongs = function(barId,catId,songs, callback){
     var tmpSubSongs = songs.splice(0,200);
     if(tmpSubSongs.length && tmpSubSongs.length > 0){
         var temCat = {bar_id:barId,songs:tmpSubSongs};
         updateCatalog(catId, temCat, function(_res){
                console.log("Songs Left "+songs.length);
                updateSongs(barId,catId,songs,callback);
         });
     }
     else{
         pullCatalog2Gen(catId,function(_res){
             callback();
             return ;
         });
     }
 };
 
 
 module.exports = {
  sendCat2WutzCloud: sendCat2WutzCloud,
  getCatalogFromFileSystem: getCatalogFromFileSystem
};