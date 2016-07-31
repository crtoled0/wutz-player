function AppViewModel() {
    
   //Observable Definitions 
    mainMod = this;
    mainMod.config = ko.observable({});
    mainMod.formElems = ko.observableArray([]);
    
    mainMod.isbarIdReady = ko.observable(false);
    mainMod.isbarConfReady = ko.observable(false);
    mainMod.isbarCatReady = ko.observable(false);
    mainMod.confSaved = ko.observable(false);
    
    $(document).ready(function() {
        mainMod.loadFormFromJSON();
    });
    
    this.loadFormFromJSON = function(){
        $.getJSON( "json/config.json", function(_config) {
                mainMod.config(_config);
                mainMod.formElems.push({type:"text",id:"bar_id",label:"Id del Bar",value:_config.bar_id});
                mainMod.formElems.push({type:"text",id:"musicPath",label:"Ruta del Catalogo",value:_config.musicPath});
               // mainMod.formElems.push({type:"text",id:"separator",label:"Separador (Windows = \\ , Linux = /)",value:_config.separator});
                mainMod.formElems.push({type:"text",id:"songsAllowed",label:"Máximo de canciones",value:_config.songsAllowed});
                mainMod.formElems.push({type:"text",id:"nombreBar",label:"Nombre del Bar",value:_config.nombreBar});
                mainMod.formElems.push({type:"text",id:"representante",label:"Representante",value:_config.representante});
                mainMod.formElems.push({type:"text",id:"telefono",label:"Telefono",value:_config.telefono});
                mainMod.formElems.push({type:"text",id:"latitude",label:"Lat",value:_config.latitude});
                mainMod.formElems.push({type:"text",id:"longitute",label:"Lon",value:_config.longitute});
                mainMod.formElems.push({type:"text",id:"dayToken",label:"Llave del día",value:_config.dayToken});
                mainMod.formElems.push({type:"textarea",id:"desc",label:"Descripción",value:_config.desc});
                mainMod.validateAllIsReady();
                
                $('input').on('blur', function () {
                    mainMod.config()[this.id] = this.value;
                    mainMod.validateAllIsReady();
                });
                
        });
    };
    
    this.validateAllIsReady = function(){
        
        console.log("validating");
        var conf = mainMod.config();
        if(conf.bar_id === "-" || conf.musicPath === "-" || conf.bar_id === "" || conf.musicPath === ""){
            mainMod.isbarIdReady(false);
            mainMod.isbarConfReady(false);
            mainMod.isbarCatReady(false);
            return ;
        }
        
        mainMod.isbarIdReady(true);
        mainMod.isbarConfReady(true);
        
        if(conf.catid === "-" || conf.catid === ""){
           
           mainMod.isbarCatReady(false);
           return 
        }
        
        mainMod.isbarCatReady(true);
        
    };
    
    this.loadLocalCatalog2DB = function(){
    
        loadingButton($("#saveCatRow button"));
        var params = {};
        mainMod.isbarCatReady(false);
      $.ajax({
		type: 'POST',
		dataType: 'json',
		url: "/Wutz/serv/delegate/wutzDelegMan.php?fnc=loadCatalogToDatabase",
		data: params,
		success: function (result) {
                    if(result.OK){
			console.log("Catalogo Local Cargado");
                        mainMod.uploadNewCatalog();
                    }
		},
		error: function (xhr, txtStat, errThrown) {
			console.log(xhr.status+':::'+txtStat+':::'+errThrown);
		}
      });
      //uploadCatalog2RemoteWutz
    };
    
     this.uploadNewCatalog = function(){
    
        var params = {};
        
      $.ajax({
		type: 'POST',
		dataType: 'json',
		url: "/Wutz/serv/delegate/wutzDelegMan.php?fnc=uploadCatalog2RemoteWutz",
		data: params,
		success: function (result) {
			console.log("Catalogo Cargado");
                        mainMod.isbarCatReady(true);
                        mainMod.loadFormFromJSON();
                        stopLoadingButton($("#saveCatRow button"),"GO");
		},
		error: function (xhr, txtStat, errThrown) {
			console.log(xhr.status+':::'+txtStat+':::'+errThrown);
		}
      });
      //uploadCatalog2RemoteWutz
    };
    
     this.saveAndUploadConfig = function(){
    
      loadingButton($("#saveBarRow button"));
      var params = mainMod.config();
      params = JSON.stringify(params);
        
      $.ajax({
		type: 'POST',
		dataType: 'json',
		url: "/Wutz/serv/delegate/wutzDelegMan.php?fnc=saveServerInfo",
		data: params,
		success: function (result) {
                    if(result.OK){
                        console.log("Config Guardado");
                        mainMod.loadFormFromJSON();
                    }
                    mainMod.confSaved(true);
                    stopLoadingButton($("#saveBarRow button"),"GO");
		},
		error: function (xhr, txtStat, errThrown) {
			console.log(xhr.status+':::'+txtStat+':::'+errThrown);
                        stopLoadingButton($("#saveBarRow button"),"GO");
		}
      });
      //uploadCatalog2RemoteWutz
    };
}
// Activates knockout.js
ko.applyBindings(new AppViewModel());

function loadingButton(obj){
    var imgLoad = $("<img src=\"img/ajax-loader.gif\" />")
    obj.html("");
    obj.append(imgLoad);
}

function stopLoadingButton(obj,text){
    obj.html("");
    obj.html(text);
}