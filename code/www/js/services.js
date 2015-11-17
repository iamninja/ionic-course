angular.module('songhop.services', ['ionic.utils'])
.factory('User', function($http, $q, $localstorage, SERVER){
	var o = {
		username: false,
		session_id: false,
		favorites: [],
		newFavorites: 0
	}

	o.auth = function (username, signingUp) {
		var authRoute;

		if (signingUp) {
			authRoute = 'signup';
		} else {
			authRoute = 'login';
		}

		return $http.post(SERVER.url + '/' + authRoute, {username: username})
			.success(function(data) {
				o.setSession(data.username, data.session_id, data.favorites);
			});
	}

	o.setSession = function(username, session_id, favorites) {
		if (username) { o.username = username; }
		if (session_id) { o.session_id = session_id; }
		if (favorites) { o.favorites = favorites; }

		// set data in localstorage
		$localstorage.setObject('user', {
			username: username,
			session_id: session_id,
			favorites: favorites
		});
	}

	o.checkSession = function() {
		var defer = $q.defer();

		if (o.session_id) {
			defer.resolve(true);
		} else {
			var user = $localstorage.getObject('user');

			if (user.username) {
				o.setSession(user.username, user.session_id);
				o.populateFavorites().then(function() {
					defer.resolve(true);
				});
			} else {
				// no user in localstorage
				defer.resolve(false);
			}
		}

		return defer.promise;
	}

	o.destroySession = function() {
		$localstorage.setObject('user', {});
		o.username = false;
		o.session_id = false;
		o.favorites = [];
		o.newFavorites = 0;
	}

	o.addSongToFavorites = function (song) {
		// Make sure there is a song to add
		if (!song) return false;

		// Add song to favorites array
		o.favorites.unshift(song);

		// increment newFavorites
		o.newFavorites++;

		// add it also on server
		return $http.post(SERVER.url + '/favorites', {session_id: o.session_id, song_id: song.song_id});
	}

	o.removeSongFromFavorites = function (song, index) {
		if (!song) return false;
		o.favorites.splice(index, 1);

		// remove from server too
		return $http({
			method: 'DELETE',
			url: SERVER.url + '/favorites',
			params: { session_id: o.session_id, song_id: song.song_id }
		});
	}

	o.favoriteCount = function() {
		return o.newFavorites;
	}

	o.populateFavorites = function() {
		return $http({
			method: 'GET',
			url: SERVER.url + '/favorites',
			params: { session_id: o.session_id }
		}).success(function(data) {
			o.favorites = data;
		});
	}

	return o;
})
.factory('Recommendations', function($http, SERVER, $q){
	var media;
	var o = {
		queue: []
	};

	o.getNextSongs = function() {
		return $http({
			method: 'GET',
			url: SERVER.url + '/recommendations'
		}).success(function(data) {
			o.queue = o.queue.concat(data);
		});
	}

	o.nextSong = function() {
		// pop the index 0 off
		o.queue.shift();

		// end song playing
		o.haltSong();

		// if queue<=3 fill it
		if (o.queue.length <= 3) {
			o.getNextSongs();
		}
	}

	o.playCurrentSong = function() {
		var defer = $q.defer();

		// Play the current song's preview
		media = new Audio(o.queue[0].preview_url);

		// when song loaded resolve the promise to let controller know
		media.addEventListener('loadeddata', function() {
			defer.resolve();
		});

		media.play();

		return defer.promise;
	}

	o.haltSong = function() {
		if (media) {
			media.pause();
		}
	}

	o.init = function() {
		if (o.queue.length === 0) {
			return o.getNextSongs();
		} else {
			return o.playCurrentSong();
		}
	}

	return o;
});
