var wcd_loader = new function(){
	this.jqueryURL = "//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js";
	this.jqueryUiURL = "//ajax.googleapis.com/ajax/libs/jqueryui/1.9.2/jquery-ui.min.js";
	this.jqueryUiCssURL = "//ajax.googleapis.com/ajax/libs/jqueryui/1.9.0/themes/black-tie/jquery-ui.css";
	this.query = 2;
	
	this.init = function(){
		var self = this;
		
		this.showFeedback('Loading WebColorsDetector, please wait...')

		var jQueryNeeded = true;
		if(typeof jQuery!='undefined'){
			console.log('jquery version: '+jQuery.fn.jquery);
		
			var jqueryVersion = jQuery.fn.jquery.replace(/\D/g,'');
			if(parseInt(jqueryVersion) > 183)jQueryNeeded = false; // works in 1.4.4,  not 1.3.2, 1.4.2
		}
		
		if(jQueryNeeded){
			console.log('loading jQuery 1.8.3');
			
			var n=document.createElement('script');
			n.setAttribute('type','text/javascript');
			n.setAttribute('src',this.jqueryURL);
			n.addEventListener('load', function (e) { 
				self.query--;
				if(typeof jQuery.ui=='undefined' || typeof jQuery.ui.dialog=='undefined')self.loadjQueryUI();
			});
			document.getElementsByTagName('head')[0].appendChild(n);
			
		}else if(typeof jQuery.ui=='undefined' || typeof jQuery.ui.dialog=='undefined') {
			self.query--;
			this.loadjQueryUI();
		}
	};
	
	this.showFeedback = function(text){
		if(document.getElementById('wcd_loader') != null){
			document.getElementById('wcd_loader').innerHTML = text;
		}else{
			var l = document.createElement( 'div' );
			l.style.position = 'absolute';
			l.style.top = '0';
			l.style.left = '0';
			l.style.color = 'white';
			l.style.padding = '5px 10px';
			l.style.fontSize = '11px';
			l.style.zIndex = '999999';
			l.style.backgroundColor = '#333';
			l.style.border = '1px solid #fff'
			l.setAttribute( 'id', 'wcd_loader' );
			l.innerHTML =text;
			
			document.getElementsByTagName('body')[0].insertBefore(l, document.body.childNodes[0] );
		}
	};
	
	this.removeFeedback = function(){
		jQuery('#wcd_loader').remove();
	};
	
	this.loadjQueryUI = function() {
		if(typeof jQuery.ui!='undefined' && typeof jQuery.ui.dialog!='undefined'){
			this.query--;
			return;
		}
		console.log('loading jQuery UI');
		
		var self = this;
		
		// load jquery ui css
		if (document.createStyleSheet){
			document.createStyleSheet(this.jqueryUiCssURL);
		}else{
			jQuery("head").append(jQuery('<link rel="stylesheet" href="'+this.jqueryUiCssURL+'" type="text/css" media="screen" />'));
		}
		// load jquery ui js
		jQuery.getScript(this.jqueryUiURL, function(data, textStatus, jqxhr) {
			if(typeof jQuery.ui.dialog!='undefined') self.query--;
			else self.showFeedback("Error while loading jQuery UI");
		});
	};
	
	this.done = function(){
		console.log("done "+this.query)
		if(this.query == 0){
			this.removeFeedback();
			return true;
		}
		
		return false;
	}
}

wcd_loader.init();

/* =============== DEBUG page colors =============== */

var wcd = new function() {
	this.colorsText = new Array();
	this.colorsBackground = new Array();
	this.colorsBorder = new Array();
	this.colorsAll = new Array();
	this.browserColors = ['#000000',"#808080",'#000','#0000ee', // default browser colors
							'#000080','#d4d0c8']; // FF specific
	
	this.init = function(){
		var self = this;
		if(typeof wcd_loader!='undefined' && wcd_loader.done()){
			
			this.printColors();
		}else{ 
			setTimeout(function(){self.init()},500);
		}
	};
	
	this.reload = function(){
		jQuery('#wcd_dialog').dialog('close');
		
		if(wcd_loader.done()){	
			this.printColors();
		}
	};
	
	this.forEachChildren = function(el){
		if(jQuery(el).hasClass("debugElement")) return;
		
		var self = this;
		jQuery.each(jQuery(el).children(), function(index, element){
			try{			
				self.addColor(self.rgb2hex(jQuery(element).css("color")),self.colorsText);
				self.addColor(self.rgb2hex(jQuery(element).css("backgroundColor")),self.colorsBackground);
				if(jQuery(element).css("background-image") != null && jQuery(element).css("background-image").indexOf("-gradient") != -1)self.addColor(jQuery(element).css("background-image"), self.colorsBackground);
				self.addColor(self.rgb2hex(jQuery(element).css("border-top-color")),self.colorsBorder);
				self.addColor(self.rgb2hex(jQuery(element).css("border-right-color")),self.colorsBorder);
				self.addColor(self.rgb2hex(jQuery(element).css("border-bottom-color")),self.colorsBorder);
				self.addColor(self.rgb2hex(jQuery(element).css("border-left-color")),self.colorsBorder);
				if(jQuery(element).children().length > 0){
					self.forEachChildren(element);
				}
			}catch (err){
				wcd_loader.showFeedback('Error found:<br><br>'+err);
			}
		});
	};

	this.rgb2hex = function (rgb) {
		rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
		if(rgb == null) return 'null';
		function hex(x) {
			return ("0" + parseInt(x).toString(16)).slice(-2);
		}
		return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
	};

	this.addColor = function(color, arr){
		if(color == "null" || color == null) return; // for FF
		
		if(jQuery.inArray(color,arr) == -1)
			arr[arr.length] = color;
			
		if(jQuery.inArray(color,this.colorsAll) == -1)
			this.colorsAll[this.colorsAll.length] = color;
	};
	
	this.mapArray = function(arr){
		var self = this;
		return jQuery.map(arr, function (a) { 
			  var lable = a
			  if(!a.indexOf("#")==0) lable = '<font color="maroon">gradient</font>';
			  if(jQuery.inArray(a.toString(),self.browserColors) >= 0) lable = '<font color="SteelBlue">'+a+'</font>';

			  return '<div style="margin-bottom: 2px"><span style="width: 70px;line-height: 20px;float: left;">'+lable+'</span><span style="width: 100px; height: 20px; display: inline-block; background: '+a+'" onclick="jQuery(\'#color\').val(\''+a+'\')"></span></div>'; 
			});
	};
	
	this.findColor = function(){
		jQuery("#foundedElements").html("");
		this.forEachChildrenFindColor(jQuery("body"), jQuery("#color").val(),jQuery("#wcd_log").is(":checked"));
		jQuery("#foundedElements").prepend('<p style="color: gray; margin: 5px 0;">'+jQuery("#foundedElements br").length+" elements found</p>").append("<hr/>");
	};
	
	this.forEachChildrenFindColor = function(el, color, log){
		if(jQuery(el).hasClass("debugElement")) return;
		var self = this;
		jQuery.each(jQuery(el).children(), function(index, element){
			try{
				var found = [];
				if(self.rgb2hex(jQuery(element).css("color")) == color)found[found.length] = "color";
				if(self.rgb2hex(jQuery(element).css("backgroundColor")) == color)found[found.length] = "backgroundColor";
				if(jQuery(element).css("background-image").indexOf("-gradient") != -1 && jQuery(element).css("background-image") == color)found[found.length] = "gradient";
				if(self.rgb2hex(jQuery(element).css("border-top-color")) == color) found[found.length] = "border-top-color";
				if(self.rgb2hex(jQuery(element).css("border-right-color")) == color)found[found.length] = "border-right-color";
				if(self.rgb2hex(jQuery(element).css("border-bottom-color")) == color)found[found.length] = "border-bottom-color";
				if(self.rgb2hex(jQuery(element).css("border-left-color")) == color)found[found.length] = "border-left-color";
				if(found.length > 0){
					if(log)console.log(element);
					
					var result = found.join(", ");
					result = result.replace("border-top-color, border-right-color, border-bottom-color, border-left-color", "border");
					
					jQuery("#foundedElements").append("<b>&lt;"+jQuery(element)[0].nodeName+"</b>"+
												((element.id.length > 0)?" <b>id</b>='"+element.id+"'":"")
												+((jQuery(element).attr("class"))?" <b>class</b>='"+jQuery(element).attr("class")+"'":"")
												+'<b>&gt;</b><font color="MidnightBlue"> '+result+"</font><br/>");
				}
				
				if(jQuery(element).children().length > 0){
					self.forEachChildrenFindColor(element,color,log);
				}
			}catch (err){
				wcd_loader.showFeedback('Error found:<br><br>'+err);
			}
		});
	};
	
	this.printColors = function(){
		this.forEachChildren(jQuery("body"));

		var text = this.mapArray(this.colorsText);
		var back = this.mapArray(this.colorsBackground);
		var border = this.mapArray(this.colorsBorder);
		var all = this.mapArray(this.colorsAll);
		
		var html = '<div><input type="text" id="color" style="display:inline-block;margin:2px"> \
				<input type="button" onclick="wcd.findColor()" value="Find"  style="display:inline-block;margin:2px"> \
				<input type="button" onclick="jQuery(\'#foundedElements\').html(\'\')" value="Clean"  style="display:inline-block;margin:2px"> \
				<div style="display:inline-block"><input type="checkbox" name="wcd_log" id="wcd_log" checked="checked" style="display:inline-block;margin:2px">enable console.log</div></div><hr /> \
						<div id="foundedElements" style="overflow: auto; max-height: 250px;"></div> \
						<div style="float: left;padding:10px"><h3 style="margin: 10px 0;">Text ('+text.length+')</h3>'+text.join("")+'</div> \
						<div style="float: left;padding:10px;"><h3 style="margin: 10px 0;">Background ('+back.length+')</h3>'+back.join("")+'</div> \
						<div style="float: left;padding:10px"><h3 style="margin: 10px 0;">Border ('+border.length+')</h3>'+border.join("")+'</div> \
						<div style="float: left;padding:10px"><h3 style="margin: 10px 0;">All ('+all.length+')</h3><div class="sortable">'+all.join("")+"</div></div>";

		jQuery('<div id="wcd_dialog" style="font-family: Verdana, Arial, sans-serif;font-size: 13px;z-index:99999999999999"><span class="md_loading" /></div>')
			.appendTo("body")
			.dialog({modal: true, 
					resizable: false,
					title: "WebColorsDetector 1.0",
					width: 800,
					dialogClass: 'debugElement',
					open: function(){
						jQuery(this).html(html);
						jQuery('.sortable').sortable();
						
						jQuery(this).dialog("option", "position", 'center' );
					},
					close: function(event,ui){
						jQuery(this).remove()
					}			
			});	
	}
  };

  
 wcd.init();
  
