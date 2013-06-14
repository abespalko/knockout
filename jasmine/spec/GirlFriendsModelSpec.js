describe("GirlFriendsModel", function() {


	beforeEach(function() {
		GirlFriendsModel = new GirlFriendsViewModel;
		user = new UserProfile({uid: 10662779, first_name: 'Михаил', last_name: 'Филатов', photo: '', relation: 1});
	});

	it("Data model should be defined", function() {

		expect(GirlFriendsModel).toBeDefined();
		expect(GirlFriendsModel.count).toBeDefined();
		expect(GirlFriendsModel.friends).toBeDefined();
		expect(GirlFriendsModel.offset).toBeDefined();

	});

	it("User is object", function() {
		var user = new UserProfile({uid: 10662779, first_name: 'Михаил', last_name: 'Филатов', photo: '', relation: 1});
		expect(user).toEqual(jasmine.any(Object));

	});

	it("ViewModel has data", function() {
		GirlFriendsModel.friends.push(user);

		expect(GirlFriendsModel.friends().length).toBeGreaterThan(0);
		expect(GirlFriendsModel.total_friends()).toBeGreaterThan(0);
		expect(GirlFriendsModel.total_friends_of()).toBeGreaterThan(0);
	});




	xdescribe("when song has been paused", function() {
		beforeEach(function() {
			player.play(song);
			player.pause();
		});

		it("should indicate that the song is currently paused", function() {
			expect(player.isPlaying).toBeFalsy();

			// demonstrates use of 'not' with a custom matcher
			expect(player).not.toBePlaying(song);
		});

		it("should be possible to resume", function() {
			player.resume();
			expect(player.isPlaying).toBeTruthy();
			expect(player.currentlyPlayingSong).toEqual(song);
		});
	});

	// demonstrates use of spies to intercept and test method calls
	xit("tells the current song if the user has made it a favorite", function() {
		spyOn(song, 'persistFavoriteStatus');

		player.play(song);
		player.makeFavorite();

		expect(song.persistFavoriteStatus).toHaveBeenCalledWith(true);
	});

});