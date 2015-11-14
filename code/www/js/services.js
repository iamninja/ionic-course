angular.module('songhop.services', [])
.factory('User', function(){
	var o = {
		favorites: []
	}

	o.addSongToFavorites = function (song) {
		// Make sure there is a song to add
		if (!song) return false;

		// Add song to favorites array
		o.favorites.unshift(song);
	}

	o.removeSongFromFavorites = function (song, index) {
		o.favorites.splice(index, 1);
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
