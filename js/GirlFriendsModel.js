function UserProfile(user) {
	var self = this;
	self.uid = user.uid;
	self.first_name = user.first_name;
	self.last_name = user.last_name;
	self.photo = user.photo;
	self.relation = user.relation;
}

function Error(code, message) {
	var self = this;
	self.code = code;
	self.message = message;
}

function GirlFriendsViewModel() {
	// Data
	var self = this;
	self.offset = 0;
	self.count = 0;
	self.friend_ids = [];
	self.requests = 0;
	self.errors = ko.observableArray([]);

	self.relations = [
		{ relation: "Standard (sandwich)", price: 0 }
	];

	self.vkLogin = function() {
		/*FB.login(function(response) {
			if (response.authResponse) {
				console.log('Welcome!  Fetching your information.... ');
				FB.api('/me', function(response) {
				    console.log('Good to see you, ' + response.name + '.');
				});
			} else {
				console.log('User cancelled login or did not fully authorize.');
			}
		});*/
	};

	self.getMoreFriends = function() {
		
		/*FB.api('/me/friends', {fields: 'id'}, function(response) {
			if (!response || response.error) {
				alert('Error occured');
			} else {*/
		FB.api('/me', function(response) {
			console.log("Welcome " + response.name);

				/*var uids = [];
				ko.utils.arrayForEach(response.data, function(idx2,val2) {
					uids.push(idx2.id);
				});
				uids = uids.join();*/
				FB.api(
					{
						method: 'fql.query',
						/*query: '' +
							'SELECT uid, name, work_history  ' +
							'FROM user WHERE uid IN (' +
								'SELECT uid2 ' +
								'FROM friend ' +
								'WHERE uid1 IN (' +
									'SELECT uid ' +
									'FROM user ' +
									'WHERE uid IN (' +
										'SELECT uid2 ' +
										'FROM friend ' +
										'WHERE uid1 = ' + response.id + ' )))'*/
						query: '' +
							'SELECT uid2 ' +
							'FROM friend WHERE uid1 = 1490938150'

					},
					function(data) {
						var a = 1;
					}
				);
		});
	};

	self.friends = ko.observableArray([

	]);

	function getUserProfileDataCallback(data) {
		if (!data.error) {
			if (data.response && data.response.length > 0) {

				for (var key in data.response) {
					var val = data.response[key];
					if (val.sex == 1) {
						self.friend_ids.push(val.uid);
						VK.Api.call(
							'friends.get',
							{
								uid: val.uid,
								fields: 'sex',
								order: 'name'
							},
							getFriendsOfFriends
						)
						//self.friends.push(new UserProfile(val));
					}
				}
				self.offset += data.response.length;

			}
		}
		else {
			self.errors.push(new Error(data.error.error_code, data.error.error_msg));
		}
		//var friends = document.getElementById('friends');
		//friends.innerHTML = 'Total friends: ' + $friendsId.response.length + '<br />';

	}

	function getFriendsOfFriends(data) {
		self.requests += 1;
		if (data.response && data.response.length > 0) {
			for (var key in data.response) {
				var val = data.response[key];
				if (val.sex == 1) {
					self.friend_ids.push(val.uid);
				}
			}
		}
	}

	self.total_friends = function() {
		return self.friends().length;
	}


}

ko.applyBindings(new GirlFriendsViewModel());



