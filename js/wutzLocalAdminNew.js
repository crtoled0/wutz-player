function AppViewModel() {

  var mainMod = this;
	var logger = require('./js/lib/log4Wutz');
	var bAdm   = require('./js/lib/barAdmin');
	var catAdm = require("./js/lib/catalogTools");
  var genTool = require("./js/lib/genericTools");

	var formBarTemp = {
				  "id": "",
				  "representante": "",
				  "telefono": "",
				  "email": "",
				  "idcatalog": "",
				  "dayToken":"",
				  "catalog_name": "",
				  "available_yn": "",
				  "lat": "",
				  "lon": "",
				  "desc": "",
				  "nombreBar": "",
				  "songsAllowed": "",
          "musicPath":""
				};

  var sessionLoaded = {barid:"",
                       accTkn:""};
  var sessionToken;
  var loadedCatalogStr = {};
  var selArtIdx;
  var albSelIdx;

	var checkIfIsLogued = function(callback){
     if(!window.localStorage.getItem("wutzLoadedBar") || !window.localStorage.getItem("wutzSess"))
		      callback(false);
     else{
        var barLoaded = JSON.parse(window.localStorage.getItem("wutzLoadedBar"));
        var sessLoaded = JSON.parse(window.localStorage.getItem("wutzSess"));
        sessionLoaded = JSON.parse(JSON.stringify(sessLoaded));
        mainMod.loadedBar(barLoaded);
        setSessionToken();
        callback(true);
     }
	};

  var autoLoginTries = 0;
  var setSessionToken = function(){
     if(!sessionToken){
       relogin(function(sessTkn){
         if(!sessTkn){
           if(autoLoginTries === 0){
               autoLoginTries++;
               setSessionToken();
           }
           else
              genMessageBox("Login Fallido","Necesita loguearse nuevamente");
         }
         else
           sessionToken = sessTkn;
       });
     }
  };

  var relogin = function(callback){
    var sessLoaded = JSON.parse(window.localStorage.getItem("wutzSess"));
    bAdm.login(sessLoaded,function(_res){
        if(_res.logged){
            window.sessionStorage.setItem("wutzSessToken",_res.token);
            sessionToken = _res.token;
            callback(_res.token);
        }
        else
          callback(_res.token);
    });
  };

  var loadBar2Page = function(){
      //var loadBar = mainMod.loadedBar();
      //Fill Form Section
      var excepId = ["id","idcatalog","available_yn","lat","lon"];
      for(var key in mainMod.loadedBar()){
          if(excepId.indexOf(key) === -1){
             $("#"+key).val(mainMod.loadedBar()[key]);
          }
      }
      //-------------------
      // Curr Map Options
      $("#searchLoc").remove();
      $("#mapholder").remove();
      $("#locationMapContainer").append($("<input type=\"text\" class=\"controls\" id=\"searchLoc\" name=\"searchLoc\" placeholder=\"Buscar Direccion\" />"));
      $("#locationMapContainer").append($("<div id=\"mapholder\"></div>"));
      if(!mainMod.loadedBar().lat || mainMod.loadedBar().lat ==="" || !mainMod.loadedBar().lon || mainMod.loadedBar().lon ==="")
          getLocationsMap();
      else{
          showPosition(mainMod.loadedBar().lat, mainMod.loadedBar().lon);
      }
      //------------------------------------------
      // Bar Open or Close
        if((mainMod.loadedBar().available_yn).toUpperCase() === "Y")
            $("#available_yn").attr("checked",true);
        else
            $("#available_yn").attr("checked",false);
      //---------------------------------------------------------
      //Check if Catalog loaded localy
      bAdm.isThereCatalogFileLoaded(function(_res){
          if(_res)
            $("#editCatalogBtn").removeClass("disabled");
      });
      //---------------------------------------------
      //Check if Catalog loaded remotely
          if(mainMod.loadedBar().idcatalog && mainMod.loadedBar().idcatalog!=="" && $("#available_yn").attr("checked"))
              $("#goToPlayerBtn").removeClass("disabled");
          else
              $("#goToPlayerBtn").addClass("disabled");
      //---------------------------------------------

  };

	var init = function(){
      checkIfIsLogued(function(logued){
          if(!logued){
              //$("#loginModal").modal("show");
              $('#loginModal').modal({backdrop: 'static', keyboard: false});
          }
          else{
            console.log("INIT Started");
            loadBar2Page();
            $('#available_yn').bootstrapToggle({
                on: 'Abierto',
                off: 'Cerrado',
                onstyle: 'success',
                offstyle:'danger',
                size: "mini"
            });
          }
          //$('#loadingPageModal').modal("hide");
          $("#loadingDiv").hide();
      });

    };

    $(document).ready(function(){
    	init();
    });

    var logOut = function(){
    	 window.localStorage.removeItem("wutzLoadedBar");
       window.localStorage.removeItem("wutzSess");
       init();
    };
    var loadCatalog = function(){
      $('#loadCatalogModal').modal({backdrop: 'static', keyboard: false});
    	//$("#loadCatalogModal").modal("show");
    };
    var loadLocation = function(){
      $('#locationgModal').modal({backdrop: 'static', keyboard: false});
     // $("#locationgModal").modal("show");
    };

    var editCatalogM = function(){
        catAdm.getCurrentCatalogStructure(function(catStr){
            console.log(catStr);
            var tmpBrowseCat = mainMod.browseCat();
            tmpBrowseCat.artists = [];
            tmpBrowseCat.albums = [];
            tmpBrowseCat.songs = [];
            mainMod.browseCat(tmpBrowseCat);
            loadedCatalogStr = catStr;
            loadBrowseArtist();
            $('#editCatalogMod').modal({backdrop: 'static', keyboard: false});
        });
    };

    var form2LoadedBar = function(callback){
        console.log("form2LoadedBar");
        var excepId = ["id","idcatalog","available_yn","lat","lon"];
        var loadedB = mainMod.loadedBar();
        for(var key in loadedB){
            if(excepId.indexOf(key) === -1){
               loadedB[key] = $("#"+key).val();
            }
        }
        mainMod.loadedBar(loadedB);
        callback();
    };

    var commitBar = function(callback){
      console.log("commitBar");
    //  console.log(sessionToken);
      form2LoadedBar(function(){
          var allOK = true;
          bAdm.updateConfig(mainMod.loadedBar(), function(savedConfigDone){
            console.log("back from savedConfigDone");
            if(savedConfigDone){
               bAdm.commitBarChanges(function(_res){
                   if(_res.OK){
                      logger.info("Bar Commited Success");
                      window.localStorage.setItem("wutzLoadedBar",JSON.stringify(mainMod.loadedBar()));
                      callback();
                   }
                   else
                       allOK = false;
                });
            }
            else{
                allOK = false;
            }
            if(!allOK)
              genMessageBox("Error","Los cambios nos fueron guardados por un error interno, intentelo de nuevo más tarde");
          });
      });
    };

    var go2Player = function(){
        if(!$("#goToPlayerBtn").hasClass("disabled")){
          commitBar(function(){
             document.location.href = "./player.html";
          });
        }
    };

    var switchOpenCloseBar = function(){
          console.log("switchOpenCloseBar");
          var loadedB = mainMod.loadedBar();
          loadedB.available_yn = $("#available_yn")[0].checked?"Y":"N";
          mainMod.loadedBar(loadedB);
          commitBar(function(){
             //document.location.href = "./player.html";
             console.log("Saved OpenClosedBar");
             loadBar2Page();
          });
    };

    var login = function(){
        var authAcc = {"barid":$("#idOrMail").val(),
                       "pass":$("#passWrd").val()};

        bAdm.login(authAcc,function(_res){
            if(_res.logged){
                sessionLoaded.barid=authAcc.barid,
                sessionLoaded.accTkn= _res.accTkn;
                window.localStorage.setItem("wutzSess",JSON.stringify(sessionLoaded)); // This line might change to optional
                mainMod.loadedBar(_res.barDet);
                window.localStorage.setItem("wutzLoadedBar",JSON.stringify(mainMod.loadedBar()));
                window.sessionStorage.setItem("wutzSessToken",_res.token);
                init();
                $("#loginModal").modal("hide");

            }
            else{
              genMessageBox("Login Fallido","Usuario o contraseña incorrectos </br> Si no está registrado registrese en www.wutznet.com");
            }
        });

    };

    var genMessageBox = function(_title, _msg){
          mainMod.messageBox({title:_title,msg:_msg});
          $("#genericDialogBoxMod").appendTo("body").modal("show");
    };


    var getLocationsMap = function() {

          console.log("Getting Location Map");
        $.get('https://maps.googleapis.com/maps/api/browserlocation/json?browser=chromium&sensor=true', function(data) {
              showPosition(data.location.lat, data.location.lng);
              console.log(position);
          });
    };

    var openSelectMusicFolder = function(){
      var remote = require('remote');
      var dialog = remote.require('electron').dialog;
      var path = dialog.showOpenDialog({
            properties: ['openDirectory']
      });
      $("#musicPath").val(path[0]);
      var tmpLoadBar = mainMod.loadedBar();
      tmpLoadBar.musicPath = path[0];
      mainMod.loadedBar(tmpLoadBar);
      mainMod.loadingFilesProgress({completed:"0",songTitle:""});
      //$("#loadCatalogModal .progress").removeClass("progress-bar-success").addClass("progress-bar-warning");
    };

//------ Edit Catalog Section ---------
    var loadNewCatalogFromFS = function(){
            bAdm.updateConfig(mainMod.loadedBar(), function(savedConfigDone){
                if(savedConfigDone){
                  mainMod.loadingFilesProgress({completed:"0",songTitle:"Reading folder, this might take a while ..."});
                  catAdm.getCatalogFromFileSystem(function(onGoingloadMsg){
                      try{
                          if(!onGoingloadMsg.done){
                              mainMod.loadingFilesProgress({completed:onGoingloadMsg.perc+"",songTitle:onGoingloadMsg.song});
                          }
                          else{
                              console.log("Local Catalog Loaded");
                              mainMod.loadingFilesProgress({completed:"100",songTitle:""});
                              mainMod.newFSCatLoaded(true);
                          }
                      }catch(err){
                          //logger.info(err);
                      }
                  },function(){ //Finish Creating Local Catalog
                      console.log("Loading Files Finished");
                      mainMod.newFSCatLoaded(true);
                  });
                }

            });
    };

    var loadBrowseArtist = function(callback){
      var tmpBrowseCat = mainMod.browseCat();
      tmpBrowseCat.artists = [];
      tmpBrowseCat.selectedArtist = {name:""};
      tmpBrowseCat.selectedAlbum = {name:""};
      tmpBrowseCat.selectedSong = {index:-1,song:null};
      for(artName in loadedCatalogStr){
          var artAlbums = loadedCatalogStr[artName];
          var brsNode = {name:artName,albums:artAlbums,styleClass:""};
          tmpBrowseCat.artists = window.arrTools.insertIntoSortedArray(tmpBrowseCat.artists,brsNode,"name");
      }
      mainMod.browseCat(tmpBrowseCat);
      if(callback)
          callback();
    };

    var loadBrowseAlbums = function(art, idx,callback){
      selArtIdx = idx;
      var tmpBrowseCat = mainMod.browseCat();
      tmpBrowseCat.albums = [];
      tmpBrowseCat.songs = [];
      tmpBrowseCat.selectedArtist = art;
      tmpBrowseCat.selectedAlbum = {name:""};
      tmpBrowseCat.selectedSong = {index:-1,song:null};

      for(albumName in art.albums){
          var albSongs = art.albums[albumName];
          var brsNode = {name:albumName,songs:albSongs};
          tmpBrowseCat.albums.push(brsNode);
      }
      if(tmpBrowseCat.albums.length === 1){
          mainMod.loadBrowseSongs(tmpBrowseCat.albums[0],0);
      }
      mainMod.browseCat(tmpBrowseCat);
      if(callback)
          callback();
    };

    var loadBrowseSongs = function(alb, idx,callback){
      //mainMod.browseCat = ko.observable(artists:[],albums:[],songs[]);
      albSelIdx = idx;
      var tmpBrowseCat = mainMod.browseCat();
      tmpBrowseCat.songs = [];
      tmpBrowseCat.selectedSong = {index:-1,song:null};
      tmpBrowseCat.selectedAlbum = alb;
      tmpBrowseCat.songs =  alb.songs;
      mainMod.browseCat(tmpBrowseCat);
      if(callback)
          callback();
    };

    var loadSongDetails = function(sng, songIdx, fromModal){
        var tmpBrowseCat = mainMod.browseCat();
       // var openModal = (fromModal);
        tmpBrowseCat.selectedSong = {index:songIdx,song:sng};
       // tmpBrowseCat.selectedSongArtist = {name:tmpBrowseCat.selectedArtist.name};
        mainMod.fillAlbums2Reasign(tmpBrowseCat.selectedArtist);
        tmpBrowseCat.selectedSongAlbum = {name:tmpBrowseCat.selectedAlbum.name};
        try{
          mainMod.browseCat(tmpBrowseCat);
        }
        catch(e){
          console.log(e);
        }
       // tmpBrowseCat.selectedSongAlbum =
        if(!fromModal){
            $("#editCatDetailMod").appendTo("body").modal({backdrop: 'static', keyboard: false});
        }
    };

    var switchSongDetail = function(sng, songIdx){
        var tmpBrowseCat = mainMod.browseCat();
        tmpBrowseCat.selectedSong = {index:songIdx,song:sng};
        $("#editCatDetailMod #track").val(sng.track);
        $("#editCatDetailMod #songName").val(sng.songName);
        mainMod.browseCat(tmpBrowseCat);
    };

    var openEditSelected = function(obj,type,idx){
        console.log(obj + " : " +type+" : "+idx);
        if(type === "artist"){
          $("#artistsLstGrp a.active .displaySection").addClass("hide");
          $("#artistsLstGrp a.active .editSection").removeClass("hide");
        }
        else if(type === "album"){
          $("#albumsLstGrp a.active .displaySection").addClass("hide");
          $("#albumsLstGrp a.active .editSection").removeClass("hide");
        }
    };

    var fillAlbums2Reasign = function(_art){
      var art = (_art)?_art.name:$("#songArtist").val();
      console.log(art);

        var tmpBrowseCat = mainMod.browseCat();
        tmpBrowseCat.selectedSongArtist = {name:art};
        //var art2Sel = art.name;
        tmpBrowseCat.albums2Reasign = [];
        for(albumName in loadedCatalogStr[art]){
          var albSongs = loadedCatalogStr[art][albumName];
          var brsNode = {name:albumName};
          tmpBrowseCat.albums2Reasign.push(brsNode);
        }
        if(!tmpBrowseCat.selectedSongAlbum)
            tmpBrowseCat.selectedSongAlbum = tmpBrowseCat.selectedAlbum;
        mainMod.browseCat(tmpBrowseCat);
    };

    var pickReasignAlbum = function(){
        var tmpBrowseCat = mainMod.browseCat();
        tmpBrowseCat.selectedSongAlbum = {name:alb.name};
        mainMod.browseCat(tmpBrowseCat);
    };

    var loadSelectedItems = function(callback){
        var tmpBrowseCat = mainMod.browseCat();
        if(selArtIdx){
            mainMod.loadBrowseAlbums(tmpBrowseCat.artists[selArtIdx], selArtIdx, function(){
                if(albSelIdx){
                  mainMod.loadBrowseSongs(tmpBrowseCat.albums[albSelIdx], albSelIdx);
                }
            });
        }
    };

    var saveArtistSelected = function(obj, idx){
        console.log(obj);
        var tmpBrowseCat = mainMod.browseCat();
        var curArtName = obj.name;
        var newArtName = $("#artistsLstGrp a.active .editSection .modifiedInput").val();
        for(var albName in loadedCatalogStr[curArtName]){
           for(var i in loadedCatalogStr[curArtName][albName]){
                loadedCatalogStr[curArtName][albName][i].songArtist = newArtName;
           }
        }
        saveAndRefreshCatalog(function(){
            var tmpBrowseCat = mainMod.browseCat();
            loadBrowseAlbums(tmpBrowseCat.artists[idx],idx);
        });
        //$("#artistsLstGrp a.active .editSection").addClass("hide");
        //$("#artistsLstGrp a.active .displaySection").removeClass("hide");
    };

    var saveAlbumSelected = function(obj,idx){
        console.log(obj);
        var tmpBrowseCat = mainMod.browseCat();
        var selArtist = tmpBrowseCat.selectedArtist;
        var curAlbName = obj.name;
        var newAlbName = $("#albumsLstGrp a.active .editSection .modifiedInput").val();
        for(var i in loadedCatalogStr[selArtist.name][curAlbName]){
                loadedCatalogStr[selArtist.name][curAlbName][i].songAlbum = newAlbName;
        }
        tmpBrowseCat.albums[idx].name = newAlbName;
        tmpBrowseCat.selectedAlbum.name = newAlbName;
        var songListTmp = JSON.stringify(selArtist.albums[curAlbName]);
        delete selArtist.albums[curAlbName];
        selArtist.albums[newAlbName] = JSON.parse(songListTmp);

        mainMod.browseCat(tmpBrowseCat);
        mainMod.saveAndRefreshCatalog(function(){
            mainMod.loadBrowseAlbums(selArtist,selArtIdx,function(){
                var tmpBrowseCatD2 = mainMod.browseCat();
                mainMod.loadBrowseSongs(tmpBrowseCatD2.albums[idx],idx);
            });
        });
    };

    var saveSongSelected = function(saveAndExit){
        var trackChanged = false;
        var tmpBrowseCat = mainMod.browseCat();
        var sTrack = $("#editCatDetailMod #track").val();
        var sName = $("#editCatDetailMod #songName").val();
        var songArtist = $("#editCatDetailMod #songArtist").val();
        var songAlbum2Reas = $("#editCatDetailMod #songAlbum2Reas").val();

        if(tmpBrowseCat.selectedSong.song.track !== sTrack){
          tmpBrowseCat.selectedSong.song.track = sTrack;
          trackChanged = true;
        }
        tmpBrowseCat.selectedSong.song.songName = sName;
        if(tmpBrowseCat.selectedSong.song.songArtist !== songArtist || tmpBrowseCat.selectedSong.song.songAlbum !== songAlbum2Reas){
          tmpBrowseCat.selectedSong.song.songArtist = songArtist;
          tmpBrowseCat.selectedSong.song.songAlbum = songAlbum2Reas;
        //  tmpBrowseCat.songs.splice(tmpBrowseCat.selectedSong.index,1);
          genMessageBox("Cambio de posición", "Los cambios de posición de un tema se verá reflejado cuando actualize el catálogo");
        }
        tmpBrowseCat.songs[tmpBrowseCat.selectedSong.index] = JSON.parse(JSON.stringify(tmpBrowseCat.selectedSong.song));
        loadedCatalogStr[tmpBrowseCat.selectedArtist.name][tmpBrowseCat.selectedAlbum.name][tmpBrowseCat.selectedSong.index] = JSON.parse(JSON.stringify(tmpBrowseCat.selectedSong.song));
        mainMod.browseCat(tmpBrowseCat);
        if(tmpBrowseCat.selectedSong.todelete)
            loadedCatalogStr[tmpBrowseCat.selectedArtist.name][tmpBrowseCat.selectedAlbum.name][tmpBrowseCat.selectedSong.index]["todelete"]=true;
        if(saveAndExit){
            for(var sn in loadedCatalogStr[tmpBrowseCat.selectedArtist.name][tmpBrowseCat.selectedAlbum.name]){
                if(loadedCatalogStr[tmpBrowseCat.selectedArtist.name][tmpBrowseCat.selectedAlbum.name][sn].todelete){
                    delete loadedCatalogStr[tmpBrowseCat.selectedArtist.name][tmpBrowseCat.selectedAlbum.name][sn];
                }
            }
            saveAndRefreshCatalog(function(){
                loadSelectedItems();
                $("#editCatDetailMod").modal("hide");
            });
        }
    };

    var mark2DelSelectedSong = function(){
          var tmpBrowseCat = mainMod.browseCat();
          var selArt = tmpBrowseCat.selectedArtist;
          var selAlb = tmpBrowseCat.selectedAlbum;
          var selSong = tmpBrowseCat.selectedSong;
        //  delete loadedCatalogStr[selArt.name][selAlb.name][selSong.index];
          loadedCatalogStr[selArt.name][selAlb.name][selSong.index]["todelete"]=true;
          tmpBrowseCat.songs[tmpBrowseCat.selectedSong.index]["todelete"]=true;
          tmpBrowseCat.selectedSong["todelete"]=true;
          console.log(tmpBrowseCat.songs[tmpBrowseCat.selectedSong.index]);
          $("#editCatDetailMod .editableSongList a:nth-child("+(tmpBrowseCat.selectedSong.index+1)+")").removeClass("list-group-item-success").addClass("list-group-item-danger");

          //$("#editCatDetailMod").modal("hide");
          //saveAndRefreshCatalog();
          mainMod.browseCat(tmpBrowseCat);
    };

    var deleteSelectedArtist = function(){
      var tmpBrowseCat = mainMod.browseCat();
      var curArtName = tmpBrowseCat.selectedArtist.name;
      for(var albName in loadedCatalogStr[curArtName]){
         for(var i in loadedCatalogStr[curArtName][albName]){
              delete loadedCatalogStr[curArtName][albName][i];
         }
      }
      saveAndRefreshCatalog(true);
    };

    var deleteSelectedAlbum = function(){
      var tmpBrowseCat = mainMod.browseCat();
      var selArtist = tmpBrowseCat.selectedArtist;
      var curAlbName = tmpBrowseCat.selectedAlbum.name;
      for(var i in loadedCatalogStr[selArtist.name][curAlbName]){
              delete loadedCatalogStr[selArtist.name][curAlbName][i];
      }
    //  delete selArtist.albums[curAlbName];

  //    mainMod.browseCat(tmpBrowseCat);
      mainMod.saveAndRefreshCatalog(true, function(){
         console.log(mainMod.browseCat().artists[selArtIdx]+" :: "+selArtIdx);
          loadBrowseAlbums(mainMod.browseCat().artists[selArtIdx],selArtIdx);
      });
    };


    var saveAndRefreshCatalog = function(cleanAll, callback){
      var catSongs = [];
      if(typeof cleanAll !== "function" && cleanAll){
        mainMod.browseCat({artists:[],
                           albums:[],
                           songs:[],
                           albums2Reasign:[],
                           selectedArtist:{name:""},
                           selectedAlbum:{name:""},
                           selectedSong:{index:-1,song:null},
                           selectedSongArtist:{name:""},
                           selectedSongAlbum:{name:""}
                          });
      }
      else if(typeof cleanAll === "function") {
         callback = cleanAll;
      }
      var tmpBrowseCat = mainMod.browseCat();
      var selArt = tmpBrowseCat.selectedArtist;
      var selAlb = tmpBrowseCat.selectedAlbum;
      var selSong = tmpBrowseCat.selectedSong;
      for(var artName in loadedCatalogStr){
          var artAlbums = loadedCatalogStr[artName];
          for(var alb in artAlbums){
              //catSongs.concat(artAlbums[alb]);
              for(var sngidx in artAlbums[alb]){
                   catSongs.push(artAlbums[alb][sngidx]);
              }
          }
      }
      catAdm.saveFromStr2Cat(catSongs, function(_res){
         if(_res.done){
              catAdm.getCurrentCatalogStructure(function(catStr){
                  console.log(catStr);
                  tmpBrowseCat.artists = [];
                  tmpBrowseCat.albums = [];
                  tmpBrowseCat.songs = [];
                  loadedCatalogStr = catStr;
                  loadBrowseArtist(function(){
                      tmpBrowseCat.selectedArtist = selArt;
                      tmpBrowseCat.selectedAlbum = selAlb;
                      tmpBrowseCat.selectedSong = selSong;
                      mainMod.browseCat(tmpBrowseCat);
                      if(callback)
                        callback();
                  });
              });
          }
      });
    };

    var uploadCatalog = function(){
          saveAndRefreshCatalog(function(){
                  var totSongs = 0;
                  mainMod.genericProgressBar({title:"Subiendo Catálogo",completed:"0"});
                  var getProgBar = mainMod.genericProgressBar();
                  $("#genericProgressBarMod").appendTo("body").modal({backdrop: 'static', keyboard: false});
                  catAdm.sendCat2WutzCloud(function(upStatus){
                        if(!upStatus.finished){
                            if(upStatus.totalSongs){
                              totSongs = upStatus.totalSongs;
                              console.log(totSongs);
                            }
                            else if(upStatus.catalogId){
                              var loadedB = mainMod.loadedBar();
                              loadedB.idcatalog = upStatus.catalogId;
                              mainMod.loadedBar(loadedB);
                              console.log("Loaded new catalog");
                            }
                            else if(upStatus.songsLeft){
                              var hPerc = totSongs - upStatus.songsLeft;
                              hPerc = Math.round((hPerc/totSongs)*100);
                              getProgBar.completed=hPerc;
                              mainMod.genericProgressBar(getProgBar);
                               console.log("Songs Left ["+upStatus.songsLeft+"] of ["+totSongs+"]");
                            }
                        }
                        else{
                          getProgBar.completed="100";
                          mainMod.genericProgressBar(getProgBar);
                          $("#editCatalogMod").modal("hide");
                           console.log("Process Finished");
                        }
                  });
          });
    };

// end Edit Catalog Section
    var showPosition = function(lat, lon) {
              $("#mapholder").html("");
              console.log(lat + " : "+lon);
              var waiting4GM = window.setInterval(function(){
                  if(google){
                      window.clearInterval(waiting4GM);
                      var latlon = new google.maps.LatLng(lat, lon);
                      var myOptions = {
                            zoom: 16,
                            center: latlon,
                            mapTypeId: google.maps.MapTypeId.ROADMAP
                        };

                      var map = new google.maps.Map(document.getElementById("mapholder"), myOptions);
                      var marker = new google.maps.Marker({
                            position: latlon,
                            draggable: true,
                            map: map,
                            title: "You are here!",
                            label: "B"
                        });
                      // Create the search box and link it to the UI element.
                    var input = document.getElementById('searchLoc');
                    var searchBox = new google.maps.places.SearchBox(input);
                    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

                    google.maps.event.addDomListener(input, 'keydown', function(e) {
                        if (e.keyCode == 13) {
                            e.preventDefault();
                        }
                    });

                   // google.maps.event.trigger(map, 'resize');


                    searchBox.setBounds(map.getBounds());
                    // Bias the SearchBox results towards current map's viewport.
                    map.addListener('bounds_changed', function() {
                      searchBox.setBounds(map.getBounds());
                    });

                    $('#locationgModal').on('shown.bs.modal',
                    function(){
                            google.maps.event.trigger(map,'resize',{});
                            map.setCenter(latlon);
                    });


                    searchBox.addListener('places_changed', function() {
                        var places = searchBox.getPlaces();
                        if (places.length == 0) {
                          return;
                        }
                        console.log(places);
                        places.forEach(function(place) {
                            if (!place.geometry) {
                              console.log("Returned place contains no geometry");
                              return;
                            }
                            var tmpLoadBar = mainMod.loadedBar();
                            tmpLoadBar.lat = place.geometry.location.lat();
                            tmpLoadBar.lon = place.geometry.location.lng();
                            mainMod.loadedBar(tmpLoadBar);
                           // console.log(place.geometry.location.lat() +" : "+place.geometry.location.lng());
                           marker.setPosition(place.geometry.location);
                           map.setCenter(place.geometry.location);
                        });
                    });

                    google.maps.event.addListener(marker, "dragend", function(event) {
                            var tmpLoadBar = mainMod.loadedBar();
                            tmpLoadBar.lat = event.latLng.lat();
                            tmpLoadBar.lon = event.latLng.lng();
                            mainMod.loadedBar(tmpLoadBar);
                            console.log("Position changed: "+mainMod.loadedBar().lat + " : "+mainMod.loadedBar().lon);
                     });
                  }
              });
    };


 //Observable Definitions

   // mainMod.playList = ko.observableArray([]);
    mainMod.loadedBar = ko.observable(JSON.parse(JSON.stringify(formBarTemp)));
    mainMod.messageBox = ko.observable({title:"",msg:""});
    mainMod.loadingFilesProgress = ko.observable({completed:"0",songTitle:""});
    mainMod.progressBarStyle = ko.computed(function() {
                                      return "width:"+mainMod.loadingFilesProgress().completed+"%;";
                                }, this);
    mainMod.genericProgressBar = ko.observable({title:"",completed:"0"});
    mainMod.genericProgressBarStyle = ko.computed(function() {
                                      return "width:"+mainMod.genericProgressBar().completed+"%;";
                                    }, this);

    mainMod.newFSCatLoaded = ko.observable(false);
    mainMod.browseCat = ko.observable({artists:[],
                                       albums:[],
                                       songs:[],
                                       albums2Reasign:[],
                                       selectedArtist:{name:""},
                                       selectedAlbum:{name:""},
                                       selectedSong:{index:-1,song:null},
                                       selectedSongArtist:{name:""},
                                       selectedSongAlbum:{name:""}
                                    });
 //Observable Functions Definitions

 	mainMod.logOut= logOut;
 	mainMod.loadCatalog= loadCatalog;
 	mainMod.loadLocation= loadLocation;
  mainMod.login = login;
  mainMod.openSelectMusicFolder = openSelectMusicFolder;
  mainMod.loadNewCatalogFromFS = loadNewCatalogFromFS;
  mainMod.editCatalogM = editCatalogM;
  mainMod.go2Player = go2Player;
  mainMod.switchOpenCloseBar = switchOpenCloseBar;
  mainMod.showPosition = showPosition;
  mainMod.loadBrowseAlbums = loadBrowseAlbums;
  mainMod.loadBrowseSongs = loadBrowseSongs;
  mainMod.loadSongDetails = loadSongDetails;
  mainMod.switchSongDetail = switchSongDetail;
  mainMod.openEditSelected = openEditSelected;
  mainMod.fillAlbums2Reasign = fillAlbums2Reasign;
  mainMod.pickReasignAlbum = pickReasignAlbum;
  mainMod.saveArtistSelected = saveArtistSelected;
  mainMod.saveAlbumSelected = saveAlbumSelected;
  mainMod.saveSongSelected = saveSongSelected;
  mainMod.saveAndRefreshCatalog = saveAndRefreshCatalog;
  mainMod.uploadCatalog = uploadCatalog;
  mainMod.mark2DelSelectedSong = mark2DelSelectedSong;
  mainMod.deleteSelectedAlbum = deleteSelectedAlbum;
  mainMod.deleteSelectedArtist = deleteSelectedArtist;
};

// Activates knockout.js
var viewModel = new AppViewModel();
ko.applyBindings(viewModel);
