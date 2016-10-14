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
	var YTPlayImpl = {
	    _version : 0.1,
	    _config : {
                ready2Play:false
	    },
            loadNewVideo : function(params,videoLoaded,videoFinished){
                var waitInterval;
                var mySelf = this;
                var videoId = params.videoId !== undefined?params.videoId:"";
                var objectId = params.objectId !== undefined?params.objectId:"";
                if(videoId === "" || objectId === ""){
                    callback({"err":"Missed Parameter"});
                    return;
                }

                if(YT.Player){
                 var newPlayer = new YT.Player(objectId, {
                                        videoId: videoId,
                                        enablejsapi: 1,
                                        events: {
                                          'onReady': function(event){
                                              videoLoaded(event.target);
                                              //event.target.playVideo();
                                          },
                                          'onStateChange': function(event){
                                              //console.log("Video Info: "+event.target.get_video_info());
                                              
                                              if(event.target.getPlayerState() === 3)
                                                  mySelf._config.ready2Play = true;
                                              if(mySelf._config.ready2Play && event.target.getPlayerState() === -1){
                                                  console.log("Video Failed Loading Prob Copyrigth");
                                                  console.log("Tema terminado forzado");
                                                  mySelf._config.ready2Play = false;
                                                  videoFinished();
                                              }
                                              
                                              if(event.target.getPlayerState() === 0){
                                                     console.log("Tema terminado");
                                                     mySelf._config.ready2Play = false;
                                                     videoFinished();
                                              }
                                          }
                                        }
                                      });
                 }
                 else{
                    waitInterval = setInterval(function(){
                        if(YT.Player){
                          clearInterval(waitInterval);
                          mySelf.loadNewVideo(params,videoLoaded,videoFinished);
                        }      
                    },500);
                 }
            }
	};
	
	var YTPlay = function(){};
	YTPlay.prototype = YTPlayImpl;
	YTPlay = new YTPlay();
	window.YTPlay = YTPlay;
})(window, document);