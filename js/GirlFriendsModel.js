ko.observableArray.fn.binarySearch = function(find, field, comparator) {
	var
		low = 0,
		high = this().length - 1,
		i,
		comparison;
    var users = ko.utils.unwrapObservable(this);
	if (users.length == 0) high = 0;

    //var users = this.unique();

	while (low <= high) {
		i = Math.floor((low + high) / 2);
		comparison = comparator(users[i], users[i+1], field, find);

		if (comparison == 2) return i+1;
		if (comparison > 0 && high <= 0) return i;
		if (comparison < 0) { low = i + 1; continue; };
		if (comparison > 0) { high = i - 1; continue; };

        return i+1;
	}
	return null;
};

ko.observableArray.fn.unique = function() {
    var self = ko.utils.unwrapObservable(this);
    var o = {}, i, l = self.length, r = [];
    for(i=0; i<l;i+=1) {
        o[self[i]['uid']] = self[i];
    }
    for(i in o) {
        r.push(o[i]);
    }
    return r;
};
/*ko.observableArray.fn.distinct = function(prop) {
	var target = this;
	target.index = {};
	target.index[prop] = ko.observable({});

	ko.computed(function() {
		//rebuild index
		var propIndex = {};

		ko.utils.arrayForEach(target(), function(item) {
			var key = ko.utils.unwrapObservable(item[prop]);
			if (key) {
				propIndex[key] = propIndex[key] || [];
				propIndex[key].push(item);
			}
		});

		target.index[prop](propIndex);
	});

	return target;
};*/
/*
Array.prototype.unique = function() {
	var o = {},
		i,
		l = this.length,
		r = [];
	for(i=0; i<l;i+=1)
		o[this[i]] = this[i];
		for(i in o)
			r.push(o[i]);
	return r;

	var new_array = [];
	new_array[0] = this[0];
	for (var i=0; i<this.length; ++i) {
		var current = this[i];
		var add_flag = 1;
		for (j=0; j<new_array.length; ++j) {
			var tmp = new_array[j];
			if (current['uid'] == tmp['uid']) {
				add_flag = 0;
				break;
			}
		}
		if (add_flag) {
			new_array.push(current);
		}
	}
	return new_array;
};
*/


function UserProfile(user, friendOf) {

	var self = this;
	self.uid = user.uid;
	self.first_name = user.first_name;
	self.last_name = user.last_name;
	self.photo = user.photo;
	self.followers = user.followers_count;
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
	self.friendIds = [];
	self.friendPointer = 0;
	//self.isUserLogged = ko.observable();
	self.errors = ko.observableArray([]);

	self.friends = ko.observableArray([]);



	self.relations = [{
		relation: "Standard (sandwich)"
	}];

	self.total_friends = function() {
		return self.friends().length;
	}

   	self.getMoreFriends = function() {

        VK.Api.call(
			'friends.get',
			{
				uid: self.friendPointer,
				fields: 'sex, photo, followers_count',
				count: self.count,
				offset: self.offset,
				order: 'name'
			},
			getUserProfileDataCallback
		)

	};

	function getUserProfileDataCallback(data) {

		if (data.error) {
			self.errors.push(data.error);
			return
		}

		if (data.response && data.response.length > 0) {

			for (var key in data.response) {
				key = parseInt(key);
				var val = data.response[key];

				if (val.deactivated !== undefined && (val.deactivated == 'banned' || val.deactivated == 'deleted')) continue;

				if (val.sex == 1) {

					self.friendIds.push(val.uid);

					var position = self.friends.binarySearch(val.followers_count, 'followers_count', binarySearchCallback);

					if (position != null) {
						self.friends.splice(position, 0, val);
					}

					// We have pulled another 50 friends so lets sort them and exit
					if ((self.friends().length % 50) == 0) {

						self.offset += key;
						return
					}
				}

				// If it was last iteration we will make new request for friends recursively
				if (data.response.length == (last=key+1)) {

					self.friendPointer = self.friendIds.shift();
					self.offset = 0;
					self.getMoreFriends();

				}
			}

		}
		else {
			self.friendPointer = self.friendIds.shift();
			self.offset = 0;
		}
	}

	self.total_friends_of = function() {
		return self.friends().length;
	}

	self.totalDirectFriends = ko.computed(function() {
		return 0;
		var total = 0;
		for (var i = 0; i < self.friends().length; i++) {
			if (self.friends()[i].friendOf() == 'mine') {
				total++;
			}
		}
		return total;
	});

	/*self.isUserLogged = ko.computed(function() {
		var isLogged = VK.Auth.getLoginStatus(function(response) {
			if (response.status == 'connected') {
				return self.isUserLogged(response.session);
			}
			else {
				return false;
			}
		});
		return isLogged;
	}, self);*/
}

function VKViewModel() {

	var self = this;
	var baseURL = window.location.protocol + '//' + window.location.hostname + window.location.pathname;

	self.init = ko.computed(function () {
		VK.init({
			apiId: 3709148
		});

		function authInfo(response) {
			if (response.session) {

			} else {
				alert('not auth');
			}
		}
		VK.Auth.getLoginStatus(authInfo);
		VK.UI.button('login_button');
	});

	self.doLogin = function() {
		VK.Auth.login(null, VK.access.FRIENDS);
	};

	self.doLogout = function() {
		VK.Auth.logout(function(response) {
			window.location = baseURL;
		});
	};

}

ko.applyBindings(new GirlFriendsViewModel(), document.getElementById('wrapper'));
ko.applyBindings(new VKViewModel(), document.getElementById('openapi_header'));




$(window).scroll(function () {

	var m = [1,566,56448,231,84,231,84,31,32,1,842];
	var m2 = [];
	var id = 10;
	var m2 = m2.sort(function(x, y) {
		return ((x > y) ? -1 : ((x < y) ? 1 : 0));
	});

	for (var i=0; i<m.length; ++i) {
		var id = m[i];
		var position = m2.binarySearch(id, binarySearchCallback);

		if (position != null) {
			m2.splice(position, 0, id);
		}
	}

	var el = document.getElementById('show_more');
	var pos = el.offsetTop;
	if (parseInt($(window).scrollTop()) + 1200 >=  pos) {
		$('button.more-friends').trigger('click');
	}

})

function binarySearchCallback(x, y, field, value) {
	if (typeof x == 'undefined' || typeof x[field] == 'undefined') {
		x = { };
		x[field] = 0;
	}
	if (typeof y == 'undefined' || typeof y[field] == 'undefined') {
		y = { };
		y[field] = 0;
	}

	if (x[field] == value || y[field] == value) {
		return 2;
	}

	return ((x[field] > value) ? ((value > y[field]) ? 0 : -1) : 1);
};