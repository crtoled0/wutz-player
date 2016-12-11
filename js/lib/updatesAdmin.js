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
var path = require('path');
var ipc = require('electron').ipcRenderer;
//var localAppPath = ipc.sendSync('getAppPath');
var localAppPath = path.dirname(process.mainModule.filename);
//if(ipc.sendSync('isDevMode'))
   // localAppPath = "./";
    
var fs = require('fs');
var os = require('os');
var logger = require('./log4Wutz');
var tempUpdatePath = os.homedir()+"/.wutz/updates";
//var userTmpPath = os.homedir()+"/.wutz";

var getRightPlatform = function(){
    
    var arch = os.arch();
    var osType = os.type();
    
    console.log(arch);
    console.log(osType);
    
    var bits = (arch.indexOf("64") !== -1)?"64":"32";
    
    switch(osType){
        case  "Windows_NT":
            return "win"+bits;
            break;
        case "Darwin":
             return "darwin"+bits;
             break;
        case "Linux":
             return "linux"+bits;
             break;
    }
};

var checkUpdates = function(callback){
   
   var sys = getRightPlatform();
   console.log(sys);
   window.AjaxWAdmin.callService("getUpdatesVersion/"+sys,null,"GET",function(result){
      
       logger.info("Is there something to Update ? : "+JSON.stringify(result));
       var up = {};
       up.updated=false;
       var localVersionPath =  localAppPath + "/package.json"; // require('./package.json');
       var lastUpdatedVersion = result["update-version"];
       logger.info("lastUpdatedVersion: "+lastUpdatedVersion);
       logger.info("localVersionPath : "+localVersionPath);
       
      // logger.info("process.env.npm_package_version ["+process.env.npm_package_version+"] ");
       //currUpVersion = process.env.npm_package_version;
       
        if (fs.existsSync(localVersionPath)) {
           
          var upd =  JSON.parse(fs.readFileSync(localVersionPath));
          var currUpVersion =  upd["version"];
          logger.info(currUpVersion);
          if(lastUpdatedVersion === currUpVersion){
              up.updated=true;
          }
          else{
            up.update2Install = lastUpdatedVersion;
            window.sessionStorage.setItem("pendUpgrade",JSON.stringify(result));
          }
        }
        
       callback(up);
  });
};


var applyUpdates = function(callback){
   
   var pendUpgrade = JSON.parse(window.sessionStorage.getItem("pendUpgrade"));
   
   console.log(pendUpgrade["content-file"]);
   var fileSize = pendUpgrade.size;
   
  // var fsExtra = require("fs.extra");
   var file_url = 'http://wutznet.com/'+pendUpgrade["content-file"];
   logger.info(file_url);
   var open = require("open");
   open(file_url);
   callback({downloading:true});
};


var closeAndOpenInstaller = function(){
    
    ipc.sendSync('justClose');
  
  /**
  var exec = require('child_process').execFile;
      exec(tempUpdatePath+'/installer.exe', function(err, data) {  
            //process.exit();
        });
  **/
  
  //var child = require('child_process');
  //child.fork("D:/WorkP/projects/electron/WutzPlayer/js/jobs/executeUpdateInstaller.js");
  //ipc.sendSync('exitAndRunInstaller');
  
  console.log("Closing Parent");
  //  process.exit(1);
    //logger.info(ress);
    /**
    var exec = require('child_process').execFile;
    exec(tempUpdatePath+'/installer.exe', function(err, data) {  
        console.log(err);
        console.log(data.toString());
    });
    **/
    
};


module.exports = {
  checkUpdates: checkUpdates,
  applyUpdates: applyUpdates,
  closeAndOpenInstaller: closeAndOpenInstaller
};