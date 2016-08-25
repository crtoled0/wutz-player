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
var os = require('os');
var fs = require('fs');
var winston = require('winston');
var homePath = os.homedir()+"/.wutz";

if (!fs.existsSync(homePath)){
        fs.mkdirSync(homePath);
        fs.mkdirSync(homePath+"/updates");
        fs.mkdirSync(homePath+"/json");
        fs.mkdirSync(homePath+"/logs");
        fs.mkdirSync(homePath+"/img");
        fs.mkdirSync(homePath+"/img"+"/fronts");
}

var logger = new (winston.Logger)({
  transports: [
    //new (winston.transports.Console)({ json: false, timestamp: true }),
    new winston.transports.File({ filename: homePath+"/logs" + '/debug.log', json: false })
  ],
  exceptionHandlers: [
    //new (winston.transports.Console)({ json: false, timestamp: true }),
    new winston.transports.File({ filename: homePath+"/logs" + '/exceptions.log', json: false })
  ],
  exitOnError: false
});
module.exports = logger;
 