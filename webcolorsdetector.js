// TODO separate jquery and jquery ui
if(typeof jQuery=='undefined'){
  console.log('loading jQuery');
	var n=document.createElement('script');
	n.setAttribute('language','JavaScript');
	n.setAttribute('src','//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js');
	document.body.appendChild(n);
		
	loadjQueryUI();
}else if(typeof jQuery.ui=='undefined'){
	loadjQueryUI();
}

function loadjQueryUI(){
	console.log('loading jQuery UI');

	var s = document.createElement('link');
	s.type = 'text/css';
	s.rel = 'stylesheet';
	s.href = 'https://raw.github.com/dixkom/webcolorsdetector/master/jquery-ui.css';
	s.addEventListener('load', function (e) { 
		var n=document.createElement('script');
		n.setAttribute('language','JavaScript');
		n.setAttribute('src','//ajax.googleapis.com/ajax/libs/jqueryui/1.9.2/jquery-ui.min.js');
		document.body.appendChild(n);
	}, false);
	document.getElementsByTagName('head')[0].appendChild(s);
}

/* =============== DEBUG page colors =============== */

var debug_pageColors = new function() {
	this.colorsText = new Array();
	this.colorsBackground = new Array();
	this.colorsBorder = new Array();
	this.colorsAll = new Array();
	this.browserColors = ['#000000',"#808080",'#000','#0000ee', // default browser colors
							'#000080','#d4d0c8']; // FF specific
	
	this.init = function(debugBox){
		var me = this;
		if(typeof jQuery!='undefined' && typeof jQuery.ui!='undefined'){
			
			this.printColors();
		}else{ 
			setTimeout(function(){me.init()},500);
		}
	};
	
	this.forEachChildren = function(el){
		if($(el).hasClass("debugElement")) return;
		
		var me = this;
		$.each($(el).children(), function(index, element){
			try{			
				me.addColor(me.rgb2hex($(element).css("color")),me.colorsText);
				me.addColor(me.rgb2hex($(element).css("backgroundColor")),me.colorsBackground);
				if($(element).css("background-image") != null && $(element).css("background-image").indexOf("-gradient") != -1)me.addColor($(element).css("background-image"), me.colorsBackground);
				me.addColor(me.rgb2hex($(element).css("border-top-color")),me.colorsBorder);
				me.addColor(me.rgb2hex($(element).css("border-right-color")),me.colorsBorder);
				me.addColor(me.rgb2hex($(element).css("border-bottom-color")),me.colorsBorder);
				me.addColor(me.rgb2hex($(element).css("border-left-color")),me.colorsBorder);
				if($(element).children().length > 0){
					me.forEachChildren(element);
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
		var me = this;
		return $.map(arr, function (a) { 
			  var lable = a
			  if(!a.indexOf("#")==0) lable = '<font color="maroon">gradient</font>';
			  if($.inArray(a.toString(),me.browserColors) >= 0) lable = '<font color="SteelBlue">'+a+'</font>';

			  return '<div style="margin-bottom: 2px"><span style="width: 70px;line-height: 20px;float: left;">'+lable+'</span><span style="width: 100px; height: 20px; display: inline-block; background: '+a+'" onclick="$(\'#color\').val(\''+a+'\')"></span></div>'; 
			});
	};
	
	this.findColor = function(){
		$("#foundedElements").html("");
		this.forEachChildrenFindColor($("body"), $("#color").val());
		$("#foundedElements").prepend('<p style="color: gray">'+$("#foundedElements br").length+" elements found</p>").append("<hr/>");
	};
	
	this.forEachChildrenFindColor = function(el, color){
		if($(el).hasClass("debugElement")) return;
		var me = this;
		$.each($(el).children(), function(index, element){
			try{
				var found = [];
				if(me.rgb2hex($(element).css("color")) == color)found[found.length] = "color";
				if(me.rgb2hex($(element).css("backgroundColor")) == color)found[found.length] = "backgroundColor";
				if($(element).css("background-image").indexOf("-gradient") != -1 && $(element).css("background-image") == color)found[found.length] = "gradient";
				if(me.rgb2hex($(element).css("border-top-color")) == color) found[found.length] = "border-top-color";
				if(me.rgb2hex($(element).css("border-right-color")) == color)found[found.length] = "border-right-color";
				if(me.rgb2hex($(element).css("border-bottom-color")) == color)found[found.length] = "border-bottom-color";
				if(me.rgb2hex($(element).css("border-left-color")) == color)found[found.length] = "border-left-color";
				if(found.length > 0){
					console.log(element);
					var result = found.join(", ");
					result = result.replace("border-top-color, border-right-color, border-bottom-color, border-left-color", "border");
					
					$("#foundedElements").append("<b>&lt;"+$(element).prop("tagName")+"</b>"+
												((element.id.length > 0)?" <b>id</b>='"+element.id+"'":"")
												+(($(element).prop("class").length > 0)?" <b>class</b>='"+$(element).prop("class")+"'":"")
												+'<b>&gt;</b><font color="MidnightBlue"> '+result+"</font><br/>");
				}
				
				if($(element).children().length > 0){
					me.forEachChildrenFindColor(element,color);
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
		
		var html = '<div><input type="text" id="color" ><input type="button" onclick="debug_pageColors.findColor()" value="Find" ><input type="button" onclick="$(\'#foundedElements\').html(\'\')" value="Clean" ></div><hr /> \
						<div id="foundedElements"></div> \
						<div style="float: left;padding:10px"><h3>Text ('+text.length+')</h3>'+text.join("")+'</div> \
						<div style="float: left;padding:10px;"><h3>Background ('+back.length+')</h3>'+back.join("")+'</div> \
						<div style="float: left;padding:10px"><h3>Border ('+border.length+')</h3>'+border.join("")+'</div> \
						<div style="float: left;padding:10px"><h3>All ('+all.length+')</h3><div class="sortable">'+all.join("")+"</div></div>";

	
	
		$('<div class="modalDialog"><span class="md_loading" /></div>')
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


  
 debug_pageColors.init();
  
