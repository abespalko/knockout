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
					if (val.sex == 1) {
						self.friend_ids.push(val.uid);
						self.friends.push(new UserProfile(val, self.friend_handler));
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
			else {
				self.friend_handler = self.friend_ids.shift();
				self.offset = 0;
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

	self.totalDirectFriends = ko.computed(function() {
		var total = 0;
		for (var i = 0; i < self.friends().length; i++) {
			if (self.friends()[i].friendOf() == 'mine') {
				total++;
			}
		}
		return total;
	});


	/*function getFriendsOfFriends(data) {
		self.requests += 1;
		if (data.response && data.response.length > 0) {
			for (var key in data.response) {
				var val = data.response[key];
				if (val.sex == 1) {
					self.friend_ids.push(val.uid);
				}
			}
		}
	}*/

}

/*var ScrolledModel = {
	items: ko.observableArray([]),
	scrolled: function(data, event) {
		var elem = event.target;
		if (elem.scrollTop > (elem.scrollHeight - elem.offsetHeight - 200)) {
			getItems(20);
		}
	},
	maxId: 0,
	pendingRequest: ko.observable(false)
};*/

ko.applyBindings(new GirlFriendsViewModel());

$(window).scroll(function () {
	var doc = $(document).height();
	var win  = $(window).height();
	var diff = $(document).height() - $(window).height();

	var el = document.getElementById('show_more');
	var pos = el.offsetTop;
	var cur_pos = $(window).scrollTop();
	if (parseInt($(window).scrollTop()) + 1200 >=  pos) {
		$('button.more-friends').trigger('click');
	}
})

