function UserProfile(user, friendOf) {

	var self = this;
	self.uid = user.uid;
	self.first_name = user.first_name;
	self.last_name = user.last_name;
	self.photo = user.photo;
	self.relation = user.relation;

	self.friendOf = function() {
		return friendOf > 0 ? friendOf : 'mine';
	}

	self.friendOfUrl = function() {
		return friendOf > 0 ? 'http://vk.com/id' + friendOf : 'http://vk.com/';
	}

}

function Error(code, message) {
	var self = this;
	self.code = code;
	self.message = message;
}

function GirlFriendsViewModel() {

	var self = this;
	self.offset = 0;
	self.count = 0;
	self.friend_ids = [];
	self.friend_handler = 0;
	self.friends = ko.observableArray([

	]);

	self.relations = [{
		0: 'In love'
		// Will be soon
	}];

	self.errors = ko.observableArray([

	]);


	self.vkLogin = function() {
		VK.Auth.login(authInfo, 1026);
	};

	self.getMoreFriends = function() {
		VK.Api.call(
			'friends.get',
			{
				uid: self.friend_handler,
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
					// sex=1 - Female; sex=2 - Male
					if (val.sex == 1) {
						self.friend_ids.push(val.uid);
						self.friends.push(new UserProfile(val, self.friend_handler));
						if (self.friends().length == 189) {
							var a=1;
						}
						if ((self.friends().length % 50) == 0) {
							self.offset += parseInt(key);
							return
						}

					}

					// If it was last iteration we will make new request for friends recursively
					if (data.response.length == (last=parseInt(key)+1)) {
						self.friend_handler = self.friend_ids.shift();
						self.offset = 0;
						VK.Api.call(
							'friends.get',
							{
								uid: self.friend_handler,
								fields: 'sex, photo',
								count: self.count,
								offset: self.offset,
								order: 'name'
							},
							getUserProfileDataCallback
						)

					}
				}


			}
		}
		else {
			self.errors.push(new Error(data.error.error_code, data.error.error_msg));
		}
	}

	self.total_friends = function() {
		return self.friends().length;
	}

	self.total_friends_of = function() {
		return self.friends().length;
	}

}


