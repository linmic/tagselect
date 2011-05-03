/*
* jQuery TagSelect Plugin
*
* Copyright (c) 2011 Po-Huan, Lin a.k.a Linmic
* Mail: linmicya@gmail.com
*
* Licensed under MIT licenses:
*     http://www.opensource.org/licenses/mit-license.php
* Version: v0.2 2010-05-04
*
*/

(function ($){ 
	$.fn.extend({
		tagselect: function (tags, sep, $input, ac_enable, jqueryui_css) {
			// customized typeOf, by Douglas Crockford
			function typeOf(value) {
				var s = typeof value;
				if (s === 'object') {
					if (value) {
						if (value instanceof Array) {
							s = 'array';
						}
					} else {
						s = 'null';
					}
				}
				return s;
			}

			// extended function, new version of indexOf which is case insensitive
			Array.prototype.indexOfIg = function (key) {
				if(typeOf(key) !== 'string') {
					return false;
				}
				var $this = this,
				key = key.toLowerCase();

				for(var i in $this) {
					if( $this.hasOwnProperty(i) ) {
						$this[i] = $this[i].toLowerCase();
					}
				}
				return $this.indexOf(key);
			}

			function ac_split( str, sep ) {
				if(sep===',') {
					return str.split( /,\s*/ );
				} else if(sep===' ') {
					return str.split( /\s+/ );
				} else {
					return str.split( sep );
				}
			}

			// trim + split + lowercase, return array
			function trim_n_split( str, sep ) {
				var arr = $.trim(str.toLowerCase()).split(sep);
				for(var i in arr) {
					if( arr.hasOwnProperty(i) ) { arr[i] = $.trim(arr[i]); }
				}
				return arr;
			}

			function extractLast( term, sep ) {
				return ac_split( term, sep ).pop();
			}

			// add tag to select_tags
			function add_tag( tag ) {
				if(selected_tags.indexOfIg(tag)==-1) { selected_tags.push($.trim(tag)); }
			}

			// remove tag from selected_tags
			function rm_tag( tag ) {
				var i = selected_tags.indexOfIg($.trim(tag));
				if(i!=-1) { selected_tags.splice(i, 1); }
			}

			// check the input value, then rebuild it
			function rebuild() {
				var arr = trim_n_split($input.val(), sep);
				selected_tags = [];

				if($.trim($input.val())!='') {
					for(var i in arr) {
						if( arr.hasOwnProperty(i) && arr[i]!='' ) {
							add_tag(arr[i]);
						}
					}
				}

				$box.find('a').each(function () {
					if(arr.indexOfIg($(this).text())==-1) {
						$(this).removeClass('active');
					} else {
						$(this).addClass('active');
					}
				});
			}

			// check if there's a given array of tags
			if(typeOf(tags) !== 'array' || ( sep!=',' && sep!=' ') ) {
				return false;
			}

			this.defaults = {
				sep: " ", // delimiter
				$input: $('#input1'),
				ac_enable: false,
				ac_css: "http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.12/themes/base/jquery-ui.css"
			}

			var sep = (!sep) ? this.defaults.sep : sep,
			$input = (!$input) ? this.defaults.$input : $input,
			ac_enable = (!ac_enable) ? this.defaults.ac_enable : ac_enable,
			$box = this,
			selected_tags = [];

			// check if autocomplete is loaded
			if(ac_enable == true && typeof $input.autocomplete == 'function') {
				//sep = ","; // autocomplete only supports comma as delimiter so far
				// autocomplete's stylesheet URI
				var ac_css = (!jqueryui_css) ? "http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.12/themes/base/jquery-ui.css" : jqueryui_css;

				// multi-css from jQuery UI, load only if never loaded
				if( $('link#jqueryui_css').length == 0 ) {
					$("head").append("<link>");
					var css = $("head").children(":last");
					css.attr({
						id: "jqueryui_css",
						rel:  "stylesheet",
						type: "text/css",
						href: ac_css
					});
				}

				$input.autocomplete({
					minLength: 0,
					source: function( request, response ) {
						// delegate back to autocomplete, but extract the last term
						response( $.ui.autocomplete.filter( tags, extractLast( request.term, sep ) ) );
					},
					focus: function( e, ui ) {
						e.preventDefault();
					},
					select: function( e, ui ) {
						arr = selected_tags;
						arr.push( ui.item.value );
						this.value = arr.join(sep);
						$input.focus().val($.trim(selected_tags.join(sep))); // check if duplicate
						rebuild();
						e.preventDefault();
					}
				});
			}

			// tag button generation
			for(var i=0, len=tags.length; i<len; i++) {
				// IDs are unnecessarry actually, but I put them on anyway ...
				$box.append('<a id="tag_' + i + '" href="#">' + tags[i] + '</a>');
			}

			// refresh the status of the tags
			$input
			.bind("change, click", function (e) { rebuild(); })
			.bind("keyup", function (e) {
				if( $.trim($input.val()) == '' ) {
					rebuild();
				}
				// TODO here can be better controlled
				switch(e.keyCode) {
				case 32: // space
				/*
				case 8: // backspace
				case 46: // delete
					rebuild();
				break;
				*/
				case 188: // comma
					if( sep!=',' ) { rebuild(); }
					break;
				default:
					break;
				}
			});

			$box.find('a').bind('click', function (e) {
				var $this = $(this),
				tag_text = $.trim($this.text());

				if( !$this.hasClass('active') ) { // if inactive
					$this.addClass('active');
					add_tag(tag_text);
				} else { // if active
					$this.removeClass('active');
					if(selected_tags.indexOfIg(tag_text)!=-1) {
						rm_tag(tag_text);
					}
				}
				var s = trim_n_split($input.val(), sep);
				for(var i in s) {
					// if this is a new tag which is not included in tag src nor selected tags
					if(selected_tags.indexOfIg(s[i])===-1 && tags.indexOfIg(s[i])===-1 && s[i]!=='' && s[i]!=tag_text) {
						add_tag(s[i]);
					}
				}

				$input.focus().val($.trim(selected_tags.join(sep)));
				e.preventDefault();
			});

			// user interaction tweak
			$input.focus(function () { this.value = this.value; });

			// rebuild as this initiate
			rebuild();
		}
	});
})(jQuery);
