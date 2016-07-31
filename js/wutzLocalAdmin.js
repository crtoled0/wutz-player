(function($) {
    "use strict";
    
    var catLoaded = false;
    var config = null;
    var bAdm = require('./js/lib/barAdmin');
    var catAdm = require("./js/lib/catalogTools");
	// Options for Message
	//----------------------------------------------
  var options = {
	  'btn-loading': '<i class="fa fa-spinner fa-pulse"></i>',
	  'btn-success': '<i class="fa fa-check"></i>',
	  'btn-error': '<i class="fa fa-remove"></i>',
	  'msg-login-success': 'Good ... Loading Bar',
	  'msg-login-error-pass': 'Password incorrect',
          'msg-login-error-usr': "User doesn't exist"
  };	// Login Form
	//----------------------------------------------
	// Validation
  $("#login-form").validate({
  	rules: {
          bar_id: "required",
  	  pass: "required"
    },
  	errorClass: "form-invalid"
  });
  
	// Form Submission
  $("#login-form").submit(function() {
  	//remove_loading($(this));
        var currForm = $(this);
                    if(currForm.valid()){
                        form_loading(currForm);
                        var params = {};
                        params.barid = currForm.find("#bar_id").val();
                        params.pass = currForm.find("#pass").val();
                        window.sessionStorage.setItem("currBar",params.barid);
                        //console.log($(this).find("#bar_id").val());
                        bAdm.login(params,function(result){
                            remove_loading(currForm);
                            if(result.logged){
                                console.log("Logged In");
                                window.sessionStorage.setItem("logged",true);
                                form_success(currForm,'msg-login-success');
                                checkBarStatusStatus();
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
  $("#register-form").validate({
  	rules: {
      reg_username: "required",
  	  reg_password: {
  			required: true,
  			minlength: 5
  		},
   		reg_password_confirm: {
  			required: true,
  			minlength: 5,
  			equalTo: "#register-form [name=reg_password]"
  		},
  		reg_email: {
  	    required: true,
  			email: true
  		},
  		reg_agree: "required",
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
  $("#register-form").submit(function() {
  	remove_loading($(this));
		
		if(options['useAJAX'] == true)
		{
			// Dummy AJAX request (Replace this with your AJAX code)
		  // If you don't want to use AJAX, remove this
  	  dummy_submit_form($(this));
		
		  // Cancel the normal submission.
		  // If you don't want to use AJAX, remove this
  	  return false;
		}
  });

	// Forgot Password Form
	//----------------------------------------------
	// Validation
  $("#forgot-password-form").validate({
  	rules: {
      fp_email: "required",
    },
  	errorClass: "form-invalid"
  });
  
	// Form Submission
  $("#forgot-password-form").submit(function() {
  	remove_loading($(this));
		
		if(options['useAJAX'] == true)
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
  	remove_loading($(this));
        form_loading($(this));
	if(!catLoaded){
            loadSectionPage("config2");
        }
        else if(config.latitude === "" || config.longitute===""){
            loadSectionPage("config3");
        }
        else{
            document.location.href="./player.html";
        }
  	return false;
		
  });
  
  $("#config2Div form").submit(function() {
  	
        var form = $(this);
        remove_loading(form);
        form_loading(form);
       // console.log($("#musicPath"));
	var musPath = $("#musicPath").val();
        config.musicPath = musPath;
        bAdm.saveConfigFile(config,function(_config){
            config = _config;
            catAdm.getCatalogFromFileSystem(function(loadMsg){
                console.log(loadMsg);
                try{
                    var onGoingloadMsg = JSON.parse(loadMsg);
                    if(!onGoingloadMsg.done){
                        var perc = onGoingloadMsg.perc;
                        var song = onGoingloadMsg.song;
                        $("#catLoadingBox").html("["+perc+"] Loading ... ["+song+"]"); 
                    }
                    else{
                        $("#catLoadingBox").html("Local Catalog Loaded"); 
                        remove_loading(form);
                    }
                }catch(err){
                    console.log(err);
                }
            },function(){ //Finish Creating Local Catalog
                
                $("#catLoadingBox").html("Uploading Catalog to Wutz Cloud"); 
                catAdm.sendCat2WutzCloud(function(_config){
                    config = _config;
                    $("#catLoadingBox").html("Process Finished"); 
                    remove_loading(form);
                    loadSectionPage('config1');
                });
            });
        });
  	return false;
		
  });
	// Loading
	//----------------------------------------------
  function remove_loading($form)
  {
  	$form.find('[type=submit]').removeClass('error success');
  	$form.find('.login-form-main-message').removeClass('show error success').html('');
  }

  function form_loading($form)
  {
    $form.find('[type=submit]').addClass('clicked').html(options['btn-loading']);
  }
  
  function form_success($form, msg)
  {
	  $form.find('[type=submit]').addClass('success').html(options['btn-success']);
	  $form.find('.login-form-main-message').addClass('show success').html(options[msg]);
  }

  function form_failed($form, msg)
  {
  	$form.find('[type=submit]').addClass('error').html(options['btn-error']);
  	$form.find('.login-form-main-message').addClass('show error').html(options[msg]);
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
      
      bAdm.loadNeededFiles(function(_config,isCatLoaded){
          config = _config;
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

  function sendCatalog2Cloud(){
        
        catAdm.sendCat2Cloud();
  }
  
  $(document).ready(function() {
      if(window.sessionStorage.getItem("logged")){
          checkBarStatusStatus();
      }
  });
  
  
})(jQuery);

var sectionMapping = {
      'login':{'id':'loginDiv','posy':'100'},
      'subscribe':{'id':'newBarDiv','posy':'-400'},
      'forgotPass':{'id':'forgotPassDiv','posy':'-900'},
      'config1':{'id':'configDiv','posy':'-1350'},
      'config2':{'id':'config2Div','posy':'-1950'},
      'config3':{'id':'config3Div','posy':'-2100'},
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
   