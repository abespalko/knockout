describe("girlFriendsModel", function() {


	beforeEach(function() {
		girlFriendsModel = new GirlFriendsViewModel;
		user = {
			uid: 10662779,
			first_name  : 'Михаил',
			last_name   : 'Филатов',
			sex         : 2,
			photo       : '',
			relation    : 1
		};
		girlFriendsModel.friends.push(user);
	});

	it("girlFriendsModel should be defined", function() {

		expect(girlFriendsModel).toBeDefined();

		expect(girlFriendsModel.friends).toBeDefined();
		expect(girlFriendsModel.relationSearch).toBeDefined();
		expect(girlFriendsModel.cachedGirls).toBeDefined();
		expect(girlFriendsModel.errors).toBeDefined();
		expect(girlFriendsModel.friendPointer).toBeDefined();
		expect(girlFriendsModel.friendIds).toBeDefined();
		expect(girlFriendsModel.relations).toBeDefined();
		expect(girlFriendsModel.filteredFriends).toBeDefined();
		expect(girlFriendsModel.relationText).toBeDefined();

	});

	it("User is object", function() {
		expect(user).toEqual(jasmine.any(Object));
		expect(girlFriendsModel.friends()[0]).toEqual(jasmine.any(Object));
	});

	it("girlFriendsModel has data", function() {
		expect(girlFriendsModel.friends().length).toBeGreaterThan(0);
		expect(girlFriendsModel.friends()[0]).toBeDefined();
	});

	it("girlFriendsModel has correct user`s relations", function() {

		var userRelation = girlFriendsModel.friends()[0].relation;
		var sex = girlFriendsModel.friends()[0].sex;

		expect(userRelation).toBeDefined();
		expect(sex).toBeDefined();

		expect(girlFriendsModel.relationText(userRelation, sex)).toContain('не женат');
		expect(girlFriendsModel.relationText(2, 1)).toContain('есть друг');
		expect(girlFriendsModel.relationText(3, 1)).toContain('помолвлена');
		expect(girlFriendsModel.relationText(4, 1)).toContain('замужем');
		expect(girlFriendsModel.relationText(5, 1)).toContain('всё сложно');
		expect(girlFriendsModel.relationText(6, 2)).toContain('в активном поиске');
		expect(girlFriendsModel.relationText(7, 1)).toContain('влюблена');

	});

	it("girlFriendsModel filter should work correct", function() {


		girlFriendsModel.relationSearch(0);
		expect(girlFriendsModel.filteredFriends().length).not.toBeGreaterThan(0);

		girlFriendsModel.relationSearch(1);
		expect(girlFriendsModel.filteredFriends().length).toBeGreaterThan(0);

		girlFriendsModel.relationSearch(2);
		expect(girlFriendsModel.filteredFriends().length).not.toBeGreaterThan(0);

	});

	it("girlFriendsModel shouldn`t contain errors ", function() {

		expect(girlFriendsModel.errors().length).not.toBeGreaterThan(0);

	});



	// demonstrates use of spies to intercept and test method calls
	xit("tells the current song if the user has made it a favorite", function() {
		spyOn(song, 'persistFavoriteStatus');

		player.play(song);
		player.makeFavorite();

		expect(song.persistFavoriteStatus).toHaveBeenCalledWith(true);
	});

});