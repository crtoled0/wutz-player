var logger = require('./log4Wutz');


exports.getCatalogFromFileSystem = function(onLoading,onFinish){
  
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


exports.sendCat2WutzCloud = function(callback){
     
    logger.info("sending cat to cloud");
    var rest = require("./app2wutzAdm");
    var fs = require('fs');    
    var homePath = window.sessionStorage.getItem("homePath");
    var config = JSON.parse(fs.readFileSync(homePath+"/json/config.json"));
    //logger.info(config);
    //logger.info(catalog);
    
    rest.uploadCurrCatalog(function(data){
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