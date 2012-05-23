
/**
 * prototype for all things facebook
 */
var SONGTICKERLI_FB = function() {};
SONGTICKERLI_FB.apikey = '0b69cbfe795f13e8f415fee381e2d695';
SONGTICKERLI_FB.api = null;
/**
 * songtickerlis uid for becominig friend
 */
SONGTICKERLI_FB.songtickerli_uid = 287570953869;

SONGTICKERLI_FB.rabe_gid = 738409024;
/**
 * startup things
 */
SONGTICKERLI_FB.init = function() {
	SONGTICKERLI.debug && console.log('initializing fb');
	FB.init(SONGTICKERLI_FB.apikey, 'fb_xd_receiver.html');
	FB.ensureInit(function() {
		SONGTICKERLI_FB.initialized = true;
		$('#songtickerli .fb-unconfigured').hide();
		if (typeof SONGTICKERLI_FB.registered == 'undefined' || SONGTICKERLI_FB.registered != true) {
			SONGTICKERLI_FB.register();
		} else {
			FB.Connect.requireSession();
		}
		SONGTICKERLI_FB.api = FB.ApiClient(SONGTICKERLI_FB.apikey);
		me = FB.Connect.get_loggedInUser();
	});
};
/**
 * gets called when storage is ready
 */
SONGTICKERLI_FB.jStoreReady = function() {
	fb_perms = jQuery.jStore.get('facebook_perms');
	fb_url = jQuery.jStore.get('facebook_url');
	if (typeof fb_perms != 'undefined' && fb_perms != false && fb_perms != null) {
		SONGTICKERLI.debug && console.log('initializing fb db');
		$('#songtickerli .facebook-btn').hide();
		SONGTICKERLI_FB.registered = true;
		SONGTICKERLI_FB.init();
	} else {
		//$('#songtickerli .facebook-btn').hide();
		$('#songtickerli .facebook-btn').children('img').click(function() {
			SONGTICKERLI_FB.init();
		});
	}
};
/**
 * send a love message to facebook
 */
SONGTICKERLI_FB.love = function(track) {
	if (!SONGTICKERLI_FB.registered) {
		return 0;
	}
	if (track.artist && track.title) {
		FB.Connect.streamPublish('Auf http://rabe.ch läuft gerade ' + track.title + ' von ' + track.artist +'. Ein geiler Track!');
	} else {
		FB.Connect.streamPublish('Höre gerade Radio RaBe http://rabe.ch');
	}
	return 1;
};
/**
 * love button callback
 *
 * for when user wanted to add text to love message
 */
SONGTICKERLI_FB.post_callback = function() {
};
/**
 * facebook login call
 */
SONGTICKERLI_FB.register = function() {
	FB.Connect.requireSession(SONGTICKERLI_FB.register_callback_ok, SONGTICKERLI_FB.register_callback_cancel);
};
/**
 * get perms
 */
SONGTICKERLI_FB.register_callback_ok = function() {
	FB.Connect.showPermissionDialog('offline_access,publish_stream', SONGTICKERLI_FB.register_callback_perms);
};
/**
 * user abort
 */
SONGTICKERLI_FB.register_callback_cancel = function() {
	$('#songtickerli .facebook-btn').show();
};
/**
 * perms available
 *
 * user will have to set them in facebook ui after this
 */
SONGTICKERLI_FB.register_callback_perms = function(perms) {
	if (perms) {
		jQuery.jStore.set('facebook_perms', perms);
		jQuery.jStore.set('facebook_username', FB.Connect.get_loggedInUser());
		jQuery.jStore.set('facebook_url', 'http://www.facebook.com/'+FB.Connect.get_loggedInUser());
		$('#songtickerli .facebook-btn').hide();
		SONGTICKERLI_FB.registered = true;
	} else {
		$('#songtickerli .facebook-btn').show();
	}
};
SONGTICKERLI_FB.add_friend = function(friend) {
	FB.Connect.showAddFriendDialog(friend, function() {
		if (this.value) {
			// hide button
		}
	});
};


