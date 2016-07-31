exports.getCatalogFromFileSystem = function(onLoading,onFinish){
  
    var spawn = require('child_process').spawn;
    var loadCatJob = spawn('node', ['./js/jobs/loadFullCatalog.js'], 
    {
        detached: false //if not detached and your main process dies, the child will be killed too
       // stdio: [process.stdin, loadCatJob.stdout, loadCatJob.stderr] //those can be file streams for logs or wathever
    });
    
    
    loadCatJob.stdout.on('data', 
        function(info){
           // console.log(""+info);
          onLoading(""+info);
        });
    
   
   
    loadCatJob.stderr.on('data', function(data){
        console.log("ps stderr:" +data);
     });
    
    loadCatJob.on('close', function(code) { 
        console.log("CODE "+code);
        loadCatJob = null 
        onFinish();
        //send socket informations about the job ending
    });
};

exports.sendCat2Cloud_DEPRECATED = function(callback){
   var spawn = require('child_process').spawn;
    var loadCatJob = spawn('node', ['./js/jobs/uploadCatalog2Cloud.js'], 
    {
        detached: false //if not detached and your main process dies, the child will be killed too
       // stdio: [process.stdin, loadCatJob.stdout, loadCatJob.stderr] //those can be file streams for logs or wathever
    });
    
    
    loadCatJob.stdout.on('data', 
        function(info){
            console.log("INFO: " + info);
    });
    
   
   
    loadCatJob.stderr.on('data', function(data){
        console.log("ps stderr:" +data);
     });
    
    loadCatJob.on('close', function(code) { 
        console.log("CODE "+code);
        loadCatJob = null 
        callback(true);
        //send socket informations about the job ending
    });
    
};



exports.sendCat2WutzCloud = function(callback){
     
    console.log("sending cat to cloud");
     var rest = require('restler');
     var fs = require('fs');    
     var homePath = window.sessionStorage.getItem("homePath");
    var config = JSON.parse(fs.readFileSync(homePath+"/json/config.json"));
    var catalog = JSON.parse(fs.readFileSync(homePath+"/json/catalog.json"));
    
    rest.postJson('http://wutz.co.uk/delegate/uploadLocalCatalog.php', catalog).on('complete', function(data) {
                
               console.log("I'm back ...");
               console.log(data.Transaction);
               var resJson = data.catalog;//JSON.parse(data.catalog);
               var catId = resJson.cats[0].idcatalog;
               config.catid = catId;
                
              fs.createWriteStream(homePath+"/json/config.json");
              fs.appendFile(homePath+"/json/config.json", JSON.stringify(config), function (err) {
                    if (err) {
                      console.log(err);
                      return
                    } 
                    console.log("Config Edited");
                    callback(config);
                });
    });
};