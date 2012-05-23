/**
 songticker-lib

 2010, 2012 - Lucas S. Bickel <hairmare@purplehaze.ch>
 Alle Rechte vorbehalten

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published 
 by the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 *
 * basic container function for songtickerli
 *
 * no private vars whatsoever, since i dont plan
 * on supporting multiple instances of this anyway.
 */
var SONGTICKERLI = function() {
	var storageReady = false;
};
SONGTICKERLI.tickerUrl = _songtickerli_url || 'ticker.php';
SONGTICKERLI.unknowTitleString = 'Radio Bern';
//##nolibmodestart
SONGTICKERLI.enableConfig = false;
SONGTICKERLI.enableTickerInfo = false;
SONGTICKERLI.enableLoveFeature = false;
SONGTICKERLI.enableArtistInfo = false;
SONGTICKERLI.enableLogosupport = false;
SONGTICKERLI.enableJstore = false;
SONGTICKERLI.localHistory = false;
SONGTICKERLI.showLoveDialog = false;
SONGTICKERLI.firstcolor = true;
//##nolibmodestop
SONGTICKERLI.scrollerLock = false;
SONGTICKERLI.observers = [];
SONGTICKERLI.show = SONGTICKERLI.unknowTitleString;
SONGTICKERLI.artist = '';
SONGTICKERLI.title = '';
SONGTICKERLI.starttime = '';
SONGTICKERLI.delay = 0;
SONGTICKERLI.lowdelay = 6000;
SONGTICKERLI.highdelay = 60000;
SONGTICKERLI.notifydelay = 3000;
SONGTICKERLI.artist_info = [];
SONGTICKERLI.debug = false;
/**
 * map where the data should get displayed
 * and in the case of starttime also stored
 * for later comparison
 */
SONGTICKERLI.targets = _songtickerli_targets || {
    "show":"#songtickerli .overlay .show",
    "title":"#songtickerli .overlay .title",
    "artist":"#songtickerli .overlay .artist",
    "starttime": "#songtickerli .overlay .starttime"
};
//##nolibmodestart
/**
 * an array for defining some basic setting fields to load
 */
SONGTICKERLI.configDataFields = [
	{name: 'showLoveDialog', field: SONGTICKERLI.showLoveDialog},
	{name: 'username', field: '#songtickerli input[name=username]'}
];
/**
 * register an observer 
 */
SONGTICKERLI.register_observer = function(observer) {
	SONGTICKERLI.observers[SONGTICKERLI.observers.length] = observer;
};
/**
 * call observers that support the love method
 */
SONGTICKERLI.observer_love = function(track) {
	calls = 0;
	for (var i = 0; i < SONGTICKERLI.observers.length; i++) {
		if (typeof SONGTICKERLI.observers[i].love == 'function') {
			calls += SONGTICKERLI.observers[i].love(track);
		}
	}
	calls < 1 && SONGTICKERLI.notify('Bitte konfiguriere songtickerli');
};
/**
 * call observers that support the jStoreReady method for loading data
 */
SONGTICKERLI.observer_jStoreReady = function() {
	for (var i = 0; i < SONGTICKERLI.observers.length; i++) {
		if (typeof SONGTICKERLI.observers[i].jStoreReady == 'function') {
			SONGTICKERLI.observers[i].jStoreReady();
		}
	}
};
//##nolibmodestop
/**
 * main loop responsible for ticking the ticker by starting ajax requesets.
 */
SONGTICKERLI.main = function() {
	// initialize ticker
	SONGTICKERLI.update(SONGTICKERLI.current_track());
	window.setTimeout(function() {
		$('#songtickerli .network-activity').show();
		$.ajax({
			url: SONGTICKERLI.tickerUrl,
			success: function(data) {
				SONGTICKERLI.artist     = $(data).children('ticker').children('track').children('artist').text();
				SONGTICKERLI.artistLink = $(data).children('ticker').children('artist').children('link').text();
				SONGTICKERLI.title      = $(data).children('ticker').children('track').children('title').text();
				SONGTICKERLI.titleLink  = $(data).children('ticker').children('track').children('link').text();
				SONGTICKERLI.show       = $(data).children('ticker').children('show').children('name').text();
				SONGTICKERLI.showLink   = $(data).children('ticker').children('show').children('link').text();
				SONGTICKERLI.starttime  = $(data).children('ticker').children('track').children('startTime').text();
				SONGTICKERLI.delay = SONGTICKERLI.lowdelay;
				typeof SONGTICKERLI.bleep != 'undefined' && SONGTICKERLI.bleep();
				SONGTICKERLI.main();
				SONGTICKERLI.debug && SONGTICKERLI.notify('Eine Internet Verbindung, nächstes Update in '+SONGTICKERLI.delay/1000/60+' Minuten');
			},
			error: function() {
				SONGTICKERLI.delay = SONGTICKERLI.highdelay;
				SONGTICKERLI.debug && SONGTICKERLI.notify('Keine Internet Verbindung, nächster Versuch in '+SONGTICKERLI.delay/1000/60+' Minuten', 'error');
				SONGTICKERLI.main();
			}
		});
	}, SONGTICKERLI.delay);
	if (SONGTICKERLI.delay == 0) {
		SONGTICKERLI.delay = SONGTICKERLI.lowdelay;
	}
};
/**
 * update the ticker if changes are detected
 */
SONGTICKERLI.update = function(track) {
	if (track.starttime == $('#songtickerli .starttime').html()) {
		return;
	}
//##nolibmodestart
    if (SONGTICKERLI.localHistory) {
	    // clone old data to history
	    SONGTICKERLI.update_history();
    }
//##nolibmodestop

	// load new data
    if (track.show) {
        if (track.showLink) {
            $(SONGTICKERLI.targets.show).html('<a href="'+track.showLink+'">'+track.show+'</a>');
        } else {
            $(SONGTICKERLI.targets.show).html(track.show);
        }
    }
	if (track.artist) {
        if (track.artistLink) {
            $(SONGTICKERLI.targets.show).html('<a href="'+track.artistLink+'">'+track.artist+'</a>');
        } else {
		    $(SONGTICKERLI.targets.artist).html(track.artist);
        }

        if (track.titleLink) {
		    $(SONGTICKERLI.targets.title).html('<a href="'+track.titleLink+'">'+track.title+'</a>');
        } else {
		    $(SONGTICKERLI.targets.title).html(track.title);
        }

    }
//##nolibmodestart
    if (SONGTICKERLI.enableArtistInfo) {
	    $('#songtickerli .scroller-info .songtickerli-enter-artistinfo').attr('href', 'javascript:SONGTICKERLI.add_artist(null);');
	    SONGTICKERLI.update_infodisplay(track);
    }
//##nolibmodestop

	$(SONGTICKERLI.targets.starttime).html(SONGTICKERLI.starttime);
};
//##nolibmodestart
SONGTICKERLI.update_history = function() {
	hist = $('#songtickerli .scroller-history');

	overlay = $('#songtickerli .overlay').clone();

	if (overlay.find('.artist').html() == '' || $(overlay).children('.artist').html() == 'songtickerli') {
		return;
	}

	if (hist.children('.history-data').length >= 5) {
		SONGTICKERLI.reduce_history();
	}

	overlay.removeClass().addClass('history-data').css('background', 'white').hide();
	info    = $('#songtickerli .scroller-info').clone();
	info.removeClass().addClass('history-info').appendTo(overlay).hide();
	overlay.mouseleave(function() {
		$(this).children('.history-info').slideUp();
	});
	overlay.click(function() {
		$(this).children('.history-info').slideDown();
	});

	hist.prepend(overlay);
	overlay.slideDown();
	$('#songtickerli .scroller-history .button').remove();
	$('#songtickerli .scroller-history .bleep').remove();
};
SONGTICKERLI.get_date = function(format) {
	d = new Date();
	if (typeof format == 'undefined') {
		date = d.getDate()+'.'+(d.getMonth()+1)+'.'+d.getFullYear()
	} else if (format == 'class') {
		date = d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()
	}
	return date;
};
SONGTICKERLI.reduce_history = function() {
	/* no stored stats for now since gui needs work, this is not dead 

	// check for todays history elm
	today = SONGTICKERLI.get_date();
	if (!$('#songtickerli .history-archive').children('.history-day').first()
	   ||$('#songtickerli .history-archive').children('.history-day').first().data('date') != today) {
		SONGTICKERLI.create_history_day();
	}
	// add last element to history elm and reinstate click and leave handlers
	elm = $('#songtickerli .scroller-history').children('.history-data').last().clone();
	elm.mouseleave(function() {
		SONGTICKERLI.scrollerLock = true;
		$(this).children('.history-info').slideUp();
	});
	elm.click(function() {
		$(this).children('.history-info').slideDown();
	});

	$('#songtickerli .history-archive .history-day').first().append(elm); 
	*/
	// @todo update hourly stats in history elm
	// remove original elm
	$('#songtickerli .scroller-history').children('.history-data').last().remove();
};
/**
 * create a new history archive for the day
 */
SONGTICKERLI.create_history_day = function() {
	daystring = SONGTICKERLI.get_date();
	// create new history day entry from scratch
	if (!$('#songtickerli .history-archive').children('history-day')) {
	  $('#songtickerli .history-archive .archive-navigation').insertAfter('<div class="history-day"><div class="scroller-div"><span class="songtickerli-date">'+daystring+'</span></div></div>');
	} else {
	  $('#songtickerli .history-archive').prepend('<div class="history-day"><div class="scroller-div"><span class="songtickerli-date">'+daystring+'</span></div></div>');
	}
	day = $('#songtickerli .history-archive .history-day').first()
	day.addClass('history-'+SONGTICKERLI.get_date('class'));
	day.data('date', daystring);
	// clone history link
	link = $('#songtickerli .history-navigation').children().first().clone();
	link.data('data-class', 'history-'+SONGTICKERLI.get_date('class'));
	link.click(function() {
		$('#songtickerli .scroller-history').children('history-data').slideUp();
		if ($('#songtickerli .history-archive').is(':hidden')) {
			$('#songtickerli .history-archive').slideDown();
			$('#songtickerli .'+$(this).data('data-class')).slideDown();
			$('#songtickerli .scroller-history').children('.history-data').delay(500).slideUp();
		} else {
			if ($('#songtickerli .'+$(this).data('data-class')).is(':hidden')) {
				$('#songtickerli .history-day').slideUp();
				$('#songtickerli .'+$(this).data('data-class')).slideDown();
			}
		}
	});
	link.show();
	$('#songtickerli .history-navigation').append(link);
};
SONGTICKERLI.update_infodisplay = function(track) {
	if (!track.artist) {
		return;
	}
	$('#songtickerli .scroller-info .songtickerli-enter-artistinfo').attr('href', 'javascript:SONGTICKERLI.add_artist("'+track.artist+'");');

	data = SONGTICKERLI.artist_info[track.artist.toLowerCase()];
	if (typeof data == 'undefined') {
		artist = track.artist;
	} else {
		artist = data.artist;
	}
	if (typeof data == 'undefined') {
		data = {};
	}
	$('#songtickerli .scroller-info .web-link').hide();
	if (data.web) {
		$('#songtickerli .scroller-info .web-link').attr('href', data.web).show();
	}
	$('#songtickerli .scroller-info .lastfm-link').hide();
	if (data.lastfm) {
		$('#songtickerli .scroller-info .lastfm-link').attr('href', data.lastfm).show();
	}
	$('#songtickerli .scroller-info .wikipedia-link').hide();
	if (data.wikipedia) {
		$('#songtickerli .scroller-info .wikipedia-link').attr('href', data.wikipedia).show();
	}
	$('#songtickerli .scroller-info .myspace-link').hide();
	if (data.myspace) {
		$('#songtickerli .scroller-info .myspace-link').attr('href', data.myspace).show();
	}
	$('#songtickerli .scroller-info .facebook-link').hide();
	if (data.facebook) {
		$('#songtickerli .scroller-info .facebook-link').attr('href', data.facebook).show();
	}
	$('#songtickerli .scroller-info .twitter-link').hide();
	if (data.twitter) {
		$('#songtickerli .scroller-info .twitter-link').attr('href', data.twitter).show();
	}
	$('#songtickerli .scroller-info .discogs-link').hide();
	if (data.discogs) {
		$('#songtickerli .scroller-info .discogs-link').attr('href', data.discogs).show();
	}
};
SONGTICKERLI.love_track = function(current) {
	if (!SONGTICKERLI.configured()) {
		SONGTICKERLI.notify('bitte konfiguriere songtickerli');
		SONGTICKERLI.show($('#songtickerli .scroller-conf'));
	}
	if (typeof SONGTICKERLI.showLoveDialog == 'undefined' || SONGTICKERLI.showLoveDialog == true) {
		SONGTICKERLI.show($('#songtickerli .scroller-love'));
	} else {
		SONGTICKERLI.observer_love(SONGTICKERLI.current_track());
	}
};
SONGTICKERLI.love_track_okcallback = function() {
	SONGTICKERLI.observer_love(SONGTICKERLI.current_track(), $('#songtickerli .love-message').val());
};
SONGTICKERLI.add_artist = function(artist) {
	if (artist) {
		SONGTICKERLI.modal('#artist/'+artist, true);
	} else {
		SONGTICKERLI.notify('Es können nur Tracks mit Artist erfasst werden, welcher dem Ticker bekannt sind.');
	}
};
SONGTICKERLI.show = function(choice) {
	if ($('#songtickerli .scroller').is(':hidden')) {
		$('#songtickerli .scrollersub').hide();
		choice.show();
		$('#songtickerli .scroller').slideDown();
	} else {
		if (choice.is(':hidden')) {
			$('#songtickerli .scrollersub').slideUp();
			choice.slideDown();
		}
	}
};
SONGTICKERLI.modal = function(path, msr) {
	if (typeof msr == 'undefined') {
		msr = false;
	}
	if (msr) {
		url = 'http://msr.songticker.li/'+path;
	} else {
		url = path+'.html';
	}

	if (msr) {
		$.modal('<div style="height: 100%;"><iframe id="add-artist" src="'+url+'" style="border:none;" width="100%" height="100%"></iframe></div>', {
			overlayClose: true,
			closeHTML: 'schliessen',
			zIndex: 3000,
			autoPosition: true,
			transient: false,
			onShow: function() {
				$('.simplemodal-wrap').css({overflow: 'none'});
			},
			onClose: function(dialog) {
				$.modal.close();
				$('#songtickerli').animate({
					marginLeft: 0
				}, 500);
			}
		});
	
	} else {
		$.ajax({
			url: url,
			success: function(data) {
				target = 0 - $('#songtickerli').position().left - ($('#songtickerli').width() / 2);
				$('#songtickerli').animate({
					marginLeft: target
				}, 500, function() {
					$.modal(data, {
						overlayClose: true,
						closeHTML: 'schliessen',
						zIndex: 3000,
						autoPosition: false,
						transient: false,
						onClose: function(dialog) {
							$.modal.close();
							$('#songtickerli').animate({
								marginLeft: 0
							}, 500);
						}
					});
				});
			}
		});
	}
};
SONGTICKERLI.notify = function(msg, type) {
	if (typeof type == 'undefined') {
		type = 'warn';
	}
	notif = $('<p>'+msg+'</p>').delay(SONGTICKERLI.notifydelay).fadeOut();
    if (typeof jQuery.jStore == 'undefined') {
        color = 'blau';
    } else {
        color = jQuery.jStore.get('color');
    }
	colorset = SONGTICKERLI.get_colorset(color);
	notif.css('color', colorset.color);
	notif.css('background-color', colorset.background);

	$('.notification-area').append(notif);
};
SONGTICKERLI.bleep = function() {
	bleeper = $('#songtickerli .bleep');
	if (SONGTICKERLI.delay = SONGTICKERLI.lowdelay) {
		bleepdivisor = SONGTICKERLI.delay / 1000;
		for (i = 0; i <= bleepdivisor; i++) {
			bleeper.delay(SONGTICKERLI.delay/4).fadeIn().delay(SONGTICKERLI.delay/4).fadeOut();
		}
	} else {
		bleeper.fadeOut();
	}
};
SONGTICKERLI.switch_color = function(color) {
	// save new default color
	jQuery.jStore.set('color', color);
	// switch cssA
	colorset = SONGTICKERLI.get_colorset(color);
	$('#songtickerli').css('color', colorset.color);
	$('.notification-area p').css('color', colorset.color);
	$('.notification-area p').css('background-color', colorset.background);
	$('#songtickerli .overlay').css('background-color', colorset.background);
	$('#songtickerli .scroller').css('background-color', colorset.background);
	$('.notification-area p').css('background-color', colorset.background);
	// switch logo
	$('#songtickerli').css('background', 'white url('+colorset.logo+') no-repeat 300px');
	if (colorset.color != 'gray') {
		showihelp = false;
		if (!SONGTICKERLI.configured() && SONGTICKERLI.firstcolor) {
			showihelp = true
		};
		SONGTICKERLI.firstcolor = false;
		SONGTICKERLI.set_configured();
		if (showihelp) {
			$('#initial-help').fadeIn();
			window.setTimeout(function() {
				$('#initial-help').fadeOut();
			}, 5000);
		}
	}
};
SONGTICKERLI.save_username = function(name) {
	jQuery.jStore.set('username', name);
	SONGTICKERLI.set_configured();
};
SONGTICKERLI.configured = function() {
	configured = false;
	try {
		configured = jQuery.jStore.get('configured') == 'yes';
	} catch(e) {
		configured = false;
	}
	return configured;
};
SONGTICKERLI.set_configured = function() {
	jQuery.jStore.set('configured', 'yes');
	$('#songtickerli .unconfigured').hide();
	$('#songtickerli .scroller-div').slideDown();
};
SONGTICKERLI.get_colorset = function(color) {
	if (color=='blau') {
		return {
			color: 'blue',
			background: 'rgba(200, 200, 255, 0.5)',
			logo: 'data:image/png;base64,png_token[[[logo_rabe_blau]]]'
		}
	} else if (color=='gruen') {
		return {
			color: 'green',
			background: 'rgba(200, 255, 200, 0.5)',
			logo: 'data:image/png;base64,png_token[[[logo_rabe_gruen_weiss]]]'
		}
	} else if (color=='orange') {
		return {
			color: 'orange',
			background: 'rgba(255, 255, 200, 0.5)',
			logo: 'data:image/png;base64,png_token[[[logo_rabe_orange_weiss]]]'
		}
	} else if (color=='rot') {
		return {
			color: 'red',
			background: 'rgba(255, 200, 200, 0.5)',
			logo: 'data:image/png;base64,png_token[[[logo_rabe_rot_weiss]]]'
		}
	} else {
		return {
			color: 'gray',
			background: 'rgba(255, 255, 255, 0.5)',
			logo: 'data:image/png;base64,png_token[[[logo_rabe_mono]]]'
		}
	}
};

if (typeof jQuery.jStore != 'undefined') {
    jQuery.extend(jQuery.jStore.defaults, {  
    	project: 'songtickerli',
    });
    jQuery.jStore.ready(function(engine){ 
	    jQuery.jStore.CurrentEngine.ready(function() {
		    SONGTICKERLI.storageReady = true;

		    if (!SONGTICKERLI.configured()) {
			    window.setTimeout(function() {
				    SONGTICKERLI.show($('#songtickerli .scroller-conf'));
			    }, 1600);
		    }

		    // init color stuff
		    color = jQuery.jStore.get('color');
		    SONGTICKERLI.switch_color(color);

		    // radio button
	    	$('#songtickerli input[value='+color+']:nth(0)').attr('checked','checked');

	    	// social networks
		    SONGTICKERLI.observer_jStoreReady();

		    // value_maps
		    for (var i = 0; i < SONGTICKERLI.configDataFields.length; i++) {
			    data = SONGTICKERLI.configDataFields[i];
			    $(data.field).val(jQuery.jStore.get(data.name));
		    }
    	});

    });
}
//##nolibmodestop
SONGTICKERLI.current_track = function() {
	return {
		artist:     SONGTICKERLI.artist,
		artistLink: SONGTICKERLI.artistLink,
		title:      SONGTICKERLI.title,
		titleLink:  SONGTICKERLI.titleLink,
        show:       SONGTICKERLI.show,
        showLink:   SONGTICKERLI.showLink,
		starttime:  SONGTICKERLI.starttime
	}
};
jQuery(document).ready(function() {
//##nolibmodestart
    if (SONGTICKERLI.enableConfig) {
    	$('#songtickerli').hover(function() {
    		SONGTICKERLI.configured() && $('#songtickerli .button').fadeIn();
    	}, function() {
    		$('#songtickerli .button').fadeOut();
    		ihelp = $('#initial-help');
    		SONGTICKERLI.configured() && ihelp.is(':hidden') && $('#songtickerli .scroller').slideUp();
    		ihelp.fadeOut();
    	});
    	$('#initial-help').click(function() {
		    $('#initial-help').fadeOut();
	    });
	    $('#songtickerli .conf').click(function() {
	    	SONGTICKERLI.show($('#songtickerli .scroller-conf'));
	    });
    	$('#songtickerli input[name=username]').blur(function() {
	    	SONGTICKERLI.save_username(this.value);
	    });
    }
    if (SONGTICKERLI.enableLoveFeature) {
	    $('#songtickerli .love').click(function() {
		    SONGTICKERLI.love_track(SONGTICKERLI.current_track());
	    });
	    $('#songtickerli button[name=post-love]').click(function() {
	    	SONGTICKERLI.love_track_okcallback();
	    });
    }
    if (SONGTICKERLI.enableTickerInfo) {
	    $('#songtickerli .info').click(function() {
		    SONGTICKERLI.show($('#songtickerli .scroller-info'));
	    });
    	$('#songtickerli .songtickerli-infodisplay').click(function() {
	    	SONGTICKERLI.modal('copyright');
	    });
    }
    if (SONGTICKERLI.localHistory) {
	    $('#songtickerli .history').click(function() {
		    if ($('#songtickerli .scroller-history').is(':hidden')) {
			    $('#songtickerli .history-archive').hide();
			    $('#songtickerli .history-data').show();
		    } else {
		    	$('#songtickerli .history-archive').slideUp();
		    	$('#songtickerli .history-data').slideDown();
		    }
		    SONGTICKERLI.show($('#songtickerli .scroller-history'));
	    });
    }
    if (SONGTICKERLI.enableLogosupport) {
	    $('#songtickerli input[name=color]').click(function() {
		    SONGTICKERLI.switch_color(this.value);
	    });
	    $('#songtickerli .colorpickerbox').click(function() {
		    SONGTICKERLI.switch_color($(this).children()[0].value);
		    $('#songtickerli .button').fadeIn(); // @todo refactor, needed for first time init 
	    });
    }
	$('#songtickerli .station-link').click(function() {
		window.open('http://www.rabe.ch');
	});

    // init facebook stuff if loaded
    if (typeof SONGTICKERLI_FB != 'undefined') {
	    $('#songtickerli p.facebook-btn').click(function() {
	    	SONGTICKERLI_FB.init();
	    });
	    $('#songtickerli .facebook-rabe-friend').click(function() {
		    SONGTICKERLI_FB.add_friend(null);
	    });
	    $('#songtickerli .facebook-friendbutton-'+SONGTICKERLI_FB.songtickerli_uid).click(function() {
		    SONGTICKERLI_FB.add_friend(SONGTICKERLI_FB.songtickerli_uid);
	    });
    }

    if (typeof SONGTICKERLI_FB != 'undefined') {
	    SONGTICKERLI.register_observer(SONGTICKERLI_FB);
    }
    if (typeof SONGTICKERLI_TWITTER != 'undefined') {
	    SONGTICKERLI.register_observer(SONGTICKERLI_TWITTER);
    }
    if (SONGTICKERLI.enableJstore) {
	    jQuery.jStore.load();
    }
//##nolibmodestop
	SONGTICKERLI.main();
});
