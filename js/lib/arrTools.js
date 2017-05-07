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


;(function(window, document, undefined){
	"use strict";
        /**
     * The actual constructor of the Global object
     */
    var ArrToolsImpl = {
        _version : 0.1,
        _config : {
        }  
    };
	/**
     Private 
    **/
    function compareNumberOrString(val1,val2){
                    if(!isNaN(val1) && !isNaN(val1)){
                          var val1 = parseFloat(val1);
                          var val2 = parseFloat(val2);
                          if(val1 > val2)
                             return 1;
                          else if(val2 > val1)
                             return -1;
                          else
                             return 0;
                    }
                    else if(val1 === "" && val2 !== ""){
                        return -1;
                    }
                    else if(val2 === "" && val1 !== ""){
                        return 1;
                    }
                    else if(val2 === "" && val1 === ""){
                        return 0;
                    }
                    else{
                        var res = val1.localeCompare(val2);
                       // console.log(res);
                        return res;
                    }
    };

    function insertIntoSortedArrayHelperNoCol(arr,s,e, newElem){
                   var piv = Math.floor((e-s)/2) + s;
                    if(compareNumberOrString(newElem,arr[piv]) === 0){
                         arr.splice(piv, 0, newElem);
                         return arr;
                    }
                    else if(compareNumberOrString(newElem,arr[piv]) === 1){
                        if(!arr[piv+1]){
                            arr.push(newElem);
                            return arr;
                        }
                        else if(compareNumberOrString(newElem,arr[piv+1]) <= 0){
                            arr.splice(piv+1, 0, newElem);
                            return arr;
                        }
                        else{
                            s = piv+1;
                            var reSort = insertIntoSortedArrayHelperNoCol(arr,s,e, newElem);
                            return reSort;
                        }
                    }
                    else{
                        if(!arr[piv-1]){
                            arr = [newElem].concat(arr);
                            return arr;
                        }
                        else if(compareNumberOrString(newElem,arr[piv-1]) >= 0){
                            arr.splice(piv, 0, newElem);
                            return arr;
                        }
                        else{
                            e = piv-1;
                            return insertIntoSortedArrayHelperNoCol(arr,s,e, newElem);
                        }
                    }  
    };

    function insertIntoSortedArrayHelper(arr,s,e, newElem,col){
                   var piv = Math.floor((e-s)/2) + s;
                    if(compareNumberOrString(newElem[col],arr[piv][col]) === 0){
                         arr.splice(piv, 0, newElem);
                         return arr;
                    }
                    else if(compareNumberOrString(newElem[col],arr[piv][col]) === 1){
                        if(!arr[piv+1]){
                            arr.push(newElem);
                            return arr;
                        }
                        else if(compareNumberOrString(newElem[col],arr[piv+1][col]) <= 0){
                            arr.splice(piv+1, 0, newElem);
                            return arr;
                        }
                        else{
                            s = piv+1;
                            var reSort = insertIntoSortedArrayHelper(arr,s,e, newElem,col);
                            return reSort;
                        }
                    }
                    else{
                        if(!arr[piv-1]){
                            arr = [newElem].concat(arr);
                            return arr;
                        }
                        else if(compareNumberOrString(newElem[col],arr[piv-1][col]) >= 0){
                            arr.splice(piv, 0, newElem);
                            return arr;
                        }
                        else{
                            e = piv-1;
                            return insertIntoSortedArrayHelper(arr,s,e, newElem,col);
                        }
                    }
    };


    ArrToolsImpl.insertIntoSortedArray = function(arr,newElem,elemCol2Comp){
                 if(!arr || arr.length === 0)
                     return [newElem];
                 if(elemCol2Comp)
                  return  insertIntoSortedArrayHelper(arr,0,arr.length-1,newElem,elemCol2Comp);
                 else
                  return  insertIntoSortedArrayHelperNoCol(arr,0,arr.length-1,newElem);
    } ;
                

    ArrToolsImpl.sortArray = function(arr,col2Comp){
        if(!arr || arr.length <= 1)
            return arr;
        var sortedArr = [];
        for(var i in arr){
            if(col2Comp){
               sortedArr = ArrToolsImpl.insertIntoSortedArray(sortedArr,arr[i],col2Comp);
            }
            else{
               sortedArr = ArrToolsImpl.insertIntoSortedArray(sortedArr,arr[i]);
            }
        }
        return sortedArr;
    };


    ArrToolsImpl.arrayColumn = function(matrix, col){
            var column = [];
            for(var i=0; i<matrix.length; i++){
                    column.push(matrix[i][col]);
            }
            return column;
    };
		
	var ArrTools = function(){};
	ArrTools.prototype = ArrToolsImpl;
	ArrTools = new ArrTools();
	window.arrTools = ArrTools;
})(window, document);