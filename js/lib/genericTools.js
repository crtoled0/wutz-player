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

var mergeOverwriteJSONObjects = function(objA,objB,callback){
      for(var key in objA){
          objB[key] = objA[key];
      }
      callback(objB);
};


var mergeMappedJSONObjects = function(objA,objB,mappingObj,callback){
      var finalObj = JSON.parse(JSON.stringify(objB));
      for(var key in objA){
          if(mappingObj[key]){
             finalObj[mappingObj[key]] = objA[key];
          }
          else{
             finalObj[key] = objA[key];
          }
      }
      callback(finalObj);
};

var compareNumberOrString = function(val1,val2,callback){
    if(!isNaN(val1) && !isNaN(val1)){
          var val1 = parseFloat(val1);
          var val2 = parseFloat(val2);
          if(val1 > val2)
             callback(1);
          else if(val2 > val1)
             callback(-1);
          else
             callback(0);
    }
    else{
        callback(val1.localeCompare(val2));
    }
};


module.exports = {
  mergeOverwriteJSONObjects: mergeOverwriteJSONObjects,
  mergeMappedJSONObjects:mergeMappedJSONObjects,
  compareNumberOrString:compareNumberOrString
};
