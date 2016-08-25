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
//process.disconnect();
//var ipc = require('electron').ipcRenderer;
//ipc.sendSync('justClose');

var counter = 0;
var os = require('os');
var tempUpdatePath = os.homedir()+"/.wutz/updates";
var logger = require('D:/WorkP/projects/electron/WutzPlayer/js/lib/log4Wutz');


//console.log("Y aca hay log ono ?");
logger.info("ready to execute ... now please close parent");

        var exec = require('child_process').execFile;
            exec(tempUpdatePath+'/installer.exe', function(err, data) {  
        });
