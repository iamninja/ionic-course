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
.factory('Recommendations', function($http, SERVER){
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

		// if queue<=3 fill it
		if (o.queue.length <= 3) {
			o.getNextSongs();
		}
	}

	return o;
});
