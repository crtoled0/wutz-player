(function($) {
    "use strict";

    var catLoaded = false;
    var config = null;
    var bAdm = require('./js/lib/barAdmin');
    var catAdm = require("./js/lib/catalogTools");
    var logger = require('./js/lib/log4Wutz');

	// Options for Message
	//----------------------------------------------
  var options = {
	  'btn-loading': '<i class="fa fa-spinner fa-pulse"></i>',
	  'btn-success': '<i class="fa fa-check"></i>',
	  'btn-error': '<i class="fa fa-remove"></i>',
	  'msg-login-success': 'Good ... Loading Bar',
	  'msg-login-error-pass': 'Password incorrect',
    'msg-login-error-usr': "User doesn't exist",
    'msg-catload-success': 'The catalog was uploaded correctly',
    'msg-catload-error': 'Catalog update failed' ,
    'new-upgrade-avail':'Nueva version disponible, click aca para descargar',
    'new-upgrade-installing':'Abriendo navegador por defecto',
    'new-upgrade-installed':'La nueva descarga debio iniciar en su navegador, una vez descargado inicie el instalador. Click aqui para cerrar aplicacion ',
    'new-upgrade-failed':'Ocurrio un error actualizando la aplicacion, Intentelo mas tarde'
  };	// Login Form
	//----------------------------------------------
	// Validation
  $("#loginDiv form").validate({
  	rules: {
          bar_id: "required",
  	  pass: "required"
    },
  	errorClass: "form-invalid"
  });

	// Form Submission

  $("#loginDiv form").submit(function() {
  	remove_loading($("#loginDiv form"));
        var currForm = $(this);
                    if(currForm.valid()){
                        form_loading(currForm);
                        var params = {};
                        params.barid = currForm.find("#bar_id").val();
                        params.pass = currForm.find("#pass").val();
                        window.sessionStorage.setItem("currBar",params.barid);
                        //logger.info($(this).find("#bar_id").val());
                        console.log("Calling Ajax Login");
                        bAdm.login(params,function(result){
                            console.log("Back from Login");
                            remove_loading($(currForm));
                            console.log(result);
                            if(result.logged){
                                logger.info("Logged In");
                                window.sessionStorage.setItem("logged",true);
                                checkBarStatusStatus();
                                form_success(currForm,'msg-login-success');
                            }
                            else if(result.msg === "usr_no_exist"){
                                form_failed(currForm,'msg-login-error-usr');
                                window.sessionStorage.setItem("logged",false);
                            }
                            else{
                                form_failed(currForm,'msg-login-error-pass');
                                window.sessionStorage.setItem("logged",false);
                            }
                        });
                    }
      return false;
  });




	// Register Form
	//----------------------------------------------
	// Validation
  $("#newBarDiv form").validate({
  	rules: {
            barId: "required",
            pass: {required: true,
                         minlength: 5
            },
            rep_password: {required: true,
                           minlength: 5,
                           equalTo: "#newBarDiv form [name=pass]"
            },
            email: {required: true,
                    email: true
            }
          },
	  errorClass: "form-invalid",
	  errorPlacement: function( label, element ) {
                if( element.attr( "type" ) === "checkbox" || element.attr( "type" ) === "radio" ) {
                    element.parent().append( label ); // this would append the label after all your checkboxes/labels (so the error-label will be the last element in <div class="controls"> )
                }
                else {
                    label.insertAfter( element ); // standard behaviour
                }
          }
  });

  // Form Submission
  $("#newBarDiv form").submit(function() {
  	remove_loading($("#newBarDiv form"));
	form_loading($("#newBarDiv form"));
        var currForm = $("#newBarDiv form");
        var loginForm = $("#loginDiv form");

        var params = {};
        params.bar_id = currForm.find("#barId").val();
        params.pass = currForm.find("#pass").val();
        params.nombreBar = currForm.find("#nombreBar").val();
        params.email = currForm.find("#email").val();

        bAdm.register(params,function(result){

            remove_loading($("#newBarDiv form"));
            if(result.OK){
                form_success(loginForm,'Subscribed succesfully, login now');
                loadSectionPage('login');
            }
            else{
                form_failed(currForm,'Not able to register');
            }
        });
	return false;
  });

	// Forgot Password Form
	//----------------------------------------------
	// Validation
  $("#forgot-password-form").validate({
  	rules: {
      fp_email: "required"
    },
  	errorClass: "form-invalid"
  });

	// Form Submission
  $("#forgot-password-form").submit(function() {
  	remove_loading($(this));

		if(options['useAJAX'] === true)
		{
			// Dummy AJAX request (Replace this with your AJAX code)
		  // If you don't want to use AJAX, remove this
  	  dummy_submit_form($(this));

		  // Cancel the normal submission.
		  // If you don't want to use AJAX, remove this
  	  return false;
		}
  });
 $("#configDiv form").submit(function() {
  	remove_loading($("#configDiv form"));
        form_loading($("#configDiv form"));

        var currForm = $("#configDiv form");
        config.nombreBar = currForm.find("#nombreBar").val();
        config.email = currForm.find("#email").val();
        config.songsAllowed = currForm.find("#songsAllowed").val();
        config.representante = currForm.find("#representante").val();
        config.telefono = currForm.find("#telefono").val();
        config.dayToken = currForm.find("#dayToken").val();
        config.desc = currForm.find("#desc").val();


        bAdm.saveConfigFile(config,function(_config){
             config = _config;
             console.log("Config Saved Locally");

             	if(!catLoaded){
                    //loadSectionPage("config2");
                    remove_loading($("#configDiv form"));
                    form_failed($("#configDiv form"), "Catalog is not loaded<br/>");
                    return false;
                }
                else if(config.latitude === "" || config.longitute===""){
                    //loadSectionPage("config3");
                    remove_loading($("#configDiv form"));
                    form_failed($("#configDiv form"), "Bar Location not specified<br/>");
                    return false;
                }
                remove_loading($("#configDiv form"));

                bAdm.saveConf(config,function(result){
                    if(result.OK){
                        logger.info("Config Changes Applied on server");
                    }
                    else{
                        logger.info("Config Changes Not Saved on server, or no changes");
                    }
                    document.location.href="./player.html";
                });

         });
  	return false;

  });

  $("#config2Div form #pickFolder").click(function(){
      var remote = require('remote');
      var dialog = remote.require('electron').dialog;
      var path = dialog.showOpenDialog({
            properties: ['openDirectory']
      });

      console.log(path[0]);
      $("#musicPath").val(path[0]);
  });


  $("#config2Div form").submit(function() {

       // var form = $(this);
        remove_loading($("#config2Div form"));
        form_loading($("#config2Div form"));
       // logger.info($("#musicPath"));
	var musPath = $("#musicPath").val();
        config.musicPath = musPath;
        bAdm.saveConfigFile(config,function(_config){
            config = _config;
            $("#catLoadingBox").html("Reading folder, this might take a while ...");
            catAdm.getCatalogFromFileSystem(function(loadMsg){
               // logger.info(loadMsg);
                try{
                    var onGoingloadMsg = loadMsg;//JSON.parse(loadMsg);
                    if(!onGoingloadMsg.done){
                        var perc = onGoingloadMsg.perc;
                        var song = onGoingloadMsg.song;
                        $("#catLoadingBox").html("["+perc+"] Loading ... ["+song+"]");
                    }
                    else{
                        $("#catLoadingBox").html("Local Catalog Loaded");
                        remove_loading($("#config2Div form"));
                    }
                }catch(err){
                    //logger.info(err);
                }
            },function(){ //Finish Creating Local Catalog

                $("#catLoadingBox").html("Uploading Catalog to Wutz Cloud");
                catAdm.sendCat2WutzCloud(function(_config){
                    config = _config;
                    $("#catLoadingBox").html("Process Finished");
                    remove_loading($("#config2Div form"));
                    form_success($("#configDiv form"),'Catalog Loaded');
                    checkBarStatusStatus();
                  //  loadSectionPage('config');
                });
            });
        });
  	return false;

  });

  var newLat = "";
  var newLon = "";
  $("#config3Div form button").click(function() {
     // return false;
    console.log("Submitted ?");
    if(newLat !== "" && newLon !== ""){
        remove_loading($("#config3Div form"));
        form_loading($("#config3Div form"));
         config.latitude = newLat;
         config.longitute = newLon;
         remove_loading($("#config3Div form"));
         form_success($("#configDiv form"),'Location Setted OK');
         loadSectionPage('config1');
     }
     else{
         return false;
     }
      return false;
  });
	// Loading
	//----------------------------------------------
  function remove_loading(fform){
  	fform.find('[type=submit]').removeClass('error success');
  	fform.find('.login-form-main-message').removeClass('show error success').html('');
  }

  function form_loading(fform){
    fform.find('[type=submit]').addClass('clicked').html(options['btn-loading']);
  }

  function form_success(fform, msg){

      var msg2disp;
       if(options[msg]===undefined){
           msg2disp = msg;
       }
       else{
           msg2disp = options[msg];
       }

	  fform.find('[type=submit]').addClass('success').html(options['btn-success']);
	  fform.find('.login-form-main-message').addClass('show success').html(msg2disp);
  }

  function form_failed(fform, msg){

      var msg2disp;
       if(options[msg]===undefined){
           msg2disp = msg;
       }
       else{
           msg2disp = options[msg];
       }

  	fform.find('[type=submit]').addClass('error').html(options['btn-error']);
  	fform.find('.login-form-main-message').addClass('show error').html(msg2disp);
  }


  function check4updates(){

      console.log("Checking Updates");
      var updMan = require("./js/lib/updatesAdmin");

      updMan.checkUpdates(function(res){
          logger.info("We are back" + JSON.stringify(res));
          if(!res.updated){
              var update2Install = res.update2Install;
              $("#topMessageContainer span").html(options['new-upgrade-avail']);
              $("#topMessageContainer #vers2Udt").attr("value",update2Install);

              $("#topMessageContainer span").click(function(){

                  $("#topMessageContainer span").html(options['new-upgrade-installing']);
                    updMan.applyUpdates(function(update){

                        if(update.downloading){
                            $("#topMessageContainer span").html(options['new-upgrade-installed']);
                            $("#topMessageContainer span").click(function(){
                                updMan.closeAndOpenInstaller();
                            });
                        }
                        else{
                            $("#topMessageContainer span").html(options['new-upgrade-failed']);
                        }

                    });
              });
              $("#topMessageContainer").animate({"top":"0px","height":"30px"},2000);
          }
      });
  }

	// Dummy Submit Form (Remove this)
	//----------------------------------------------
	// This is just a dummy form submission. You should use your AJAX function or remove this function if you are not using AJAX.
  function dummy_submit_form($form)
  {
  	if($form.valid())
  	{
  		form_loading($form);

  		setTimeout(function() {
  			form_success($form);
  		}, 2000);
  	}
  }

  //-- INT FUNCTIONS
  function checkBarStatusStatus(){

      console.log("checkstatusbar");
      bAdm.loadNeededFiles(function(_config,isCatLoaded){
          config = _config;

          if(config.latitude!==null && config.longitute!==null && config.latitude!=="" && config.longitute!=="")
              showPosition(config.latitude, config.longitute);
          else
              getLocationsMap();

          catLoaded = isCatLoaded;
          $.each(config,function(key, value){

              var layCont = null;
              if($("#configDiv #"+key) !== undefined)
                  layCont = $("#configDiv #"+key);
              else if($("#config2Div #"+key) !== undefined)
                  layCont = $("#config2Div #"+key);
              else if($("#config3Div #"+key) !== undefined)
                  layCont = $("#config2Div #"+key);
              if(layCont !== null){
                  if(layCont.prop("tagName")!== undefined && layCont.prop("tagName").toLowerCase() === "input")
                    layCont.val(value);
                  else
                    layCont.html(value);
              }
          });
          loadSectionPage('config1');
      });
  }

  function runCatalogLoad(){
    catAdm.getCatalogFromFileSystem();
  }



  $("#refreshCurrCat").click(function(){
      catAdm.sendCat2WutzCloud(function(_config){
           config = _config;
           $("#catLoadingBox").html("Process Finished");
      });
  });

  $(document).ready(function() {

      check4updates();
      if(window.sessionStorage.getItem("logged"))
          checkBarStatusStatus();
  });

    function getLocationsMap() {

        if (navigator.geolocation) {
            console.log("Access GEOLOC");
            navigator.geolocation.getCurrentPosition(function(position){
                showPosition(position.coords.latitude, position.coords.longitude);
            });
            console.log("Loading map");
        } else {
            console.log("Map Failed");
        }
   // });
   }



   function showPosition(lat, lon) {

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

                searchBox.setBounds(map.getBounds());
                // Bias the SearchBox results towards current map's viewport.
                map.addListener('bounds_changed', function() {
                  searchBox.setBounds(map.getBounds());
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
                        newLat = place.geometry.location.lat();
                        newLon = place.geometry.location.lng();
                       // console.log(place.geometry.location.lat() +" : "+place.geometry.location.lng());
                       marker.setPosition(place.geometry.location);
                       map.setCenter(place.geometry.location);
                    });
                });

                google.maps.event.addListener(marker, "dragend", function(event) {
                        newLat = event.latLng.lat();
                        newLon = event.latLng.lng();
                        console.log("Position changed: "+lat + " : "+lng);
                 });
              }
          });
    }


})(jQuery);

var sectionMapping = {
      'login':{'id':'loginDiv','posy':'0'},
      'subscribe':{'id':'newBarDiv','posy':'-400'},
      'forgotPass':{'id':'forgotPassDiv','posy':'-900'},
      'config1':{'id':'configDiv','posy':'-1300'},
      'config2':{'id':'config2Div','posy':'-1800'},
      'config3':{'id':'config3Div','posy':'-2180'},
       'loaded':'login'
  };

  function loadSectionPage(section){
      var obj2Load = sectionMapping[section].id;
      var pos = sectionMapping[section].posy;
      var obj2Unload = sectionMapping[sectionMapping.loaded].id;

      /**
      $('#mainContainer').animate({
         top: $("#"+obj2Load).offset().top
      }, 2000);
      **/
      $("#mainContainer").animate({'top':pos},2000);
      $("#"+obj2Load).css("visibility", "visible");
      $("#"+obj2Unload).css("visibility", "hidden");

      sectionMapping.loaded = section;

  }

  function loadModalPage(modPage){
     console.log("To load modal " +modPage);
    // $(".modal").modal("hide");
     $("#"+modPage).appendTo("body").modal("show");
  }
