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
	self.errors = ko.observableArray([

	]);

	self.friends = ko.observableArray([

	]);

	self.relations = [{
		relation: "Standard (sandwich)", price: 0
	}];

	self.vkLogin = function() {
		VK.Auth.login(authInfo, 1026);
	};

	self.getMoreFriends = function() {
		VK.Api.call(
			'friends.get',
			{
				fields: 'sex, photo',
				count: self.count,
				offset: self.offset,
				order: 'name'
			},
			getUserProfileDataCallback
		)
	};


	function getUserProfileDataCallback(data) {
		if (!data.error) {
			if (data.response && data.response.length > 0) {

				for (var key in data.response) {
					var val = data.response[key];
					if (val.sex == 1) {
						self.friend_ids.push(val.uid);
						/*VK.Api.call(
							'friends.get',
							{
								uid: val.uid,
								fields: 'sex',
								order: 'name'
							},
							getFriendsOfFriends
						)*/
						self.friends.push(new UserProfile(val));
						if ((self.friends().length % 20) == 0) {
							self.offset += parseInt(key);
							return
						}
					}
				}


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



