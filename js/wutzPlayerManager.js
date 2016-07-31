function AppViewModel() {
    
   //Observable Definitions 
    mainMod = this;
    mainMod.playList = ko.observableArray([]); 
    mainMod.filePlaying = ko.observable();
    
    //mainMod.picMap = ko.observable({"others":"./img/fronts/defaultSong.png"});
    
//Start checking audio
var config = null;
var homePath = window.sessionStorage.getItem("homePath");
$(document).ready(function() {
    
    $.getJSON( homePath+"/json/config.json", function(_config) {
        
        var qrUrl = "https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl="+_config.downloadAppURL+Math.random();
        $("#qrAppImg").attr("src",qrUrl);
        config = _config;
        var params = {};
        params.catId = config.catid;
        params.token = config.dayToken;
        params = JSON.stringify(params);
        
        $.ajax({
		type: 'POST',
		dataType: 'json',
                url: config.serverhost+"/delegate/wzDelServ2Serv.php?fnc=rescuePendingList",
		data: params,
		success: function (result) {
			mainMod.loadFullCatalog();
                        mainMod.checkEmptyList();
                        var inter = setInterval(function(){
                          mainMod.loadFullCatalog();
                        }, 10000 );
		},
		error: function (xhr, txtStat, errThrown) {
			console.log(xhr.status+':::'+txtStat+':::'+errThrown);
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
		url: config.serverhost+"/delegate/wzDelServ2Serv.php?fnc=addSongToQueue",
		data: params,
		success: function (result) {
			if(result.added !== "OK")
                        {
                            console.log("Falla al cargar tema random");
                        }
		},
		error: function (xhr, txtStat, errThrown) {
			console.log(xhr.status+':::'+txtStat+':::'+errThrown);
		}
      });
};

this.loadAndPlaySong = function(song){
   
    try{
     $("#"+song.songid).get(0).play();
    mainMod.songChecker($("#"+song.songid).get(0));
    //mainMod.loadAndPlaySongReturn(song);
    }catch(err){
        console.log(err);
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
            console.log("Song Ended");
            if(mainMod.playList().length > 0)
                mainMod.goNextQueue();
            else{
                mainMod.checkEmptyList();
                mainMod.loadAndPlayRandomSong();
            }
                
        }
    }, 1000 );
};

this.goNextQueue = function(){
    
    //comingfromArrow = comingfromArrow?true:false;
   //if($("#playList").children().size() > 1)
   if(mainMod.playList().length > 1)
   {
      var newRow = $(".playingRow").next();
        $(".playingRow").remove();
        mainMod.removeSongFromPlaylist(mainMod.playList()[0].songid,mainMod.playList()[0].client_guid);
        mainMod.playList.shift();
        newRow.addClass("playingRow");
     //   var songId = mainMod.playList()[0].songid;//$(".playingRow #songId").attr("value");
        mainMod.loadAndPlaySong(mainMod.playList()[0]);
   }
   else
   {
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
		url: config.serverhost+"/delegate/wzDelServ2Serv.php?fnc=unqueueSong",
		data: params,
		success: function (result) {
                       if(result)
                            console.log("LastSongRem");
                       else
                           console.log("NoSongRemoved");
		},
		error: function (xhr, txtStat, errThrown) {
			console.log(xhr.status+':::'+txtStat+':::'+errThrown);
		}
      });
};

this.startQueue = function(){
    
      //var songId = $("#playList tr:first #songId").attr("value");
      //var songId = mainMod.playList()[0].songid;
      $("#playList tr:first").addClass("playingRow");
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
		url: config.serverhost+"/delegate/wzDelServ2Serv.php?fnc=getFullCatalog",
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
         var audioHtml = "<audio class=\"audio\" id=\""+tempSong.songid+"\" controls preload=\"none\"> ";
             audioHtml += "<source src=\""+fileName+"\" type=\"audio/mpeg\">";
             audioHtml += "</audio>";
         tempSong.htmlAudioObject = audioHtml;
         mainMod.playList.push(tempSong);
        mp3t.loadFrontAlbumPic(tempSong, function(song){
            //tempSong.pic =  imgPath;
            $("#cont_"+song.songid+" img").attr("src",song.pic);
        });
        
     });
     if(areNewSongs){
                $("[data-carousel-3d]").html($("#cleanCarousel").html());
                 var tmp = $("#carouselImp");
                $("#carouselImp").remove();
                $("body").append(tmp);
                $("[data-prev-button]").hide();
                $(".sliderCol span").textSlider();
    }
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

};

// Activates knockout.js
var viewModel = new AppViewModel();
ko.applyBindings(viewModel);