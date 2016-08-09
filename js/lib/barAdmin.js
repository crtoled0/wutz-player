/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var logger = require('./log4Wutz');
var os = require('os');
var app2WutzAdm = require("./app2wutzAdm");
var fs = require('fs');

var sep = os.platform()==="win32"?"\\":"/";
var wutzEdidFsPath = os.homedir()+sep+".wutz";
window.sessionStorage.setItem("homePath",wutzEdidFsPath);

var configPath = wutzEdidFsPath+sep+"json/config.json";
var catalogPath = wutzEdidFsPath+sep+"json/catalog.json";



var serverConfMapp = {"desc": "desc",
                      "email": "email",
                      "id": "bar_id",
                      "idcatalog": "catid",
                      "lat": "latitude",
                      "lon": "longitute",
                      "nombreBar": "nombreBar",
                      "representante": "representante",
                      "songsAllowed": "songsAllowed",
                      "telefono": "telefono"};
                  
var confTemplate = {"bar_id":"",
                    "catid":"",
                    "musicPath":"",
                    "separator":sep,
                    "serverhost":"http://wutznet.com",
                    "localProwser":"/bwclient/index.html",
                    "androidAppURL":"/apps/Wutz.apk",
                    "downloadAppURL":"https://build.phonegap.com/apps/2149695",
                    "songsAllowed":4,
                    "guid":"",
                    "superClient":[],
                    "nombreBar":"",
                    "representante":"",
                    "telefono":"",
                    "email":"",
                    "latitude":"",
                    "longitute":"",
                    "dayToken":"123123",
                    "desc":""};
    //var config = JSON.parse(fs.readFileSync("json/config.json"));
    
var login = function(authAcc,callback) {  
  
  logger.info("Going to login "+JSON.stringify( authAcc ));
  
  app2WutzAdm.goPost("login",authAcc, function(result){
      console.log("I'm back ["+result.logged+"]");
      callback(result);
  });
};


var register = function(regData,callback) {
    
  app2WutzAdm.goPost("registerBar",regData, function(result){
      console.log("I'm back ["+result+"]");
      callback(result);
  });
};

var saveConf = function(conf,callback) {
  
    app2WutzAdm.goPost("uploadLocalServerInfo",conf, function(result){
      console.log("I'm back ["+result+"]");
      callback(result);
  });
};

var saveConfigFile = function(conf,callback) {
      fs.createWriteStream(configPath);
      fs.appendFile(configPath, JSON.stringify(conf), function (err) {
                    if (err) {
                      logger.info(err);
                      return
                    } 
                    logger.info("Config Edited");
                    callback(conf);
           });
};


var loadNeededFiles = function(callback){
    
    console.log("Loading Conf File");
    var config = null; 
    var existCat = true;
    var currBar  = window.sessionStorage.getItem("currBar");
   // var loggedIn  = window.sessionStorage.getItem("logged");
    if (fs.existsSync(configPath)) {
           
           config =  JSON.parse(fs.readFileSync(configPath));
           
           if(config.catid === "")
               existCat = false;
           if(currBar === config.bar_id){
                callback(config,existCat);
                return;
           }
           else{
               loadBarFromWutzServer(currBar, function(config){
                   if(config.catid === ""){
                        existCat = false; 
                        callback(config,existCat);
                        return;
                   }
               });
           }
               
    }
    else{
         loadBarFromWutzServer(currBar, function(config){
                   if(config.catid === ""){
                        existCat = false; 
                        callback(config,existCat);
                        return;
                   }
          });
    }
};


var loadBarFromWutzServer = function(currBar, callback){
  logger.info("Getting Bar Info..");
  
  app2WutzAdm.goGet("getBar/"+currBar,function(result){
      logger.info(result);
          
          var newGuid = generateUUID();
          var newConf = confTemplate;
          newConf.guid = newGuid;
          newConf.superClient.push(newConf.guid);
          
          for(var key in serverConfMapp){
              var confAtt = serverConfMapp[key];
              newConf[confAtt] = result[key];
                //logger.info(attributename+": "+myobject[attributename]);
          }
          
          saveConfigFile(newConf,function(setCfig){
              callback(setCfig);
          });
  });
};

var generateUUID = function(){
    var d = new Date().getTime();
    if(window.performance && typeof window.performance.now === "function"){
        d += performance.now(); //use high-precision timer if available
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};

module.exports = {
  saveConfigFile: saveConfigFile,
  loadNeededFiles: loadNeededFiles,
  saveConf: saveConf,
  register: register, 
  login : login
};