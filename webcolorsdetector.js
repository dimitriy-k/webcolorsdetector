var wcd_loader = new function(){
	this.jqueryURL = "//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js";
	this.jqueryUiURL = "//ajax.googleapis.com/ajax/libs/jqueryui/1.9.2/jquery-ui.min.js";
	this.jqueryUiCssURL = "//ajax.googleapis.com/ajax/libs/jqueryui/1.9.0/themes/black-tie/jquery-ui.css";
	this.query = 0;
	
	this.init = function(){
		if(typeof jQuery=='undefined'){
			console.log('loading jQuery');
			this.query++;
			var self = this;
			
			
			var n=document.createElement('script');
			n.setAttribute('type','text/javascript');
			n.setAttribute('src',this.jqueryURL);
			n.addEventListener('load', function (e) { 
				self.query--;
				if(typeof jQuery.ui=='undefined')self.loadjQueryUI();
			});
			document.getElementsByTagName('head')[0].appendChild(n);
			
		}else if(typeof jQuery.ui=='undefined'){
			this.loadjQueryUI();
		}
	};
	
	this.loadjQueryUI = function() {
		if(typeof jQuery.ui!='undefined') return;
		console.log('loading jQuery UI');
		this.query++;
		var self = this;
		
		// load jquery ui css
		if (document.createStyleSheet){
			document.createStyleSheet(this.jqueryUiCssURL);
		}else{
			$("head").append($('<link rel="stylesheet" href="'+this.jqueryUiCssURL+'" type="text/css" media="screen" />'));
		}
		
		// load jquery ui js
		$.getScript(this.jqueryUiURL, function(data, textStatus, jqxhr) {
			self.query--;
		});
	};
	
	this.done = function(){
		return (this.query == 0)?true:false;
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
		$('#wcd_dialog').dialog('close');
		
		if(wcd_loader.done()){	
			this.printColors();
		}
	};
	
	this.forEachChildren = function(el){
		if($(el).hasClass("debugElement")) return;
		
		var self = this;
		$.each($(el).children(), function(index, element){
			try{			
				self.addColor(self.rgb2hex($(element).css("color")),self.colorsText);
				self.addColor(self.rgb2hex($(element).css("backgroundColor")),self.colorsBackground);
				if($(element).css("background-image") != null && $(element).css("background-image").indexOf("-gradient") != -1)self.addColor($(element).css("background-image"), self.colorsBackground);
				self.addColor(self.rgb2hex($(element).css("border-top-color")),self.colorsBorder);
				self.addColor(self.rgb2hex($(element).css("border-right-color")),self.colorsBorder);
				self.addColor(self.rgb2hex($(element).css("border-bottom-color")),self.colorsBorder);
				self.addColor(self.rgb2hex($(element).css("border-left-color")),self.colorsBorder);
				if($(element).children().length > 0){
					self.forEachChildren(element);
				}
			}catch (err){
				alert('Er is een fout opgetreden. Gebruikt u Internet Explorer? Probeer dan een fatsoenlijke browser. <br><br>'+err);
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
		
		if($.inArray(color,arr) == -1)
			arr[arr.length] = color;
			
		if($.inArray(color,this.colorsAll) == -1)
			this.colorsAll[this.colorsAll.length] = color;
	};
	
	this.mapArray = function(arr){
		var self = this;
		return $.map(arr, function (a) { 
			  var lable = a
			  if(!a.indexOf("#")==0) lable = '<font color="maroon">gradient</font>';
			  if($.inArray(a.toString(),self.browserColors) >= 0) lable = '<font color="SteelBlue">'+a+'</font>';

			  return '<div style="margin-bottom: 2px"><span style="width: 70px;line-height: 20px;float: left;">'+lable+'</span><span style="width: 100px; height: 20px; display: inline-block; background: '+a+'" onclick="$(\'#color\').val(\''+a+'\')"></span></div>'; 
			});
	};
	
	this.findColor = function(){
		$("#foundedElements").html("");
		this.forEachChildrenFindColor($("body"), $("#color").val(),$("#wcd_log").is(":checked"));
		$("#foundedElements").prepend('<p style="color: gray">'+$("#foundedElements br").length+" elements found</p>").append("<hr/>");
	};
	
	this.forEachChildrenFindColor = function(el, color, log){
		if($(el).hasClass("debugElement")) return;
		var self = this;
		$.each($(el).children(), function(index, element){
			try{
				var found = [];
				if(self.rgb2hex($(element).css("color")) == color)found[found.length] = "color";
				if(self.rgb2hex($(element).css("backgroundColor")) == color)found[found.length] = "backgroundColor";
				if($(element).css("background-image").indexOf("-gradient") != -1 && $(element).css("background-image") == color)found[found.length] = "gradient";
				if(self.rgb2hex($(element).css("border-top-color")) == color) found[found.length] = "border-top-color";
				if(self.rgb2hex($(element).css("border-right-color")) == color)found[found.length] = "border-right-color";
				if(self.rgb2hex($(element).css("border-bottom-color")) == color)found[found.length] = "border-bottom-color";
				if(self.rgb2hex($(element).css("border-left-color")) == color)found[found.length] = "border-left-color";
				if(found.length > 0){
					if(log)console.log(element);
					
					var result = found.join(", ");
					result = result.replace("border-top-color, border-right-color, border-bottom-color, border-left-color", "border");
					
					$("#foundedElements").append("<b>&lt;"+$(element).prop("tagName")+"</b>"+
												((element.id.length > 0)?" <b>id</b>='"+element.id+"'":"")
												+(($(element).prop("class").length > 0)?" <b>class</b>='"+$(element).prop("class")+"'":"")
												+'<b>&gt;</b><font color="MidnightBlue"> '+result+"</font><br/>");
				}
				
				if($(element).children().length > 0){
					self.forEachChildrenFindColor(element,color,log);
				}
			}catch (err){
				alert('Er is een fout opgetreden. Gebruikt u Internet Explorer? Probeer dan een fatsoenlijke browser. <br><br>'+err);
			}
		});
	};
	
	this.printColors = function(){
		this.forEachChildren($("body"));

		var text = this.mapArray(this.colorsText);
		var back = this.mapArray(this.colorsBackground);
		var border = this.mapArray(this.colorsBorder);
		var all = this.mapArray(this.colorsAll);
		
		var html = '<div><input type="text" id="color" style="display:inline-block;margin:2px"> \
				<input type="button" onclick="wcd.findColor()" value="Find"  style="display:inline-block;margin:2px"> \
				<input type="button" onclick="$(\'#foundedElements\').html(\'\')" value="Clean"  style="display:inline-block;margin:2px"> \
				<input type="checkbox" name="wcd_log" id="wcd_log" checked="checked" style="display:inline-block;margin:2px">enable console.log</div><hr /> \
						<div id="foundedElements" style="overflow: auto; max-height: 250px;"></div> \
						<div style="float: left;padding:10px"><h3>Text ('+text.length+')</h3>'+text.join("")+'</div> \
						<div style="float: left;padding:10px;"><h3>Background ('+back.length+')</h3>'+back.join("")+'</div> \
						<div style="float: left;padding:10px"><h3>Border ('+border.length+')</h3>'+border.join("")+'</div> \
						<div style="float: left;padding:10px"><h3>All ('+all.length+')</h3><div class="sortable">'+all.join("")+"</div></div>";

	
	
		console.log("open dialog")
		$('<div id="wcd_dialog" style="font-family: Verdana, Arial, sans-serif;font-size: 13px;"><span class="md_loading" /></div>')
			.appendTo("body")
			.dialog({modal: true, 
					resizable: false,
					title: "WebColorsDetector 0.1",
					width: 800,
					dialogClass: 'debugElement',
					open: function(){
						$(this).html(html);
						$('.sortable').sortable();
						
						$(this).dialog("option", "position", 'center' );
					},
					close: function(event,ui){
						$(this).remove()
					}			
			});	
	}
  };


  
 wcd.init();
  
