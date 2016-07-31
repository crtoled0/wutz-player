 var rest = require('restler');
 var fs = require('fs');
    
    var homePath = window.sessionStorage.getItem("homePath");
    var config = JSON.parse(fs.readFileSync(homePath+"/json/config.json"));
    var catalog = JSON.parse(fs.readFileSync(homePath+"/json/catalog.json"));
    
  //  console.log("Ready2Upload "+JSON.stringify(catalog));
  //  console.log("Ready2Upload "+JSON.stringify(config));
    
    rest.postJson('http://wutz.co.uk/delegate/uploadLocalCatalog.php', catalog).on('complete', function(data) {
                
               console.log("I'm back ...");
              // console.log(data);
               
               
               console.log(data.Transaction);
               var resJson = JSON.parse(data.catalog);
               
              // console.log(resJson);
               
               var catId = resJson.cats[0].idcatalog;
              // console.log(catId);
               config.catid = catId;
                
              fs.createWriteStream(homePath+"/json/config.json");
              fs.appendFile(homePath+"/json/config.json", JSON.stringify(config), function (err) {
                    if (err) {
                      console.log(err);
                      return
                    } 
                    console.log("Config Edited");
                });
               
    });