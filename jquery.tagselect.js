/*
* jQuery TagSelect Plugin
*
* Copyright (c) 2011 Po-Huan, Lin a.k.a Linmic
* Mail: linmicya@gmail.com
*
* Licensed under MIT licenses:
*     http://www.opensource.org/licenses/mit-license.php
*
*/

(function($){ 
	$.fn.extend({
		tagselect: function(tags, sep, $input) {
			
			// check if there's a given array of tags
			if(typeOf(tags) != 'array') {
				return false;
			}

			this.defaults = {
				sep: " ", // delimiter
				$input: $('#input1')
			}

			var sep = (!sep) ? this.defaults.sep : sep,
			$input = (!$input) ? this.defaults.$input : $input,
			$box = this,
			selected_tags = [],
			ac_options = {
				width: 320,
				max: 4,
				highlight: false,
				multiple: true,
				multipleSeparator: sep,
				scroll: true,
				scrollHeight: 300
			},
			ac_css = "http://view.jquery.com/trunk/plugins/autocomplete/jquery.autocomplete.css"; // autocomplete's stylesheet URI

			// extended function, new version of indexOf which is case insensitive
			Array.prototype.indexOfIg = function (key) {
				if(typeOf(key) != 'string') {
					return false;
				}
				var $this = this;
				key = key.toLowerCase();

				for(var i in $this) {
					if($this.hasOwnProperty(i)) {
						$this[i] = $this[i].toLowerCase();
					}
				}
				return $this.indexOf(key);
			}

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

			// trim + split + lowercase, return array
			function trim_n_split( str, sep ) {
				var arr = $.trim(str.toLowerCase()).split(sep);
				for(var i in arr) {
					if( arr.hasOwnProperty(i) ) { arr[i] = $.trim(arr[i]); }
				}
				return arr;
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

				$box.find('a').each(function() {
					if(arr.indexOfIg($(this).text())==-1) {
						$(this).removeClass('active');
					} else {
						$(this).addClass('active');
					}
				});
			}

			// check if autocomplete is loaded
			if(typeof $input.autocomplete == 'function') {
				$("head").append("<link>");
				var css = $("head").children(":last");
				css.attr({
					rel:  "stylesheet",
					type: "text/css",
					href: ac_css
				});

				$input.autocomplete(tags, ac_options);
			}

			// tag button generation
			for(var i in tags) {
				// IDs are unnecessarry actually, but I put them on anyway ...
				if( tags.hasOwnProperty(i) ) { $box.append('<a id="tag_' + i + '" href="#">' + tags[i] + '</a>'); }
			}

			// refresh the status of the tags
			$input.bind("change, click, keyup", function(e) { rebuild(); });
			
			$box.find('a').bind('click', function(e) {
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
			$input.focus(function() { this.value = this.value; });

			// rebuild as this initiate
			rebuild();
		}
	});
})(jQuery);
