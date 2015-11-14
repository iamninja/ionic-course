angular.module('songhop.controllers', ['ionic', 'songhop.services'])


/*
Controller for the discover page
*/
.controller('DiscoverCtrl', function($scope, $timeout, $ionicLoading, User, Recommendations) {

	// Show loading
	var showLoading = function() {
		$ionicLoading.show({
			template: '<i class="ion-loading-c"></i>',
			noBackdrop: true
		});
	}
	var hideLoading = function() {
		$ionicLoading.hide();
	}
	showLoading();

	// Get the first reccomended songs
	Recommendations.init()
		.then(function() {
			$scope.currentSong = Recommendations.queue[0];
			Recommendations.playCurrentSong();
		})
		.then(function() {
			// turn loading off
			hideLoading();
			$scope.currentSong.loaded = true;
		})

	// Executed when we skip/fav a song
	$scope.sendFeedback = function (bool) {
		// Set variables for the correct animation sequence
		$scope.currentSong.rated = bool;
		$scope.currentSong.hide = true;

		// Add to favorites if it is favorited
		if (bool) {
			User.addSongToFavorites($scope.currentSong);
		};

		// Get next song
		Recommendations.nextSong();

		// Set the current song to one of the songs in array
		// timeout to allow animation to complete before change to next song
		$timeout(function () {
			$scope.currentSong = Recommendations.queue[0];
			$scope.currentSong.loaded = false;
		}, 250);
		Recommendations.playCurrentSong()
			.then(function() {
				$scope.currentSong.loaded = true;
			});
	}

	// Use it to retitrieve the next album image in order to cache it
	$scope.nextAlbumImg = function() {
		if (Recommendations.queue.length > 1) {
			return Recommendations.queue[1].image_large;
		}

		return false;
	}
})


/*
Controller for the favorites page
*/
.controller('FavoritesCtrl', function($scope, User) {
	// get the list of favorites from User service
	$scope.favorites = User.favorites;

	$scope.removeSong = function(song, index) {
		User.removeSongFromFavorites(song, index)
	}
})


/*
Controller for our tab bar
*/
.controller('TabsCtrl', function($scope, Recommendations) {
	// Stop playback when entering favorites
	$scope.enteringFavorites = function() {
		Recommendations.haltSong();
	}

	$scope.leavingFavorites = function() {
		Recommendations.init();
	}
});