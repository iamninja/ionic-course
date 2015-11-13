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
});
