 (function($){
        var defaults = {
                   speed: 3000,
                   timeLapseBetween: 10000
            };
     $.fn.extend({ 
         textSlider: function(options) {
            var options = $.extend(defaults, options);
            return this.each(function() {
                
                 var o =options;
                 var obj = $(this);
                 var parWidth = parseFloat(obj.parent().css("width").replace("px",""));
                 var objWidth = parseFloat(obj.css("width").replace("px",""));
                 obj.css({opacity:1,left: "0%"});
                 
                 if(objWidth > parWidth){
                    
                    var inter = setInterval(function(){
                       
                     //  obj.css({opacity:0,left: "0%"});
                     //  obj.animate({opacity:1},1000);
                           obj.animate({left: "-100%",opacity:0.4}, o.speed,null,function(){
                           obj.animate({left: "0%",opacity:1}, o.speed);
                       });
                    }, o.timeLapseBetween);
                 }
            });
        }
    });
})(jQuery);