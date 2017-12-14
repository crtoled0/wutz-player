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
	var WutzTranslatorImpl = {
	    _version : 0.1,
	    _config : {
			'defaultLang' : 'es'
	    },
            _attributes : {},
            loadWutzTranslator : function(lang, section,callback){
							  if(typeof section === "function"){
									callback = section;
									section = "/";
								}
								else
									section+="/";

                var lang2Load = "";
                var transMod = this;
                if(lang){
                    lang2Load = lang;
                }
                else{
                   lang2Load = navigator.language || navigator.userLanguage;
                   lang2Load = lang2Load.substring(0,2);
                }
                $.getJSON( "locale/"+section+lang2Load+".json", function(_jsonAtts) {
									   //console.log(_jsonAtts);
										 transMod._attributes = {};
                     transMod._attributes = _jsonAtts;
                  //   transMod.transPageHtml();
										 if(callback)
                     		callback(transMod._attributes);
                });

            },
            trans: function(attName,replaceTokens){
                var transMod = this;
                var attVal = transMod._attributes[attName];
                if(!replaceTokens)
                    return attVal;
                else{
									  for(var key in replaceTokens){
											attVal = attVal.replace("__"+key+"__",replaceTokens[key]);
										}
                }
                return attVal;
            },
            transPageHtml: function(){
                var transMod = this;
                $("[loc-trans]").each(function(i){
                        var htObj = $(this);
                        var htmlObj = $(this).attr("loc-trans");
												htmlObj = htmlObj.split(":");
												htmlObj = "{\""+htmlObj[0].replace(/'/ig,"")+"\":\""+htmlObj[1].replace(/'/ig,"")+"\"}";

                        //console.log(typeof htmlObj + " : "+htmlObj);
                        htmlObj = JSON.parse(htmlObj);
                        $.each(htmlObj, function(objAtt, attName) {
                                if(objAtt !== "html")
                                        htObj.attr(objAtt, transMod._attributes[attName]);
                                else
                                        htObj.html(transMod._attributes[attName]);
                        });
                });
            },
						transHtmlSection: function(jqSection){
                var transMod = this;
                $("[loc-trans]", jqSection).each(function(i){
                        var htObj = $(this);
                        var htmlObj = $(this).attr("loc-trans");
                        htmlObj = htmlObj.replace(/'/ig,"\"");
                        //console.log(typeof htmlObj + " : "+htmlObj);
                        htmlObj = JSON.parse(htmlObj);
                        $.each(htmlObj, function(objAtt, attName) {
                                if(objAtt !== "html")
                                        htObj.attr(objAtt, transMod._attributes[attName]);
                                else
                                        htObj.html(transMod._attributes[attName]);
                        });
                });
            }
	};

	var WutzTranslator = function(){};
	WutzTranslator.prototype = WutzTranslatorImpl;
	WutzTranslator = new WutzTranslator();
	window.locale = WutzTranslator;
})(window, document);
