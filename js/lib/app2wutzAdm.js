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
var logger = require('./log4Wutz');

var doCall = function(service, method, jsonParams,callback){
  
  var ipc = require('electron').ipcRenderer;
  var localAppPath = ipc.sendSync('getAppPath');
  var isDevMode = ipc.sendSync('isDevMode');
  if(isDevMode)
      localAppPath = ".";
  
    var callValues = {service:service,
                      method:method,
                      params:jsonParams};
    //{\"service\":\"login\",\"method\":\"post\",\"params\":{\"barid\":\"te_fija_ono\",\"pass\":\"Welcome1\"}}
    var strJson = JSON.stringify(JSON.stringify(callValues));
    strJson = strJson.substr(1,strJson.length-2);
    //strJson = strJson.substr(strJson.length-1,1);
  //  logger.info("GOINGGGGG :"+strJson);
  
  
    
    var spawn = require('child_process').spawn;
    var callJob = spawn('node', [localAppPath+'/js/jobs/rest2WtzAdminCall.js','--data', JSON.stringify(callValues)], 
    {
        detached: false //if not detached and your main process dies, the child will be killed too
       // stdio: [process.stdin, loadCatJob.stdout, loadCatJob.stderr] //those can be file streams for logs or wathever
    });
    
    
    callJob.stdout.on('data', 
        function(info){
        //  logger.info("Result ::: "+info);
          var callResponse = JSON.parse(""+info);
          if(callResponse.err !== null){
              callback(callResponse.err);
          }
          else{
              console.log(""+info);
              callback(JSON.parse(callResponse.result));
          }
        });
    
   
   
    callJob.stderr.on('data', function(data){
        console.log("ps stderr:" +data);
     });
    
    callJob.on('close', function(code) { 
     //   logger.info("CODE "+code);
        callJob = null 
      //  onFinish();
        //send socket informations about the job ending
    });
};


var goGet = function(service, callback){
    doCall(service, "get", null,function(result){
        callback(result);
    });
};

var goPost = function(service, jsonParams,callback){
    doCall(service, "post", jsonParams, function(result){
        callback(result);
    });
};

var uploadCurrCatalog = function(callback){
    doCall("uploadCatalog", "post", {}, function(result){
        callback(result);
    });
};

module.exports = {
  goGet: goGet,
  goPost: goPost,
  uploadCurrCatalog: uploadCurrCatalog
};