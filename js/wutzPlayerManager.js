function AppViewModel() {

   //Observable Definitions
    mainMod = this;
    mainMod.playList = ko.observableArray([]);
    mainMod.filePlaying = ko.observable();
    mainMod.fullScr = ko.observable({"imgSrc":"img/plus-white.png","text":"Full Screen"});
    mainMod.barInfo = ko.observable({catid: "",dayToken: ""});


    //mainMod.picMap = ko.observable({"others":"./img/fronts/defaultSong.png"});

//Start checking audio
var config = null;
var homePath = window.sessionStorage.getItem("homePath");
var logger = require('./js/lib/log4Wutz');
var ipc = require('electron').ipcRenderer;
var sesTkn = window.sessionStorage.getItem("wutzSessToken");

var brokenSongs = [];
var ytMap = {};

$(document).ready(function() {

    $.getJSON( homePath+"/json/config.json", function(_config) {

       // var qrUrl = "https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl="+_config.downloadAppURL+"&v="+Math.random();
       // $("#qrAppImg").attr("src",qrUrl);
        config = _config;
        mainMod.barInfo({barId: config.bar_id,dayToken: config.dayToken});
        var params = {};
        params.catId = config.catid;
        params.token = config.dayToken;
        params = JSON.stringify(params);

        $.ajax({
            		type: 'POST',
            		dataType: 'json',
                url: config.serverhost+"/rescuePendingList",
                headers: { 'Authorization': sesTkn },
            		data: params,
            		success: function (result) {
            			     mainMod.loadFullCatalog();
                      mainMod.checkEmptyList();
                      var inter = setInterval(function(){
                                mainMod.loadFullCatalog();
                      }, 10000 );
            		},
            		error: function (xhr, txtStat, errThrown) {
            			logger.info(xhr.status+':::'+txtStat+':::'+errThrown);
            		}
       });
    });
});


// -------------   Functions from previous ver
this.loadAndPlayRandomSong = function(){

      var params = {};
        params.catId = config.catid;
        params.token = config.dayToken;
        params.songId = "-1";
        params.guid = config.guid;
        params = JSON.stringify(params);

       $.ajax({
            		type: 'POST',
            		dataType: 'json',
            		url: config.serverhost+"/addSongToQueue",
                headers: { 'Authorization': sesTkn },
            		data: params,
            		success: function (result) {
            			if(result.added !== "OK"){
                          logger.info("Falla al cargar tema random");
                  }
            		},
            		error: function (xhr, txtStat, errThrown) {
            			logger.info(xhr.status+':::'+txtStat+':::'+errThrown);
            		}
      });
};

this.loadAndPlaySong = function(song){

    try{

      if($.inArray(song.songid,brokenSongs) === -1){
        if(song.media_type === "video" && song.extension !== "tube")
            $("#"+song.songid).addClass("fullscreenvideo");
        if(song.extension !== "tube"){
                $("#"+song.songid).get(0).addEventListener("error", function (err) {
                    //alert("Algo Falló");
                    logger.info("ERROR LOADING SONG PATH: ["+song.songid+"]");
                    mainMod.goNextQueue();
                }, true);
                $("#"+song.songid).get(0).play();
                mainMod.songChecker($("#"+song.songid).get(0));
        }
        else{
            this.playYTSong(song.songid);
        }
      }
      else{
          logger.info("ERROR LOADING SONG : ["+song.songid+"]");
          mainMod.goNextQueue();
      }
    }catch(err){
        logger.info("ERROR LOADING SONG : ["+err+"]");
        mainMod.goNextQueue();
    }
};


/**
this.loadAndPlaySongReturn = function(result){

    $("#"+result.songid).get(0).play();
    mainMod.songChecker($("#"+result.songid).get(0));
};
**/

this.songChecker = function(audioMedia){

   var inter = setInterval(function()
    {
        if(audioMedia.ended)
        {
            clearInterval ( inter );
            logger.info("Song Ended");
            if(mainMod.playList()[0].media_type === "video"){
               $("#"+mainMod.playList()[0].songid).removeClass("fullscreenvideo");
            }
            if(mainMod.playList().length > 0)
                mainMod.goNextQueue();
            else{
                mainMod.checkEmptyList();
                mainMod.loadAndPlayRandomSong();
            }

        }
    }, 1000 );
};

this.youtubeEndSong = function(){

            logger.info("Youtube Song Ended");
            //$("#"+mainMod.playList()[0].songid).removeClass("fullscreenvideo");
            if(mainMod.playList().length > 0)
                mainMod.goNextQueue();
            else{
                mainMod.checkEmptyList();
                mainMod.loadAndPlayRandomSong();
            }
};

this.goNextQueue = function(){

    //comingfromArrow = comingfromArrow?true:false;
   //if($("#playList").children().size() > 1)
   if(mainMod.playList().length > 1) {
      var newRow = $(".playingRow").next();
        $(".playingRow").remove();
        mainMod.removeSongFromPlaylist(mainMod.playList()[0].songid,mainMod.playList()[0].client_guid);
        mainMod.playList.shift();
        newRow.addClass("playingRow");
     //   var songId = mainMod.playList()[0].songid;//$(".playingRow #songId").attr("value");
        mainMod.loadAndPlaySong(mainMod.playList()[0]);
   }
   else {
      $(".playingRow").remove();
      mainMod.removeSongFromPlaylist(mainMod.playList()[0].songid,mainMod.playList()[0].client_guid);
      mainMod.playList.removeAll();
      mainMod.checkEmptyList();
      mainMod.loadAndPlayRandomSong();
   }
   //if(!comingfromArrow)
    $("[data-carousel-3d] [data-next-button]").click();
};

this.removeSongFromPlaylist= function(songid,clientGuid){
    var params = {};
        params.catId = config.catid;
        params.token = config.dayToken;
        params.songId = songid;
        params.guid = clientGuid;
        params = JSON.stringify(params);
    $.ajax({
          		type: 'POST',
          		dataType: 'json',
          		url: config.serverhost+"/unqueueSong",
              headers: { 'Authorization': sesTkn },
          		data: params,
          		success: function (result) {
                 if(result)
                     logger.info("LastSongRem");
                 else
                     logger.info("NoSongRemoved");
          		},
          		error: function (xhr, txtStat, errThrown) {
          			logger.info(xhr.status+':::'+txtStat+':::'+errThrown);
          		}
      });
};

this.startQueue = function(){

      //var songId = $("#playList tr:first #songId").attr("value");
      //var songId = mainMod.playList()[0].songid;
      $("#playList .row:first").addClass("playingRow");
      mainMod.loadAndPlaySong(mainMod.playList()[0]);
};

this.loadFullCatalog = function(){

    var params = {};
        params.catId = config.catid;
        params.token = config.dayToken;
        params = JSON.stringify(params);

      $.ajax({
          		type: 'POST',
          		dataType: 'json',
          		url: config.serverhost+"/getFullCatalog",
              headers: { 'Authorization': sesTkn },
          		data: params,
          		success: function (result) {
          			mainMod.loadFullCatalogReturn(result);
          		},
          		error: function (xhr, txtStat, errThrown) {
          			console.log(xhr.status+':::'+txtStat+':::'+errThrown);
          		}
      });
};

this.loadFullCatalogReturn = function(jsonRes){

    //var firstOne = true;
    var mp3t = require('./js/lib/mp3Tools');
    //var mainMod = this;

    var areNewSongs = false;
    $.each(jsonRes,function(i, value)
    {
         areNewSongs = true;
         tempSong = value;
       //  tempSong.pic = "";
        // mainMod.picMap()[tempSong.songid] = "./img/fronts/defaultSong.png";
        // var fileName = "./audio/currSong.mp3?rv"+Math.random();
        var filPath = tempSong.file_path;
        var filName = tempSong.file_name;
        var fileName = filPath+"/"+filName;

        var audioHtml = "";
        if(tempSong.media_type === "audio"){
             audioHtml = "<audio class=\"audio\" id=\""+tempSong.songid+"\" controls preload=\"none\"> ";
             audioHtml += "<source src=\""+fileName+"\" type=\"audio/mpeg\">";
             audioHtml += "</audio>";
         }
         else if(tempSong.media_type === "video" && tempSong.extension !== "tube"){
            audioHtml = "<video width=\"204\" height=\"40\" class=\"audio\" id=\""+tempSong.songid+"\" controls preload=\"metadata\"> ";
            audioHtml += "<source src=\""+fileName+"\" type=\"video/webm\">";
            audioHtml += "</video>";
         }
         else if(tempSong.extension === "tube"){
              audioHtml = "<img src=\"./img/youtubeSmall.png\" width=\"40px\" />";
         }
         tempSong.htmlAudioObject = audioHtml;
         mainMod.playList.push(tempSong);
         if(tempSong.extension !== "tube"){
              //  mainMod.playList.push(tempSong);
                mp3t.loadFrontAlbumPic(tempSong, function(song){
                    //tempSong.pic =  imgPath;
                    if(song.err === undefined)
                        $("#cont_"+song.songid+" img").attr("src",song.pic);
                    else{
                        logger.info("Song With Issues : "+song.songid+"["+song.file_name+"]["+song.exc+"]");
                        brokenSongs.push(song.songid);
                      //  mainMod.removeSongFromPlaylist(song.songid,song.client_guid)
                    }
                });
          }
          else{
              console.log("Youtube condition");
              ytMap[tempSong.songid] = filName;
              YTPlay.loadNewVideo({"videoId":filName,"objectId":"cont_"+tempSong.songid},
                    function(_player){
                      //  console.log("Back From Lib "+_player);
                      //  _player.playVideo();
                        //mainMod.findAndAddYTPlayer(songId, player);
                        //tempSong["ytPlayer"] = player;

                    },
                    function(){
                       // mainMod.youtubeEndSong();
                       //console.log("Ya termino tema ?");
                    });
          }
     });
     if(areNewSongs){
                $("[data-carousel-3d]").html($("#cleanCarousel").html());
                 var tmp = $("#carouselImp");
                $("#carouselImp").remove();
                $("body").append(tmp);
                $("[data-prev-button]").hide();
                $("[data-next-button]").hide();
                $(".sliderCol span").textSlider();
    }
};

  this.playYTSong = function(songId){
      mainMod = this;
      var vidCont = $("<div id=\"ytVideoCont\" class=\"fullscreenvideo\"></div>");
      $("body").append(vidCont);

      YTPlay.loadNewVideo({"videoId":ytMap[songId],"objectId":"ytVideoCont"},
             function(_player){
                       _player.playVideo();
                    },
                    function(){
                        console.log("Ya termino tema ?");
                        $("#ytVideoCont").remove();
                        mainMod.youtubeEndSong();
                    });
  };

    this.checkEmptyList = function(){

        var inter = setInterval(function()
        {
            if($("#playList").children().size() > 0)
            {
                clearInterval ( inter );
                mainMod.startQueue();
            }
        }, 3000 );
    };


    this.toogleHeaderMenu = function(data, event){

        console.log("Mouse ["+event.pageX+"]["+event.pageY+"]");
        var menuObj = $("#headerMenu");
        if(menuObj.css("width") === "0px"){
            //menuObj.offset({left:event.pageX,top:event.pageY});
            menuObj.animate({width:"300px"},1000);
            //menuObj.fadeIn("slow");
        }
        else{
            menuObj.animate({width:"0px"},1000);
            //menuObj.fadeOut("slow");
        }
    };

    this.exitPlayer = function(){

        document.location = "./login_reg.html";

    };

    this.forwardSong = function(){
        var mod = this;
        mod.goNextQueue();
        var menuObj = $("#headerMenu");
        menuObj.animate({width:"0px"},1000);
    };

     this.setFullScreen = function(){

        var mod = this;
        var menuObj = $("#headerMenu");
        menuObj.animate({width:"0px"},1000);
        ipc.sendSync('toogFullScreen');

        if(mod.fullScr().text === "Full Screen"){
            mod.fullScr({"imgSrc":"img/minus-white.png","text":"Exit Full Screen"});
        }
        else{
            mod.fullScr({"imgSrc":"img/plus-white.png","text":"Full Screen"});
        }

          $(document).keyup(function(e) {
            if (e.keyCode == 27) { // escape key maps to keycode `27`
                mod.setFullScreen();
            }
           });

     };


    this.refreshCssFiles = function(){

        var linkTemplate = "<link rel=\"stylesheet\" type=\"text/css\" />";
        $("link", "head").each(function(i){
            var tempCssLink = $(this).attr("href");
            var newCss = $(linkTemplate);
            newCss.attr("href",tempCssLink);
            $(this).remove();
            $("body").append(newCss);
        });
    };
};

// Activates knockout.js
var viewModel = new AppViewModel();
ko.applyBindings(viewModel);
