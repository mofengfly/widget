;KISSY.add("accordion", function(S){
	var $ = S.all;

	var hideProps = {},
		showProps = {};

	var  hideProps = {
             height: 0,
             marginTop: 0,
             marginBottom: 0,
             paddingTop: 0,
             paddingBottom: 0
         };
	function Accordion (options) {
		if (! this instanceof Accordion) {
			return new Accordion(options);
		}
		this.options = S.mix({}, options);
		this._init();
	}
	S.augment(Accordion, {
		_init: function(){
			var that = this;
			that.prevShow = that.prevHide = $();
			that._processPannels();
			that._refresh();
		},
		_refresh: function(){
			var that = this,
				options = that.options;
			that.headers.next().hide();
			that.active = this._findeActive(options.active);
			that.active.next().addClass("ui-accordion-content-active").show();

			that._setupEvents();

		},
		_processPannels: function(){
			var that = this;
			that.headers = $(that.options.header);
			that.pannels = $(that.options.pannel);
			S.each(S.makeArray(that.headers), function(header, i){
				var el = $(header);
				el.data('data-serial', i);
			});
			S.each(S.makeArray(that.pannels), function(header, i){
				var el = $(header);
				el.data('data-serial', i);
				el.data("dimensions", {
	                marginTop:      el.css("marginTop"),
	                marginBottom:   el.css("marginBottom"),
	                paddingTop:     el.css("paddingTop"),
	                paddingBottom:  el.css("paddingBottom"),
	                height:         el[0].offsetHeight - parseInt(el.css("paddingTop")) - parseInt(el.css("paddingBottom"))
	            });

			});
		},
		_setupEvents: function(){
			var that = this;
			that.headers.on('mouseenter', function(ev){
				that._activate($(ev.currentTarget).data('data-serial'));
			});
		},
		_activate: function(index){
			var active = this._findeActive(index);
			if (active == this.active[0]) {
				return;
			}
			active = active || this.active[0];
			this._eventHandler({
				target: active,
				currentTarget: active
			});
		},
		_eventHandler: function(event){
			var options = this.options,
				active = this.active,
				clicked = $( event.currentTarget ),
				clickedIsActive = clicked[ 0 ] === active[ 0 ],
				collapsing = clickedIsActive && options.collapsible,
				toShow = collapsing ? $() : clicked.next(),
				toHide = active.next(),
				eventData = {
					oldHeader: active,
					oldPanel: toHide,
					newHeader: collapsing ? $() : clicked,
					newPanel: toShow
				};

				this.active = clickedIsActive ? {} : clicked;
				this._toggle( eventData );
				if ( !clickedIsActive ) {
					clicked
						.removeClass( "ui-corner-all" )
						.addClass( "ui-accordion-header-active ui-state-active ui-corner-top" );
					if ( options.icons ) {
						clicked.children( ".ui-accordion-header-icon" )
							.removeClass( options.icons.header )
							.addClass( options.icons.activeHeader );
					}

					clicked
						.next()
						.addClass( "ui-accordion-content-active" );
				}
		},
		_toggle: function( data ) {
			var toShow = data.newPanel,
				toHide = this.prevShow.length ? this.prevShow : data.oldPanel;

			// handle activating a panel during the animation for another activation
			this.prevShow.add( this.prevHide ).stop( true);
			this.prevShow = toShow;
			this.prevHide = toHide;

			if ( this.options.animate ) {
				this._animate( toShow, toHide, data );
			} else {
				toHide.hide();
				toShow.show();
				// this._toggleComplete( data );
			}

			toHide.attr({
				"aria-expanded": "false",
				"aria-hidden": "true"
			});
			toHide.prev().attr( "aria-selected", "false" );
			// if we're switching panels, remove the old header from the tab order
			// if we're opening from collapsed state, remove the previous header from the tab order
			// if we're collapsing, then keep the collapsing header in the tab order
			if ( toShow.length && toHide.length ) {
				toHide.prev().attr( "tabIndex", -1 );
			} else if ( toShow.length ) {
				this.headers.filter(function() {
					return $( this ).attr( "tabIndex" ) === 0;
				})
				.attr( "tabIndex", -1 );
			}

			toShow
				.attr({
					"aria-expanded": "true",
					"aria-hidden": "false"
				})
				.prev()
					.attr({
						"aria-selected": "true",
						tabIndex: 0
					});
		},
		_animate: function( toShow, toHide, data ) {
			var total, easing, duration = 0.3,
				that = this,
				adjust = 0,
				down = toShow.length &&
					( !toHide.length || ( toShow.index() < toHide.index() ) ),
				animate = this.options.animate || {},
				options = down && animate.down || animate,
				complete = function() {
					//that._toggleComplete( data );
				};

			if ( typeof options === "number" ) {
				duration = options;
			}
			if ( typeof options === "string" ) {
				easing = options;
			}
			// fall back from options to animation in case of partial down settings
			easing = easing || options.easing || animate.easing;
			duration = duration || options.duration || animate.duration;

			if ( !toHide.length ) {
				return toShow.animate( toShow.data('dimensions'), duration, easing, complete );
			}
			if ( !toShow.length ) {
				return toHide.animate( hideProps, duration, easing, complete );
			}

			// total = toShow.show().outerHeight();
			toHide.animate( hideProps, {
				duration: duration,
				easing: easing
				// step: function( now, fx ) {
				// 	fx.now = Math.round( now );
				// }
			});
			toShow
				.animate(toShow.data('dimensions'), {
					duration: duration,
					easing: easing,
					complete: complete
					// step: function( now, fx ) {
					// 	fx.now = Math.round( now );
					// 	if ( fx.prop !== "height" ) {
					// 		adjust += fx.now;
					// 	} else if ( that.options.heightStyle !== "content" ) {
					// 		fx.now = Math.round( total - toHide.outerHeight() - adjust );
					// 		adjust = 0;
					// 	}
					// }
				});
		},
		_findeActive: function(selector){
			return typeof selector === "number" ? 
										this.headers[selector] : $(selector ,this.el);
		}

	});
	return Accordion;
});