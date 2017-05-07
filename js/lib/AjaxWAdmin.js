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
	var WutzAdminConnImpl = {
	    _version : 0.1,
	    _config : {
		   wutzAdminHost : 'http://wutz.co.uk'
		  // wutzAdminHost : 'http://localhost:8001/WutzAdmin'
	    },
            callService : function(service,params,method,authToken,callback){
								if(typeof authToken === "function"){
								  	callback = authToken;
										authToken = "";
								}
                var mySelf = this;
                params = JSON.stringify(params);
                $.ajax({
                        type: method,
                        dataType: 'json',
                        url: mySelf._config.wutzAdminHost+"/"+service,
												headers: { 'Authorization': authToken },
                        data: params,
                        success: function (result) {
                                callback(result);
                        },
                        error: function (xhr, txtStat, errThrown) {
                                var err = {};
                                err.xhr = xhr;
                                err.txtStat = txtStat;
                                err.errThrown = errThrown;
                                callback(err);
                        }
               });
            }
	};

	var AjaxWAdmin = function(){};
	AjaxWAdmin.prototype = WutzAdminConnImpl;
	AjaxWAdmin = new AjaxWAdmin();
	window.AjaxWAdmin = AjaxWAdmin;
})(window, document);
