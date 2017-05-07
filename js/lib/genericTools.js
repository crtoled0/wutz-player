

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