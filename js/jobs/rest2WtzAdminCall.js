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
var logger = require('../lib/log4Wutz');
var os = require('os');
var fs = require('fs');
var homePath = os.homedir()+"/.wutz";
var rest = require('request');

var args = process.argv.slice(2);
//var callValues = {service:"login",
  //                method:"post",
    //              params:{barid:"te_fija_ono",
      //            pass:"Welcome1"}};
var callValues = JSON.parse(args[1]);

//console.log("RECEIVED JSON service ["+callValues.service+"]");

var service = callValues.service;
var method = callValues.method;

var head = {"content-type":"application/json charset=utf-8",
               "accept-charset":"utf-8",
               "accept-encoding":"utf-8"};

   if(method.toLowerCase() === "post" && service === "uploadCatalog"){
       
       var catalog = JSON.parse(fs.readFileSync(homePath+"/json/catalog.json"));
      // logger.info("catalog:"+JSON.stringify(catalog));
       rest.post({headers: head,url:'http://wutznet.com/uploadLocalCatalog', 
                   form: JSON.stringify(catalog)}, 
                   function(err,httpResponse,body){
                     var res = {"err":err,
                                "status":httpResponse!==undefined?httpResponse.statusCode:"",
                                "result":body};
                    //  logger.info(httpResponse);
                     console.log(JSON.stringify(res));
                   }
       );
   }
   else if(method.toLowerCase() === "post"){
       var jsonParams = JSON.stringify(callValues.params);
       rest.post({url:'http://wutznet.com/'+service, 
                   form: jsonParams}, 
                   function(err,httpResponse,body){
                     var res = {"err":err,
                                "status":httpResponse!==undefined?httpResponse.statusCode:"",
                                "result":body};
                            
                     console.log(JSON.stringify(res));
                   }
         );
   }
   else if(method.toLowerCase() === "get"){
       rest.get({url:'http://wutznet.com/'+service}, 
                 function(err,httpResponse,body){
                     
                     var res = {"err":err,
                                "status":httpResponse!==undefined?httpResponse.statusCode:"",
                                "result":body};
                            
                     console.log(JSON.stringify(res));
                   //  console.log("Back from Server ["+err+"] ["+httpResponse+"] ["+body+"]");  
                    // callback(httpResponse);
                 }
         );
   }