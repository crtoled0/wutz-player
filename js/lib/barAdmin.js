/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var os = require('os');
var rest = require('restler');
var fs = require('fs');

var sep = os.platform()==="win32"?"\\":"/";
var wutzEdidFsPath = os.homedir()+sep+".wutz";
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
                    "serverhost":"http://wutz.co.uk",
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
  
  rest.postJson('http://wutz.co.uk/delegate/wzDelServ2Serv.php?fnc=auth', authAcc).on('complete', function(data) {
      // console.log("He volvido ");  
        callback(data);
  });
};

var register = function(conf,callback) {
  rest.postJson('http://wutz.co.uk/delegate/registerBar.php', conf).on('complete', function(data) {
          callback(data);
  });
};

var saveConf = function(conf,callback) {
  rest.postJson('http://wutz.co.uk/delegate/uploadLocalCatalog.php', conf).on('complete', function(data) {
          callback(data);
  });
};

var saveConfigFile = function(conf,callback) {
      fs.createWriteStream(configPath);
      fs.appendFile(configPath, JSON.stringify(conf), function (err) {
                    if (err) {
                      console.log(err);
                      return
                    } 
                    console.log("Config Edited");
                    callback(conf);
           });
};



var loadNeededFiles = function(callback){
    console.log("Loading Conf File");
    var config = null; 
    var existCat = false;
    var currBar  = window.sessionStorage.getItem("currBar");
   // var loggedIn  = window.sessionStorage.getItem("logged");
    
    if (fs.existsSync(catalogPath)) {
        existCat = true;
    }
    
    if (!isFirstTime() && fs.existsSync(configPath)) {
           
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

var isFirstTime = function(){
    
    if (!fs.existsSync(wutzEdidFsPath)){
        fs.mkdirSync(wutzEdidFsPath);
        fs.mkdirSync(wutzEdidFsPath+sep+"json");
        fs.mkdirSync(wutzEdidFsPath+sep+"img");
        fs.mkdirSync(wutzEdidFsPath+sep+"img"+sep+"fronts");
        return true;
    }
    window.sessionStorage.setItem("homePath",wutzEdidFsPath);
    return false;
};

var loadBarFromWutzServer = function(currBar, callback){
  console.log("Getting Bar Info..");
  rest.get('http://wutz.co.uk/delegate/wutzDelegMan.php?fnc=getBarDetails&barId='+currBar).on('complete', function(result) {
        if (result instanceof Error) {
          console.log('Error:', result.message);
          this.retry(5000); // try again after 5 sec
        } else {
          console.log(result);
          
          var newGuid = generateUUID();
          var newConf = confTemplate;
          newConf.guid = newGuid;
          newConf.superClient.push(newConf.guid);
          
          for(var key in serverConfMapp){
              var confAtt = serverConfMapp[key];
              newConf[confAtt] = result[key];
                //console.log(attributename+": "+myobject[attributename]);
          }
          
          saveConfigFile(newConf,function(setCfig){
              callback(setCfig);
          });
        }
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