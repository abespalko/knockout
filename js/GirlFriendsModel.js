ko.observableArray.fn.binarySearch = function(find, field, comparator) {
	var
		low = 0,
		high = this().length - 1,
		i,
		comparison;
    var collection = ko.utils.unwrapObservable(this);
	if (collection.length == 0) high = 0;

	while (low <= high) {
		i = Math.floor((low + high) / 2);
		comparison = comparator(collection[i], collection[i+1], field, find[field]);

		// If the fields are equal check if the second parameter of object (F.x. id, uid, user_id... ) are equal too
		if (comparison == 2) {
			if (find.user_id == collection[i].user_id ||
				(typeof collection[i+1] !== 'undefined' && find.user_id == collection[i+1].user_id)) {

				return null;
			}
			return i+1;
		}
		if (comparison > 0 && high <= 0) return i;
		if (comparison < 0) { low = i + 1; continue; };
		if (comparison > 0) { high = i - 1; continue; };

        return i+1;
	}
	return null;
};

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
	self.errors = ko.observableArray([]);
	self.friends = ko.observableArray([]);
	self.cachedGirls = [];

	self.relations = ko.observableArray([
		{ status: 0, relation: "не указан" },
		{ status: 1, relation: "не замужем" },
		{ status: 2, relation: "есть друг" },
		{ status: 3, relation: "помолвлена" },
		{ status: 4, relation: "замужем" },
		{ status: 5, relation: "всё сложно" },
		{ status: 6, relation: "в активном поиске" },
		{ status: 7, relation: "влюблена" }
	]);

	self.relationSearch = ko.observable();

	self.filteredFriends = ko.computed(function() {
		return ko.utils.arrayFilter(self.friends(), function(item) {
			var a =  self.relations()[item.relation];
			if (typeof self.relationSearch() != 'undefined') {
				return self.relationSearch().length == 0 || item.relation == self.relationSearch();
			}
			return true;

		})
	});

	self.relationText = function(status) {
		for (var key in self.relations()) {
			if (self.relations()[key].status == status) {
				return self.relations()[key].relation;
			}
		}
	};

   	self.getMoreFriends = function() {
	    getMoreFriends();
	};

	function displayPage(items) {
		var i, j;
		for (i = 0;  i < items; i++) {
			var friend = self.cachedGirls.shift();
			var position = self.friends.binarySearch(friend, 'followers_count', binarySearchCallback);

			if (position != null) {
				self.friends.splice(position, 0, friend);
			}
			else {
				console.log(friend.uid + ' = ' + friend.last_name);
			}
		}
	}

	var getFriendsClosure = function() {
		var offset = 0;

		return function getFriendsFromVK() {
			if (self.cachedGirls.length < 50) {
				VK.Api.call(
					'friends.get',
					{
						uid     : self.friendPointer,
						fields  : 'sex, photo, followers_count, relation',
						count   : self.count,
						offset  : 0,
						order   : 'name'
					},
					function(data) {
						getUserProfileDataCallback(data);
						displayPage(50);
					})
			}
			else {
				displayPage(50);
			}


		}

	};

	var getMoreFriends = getFriendsClosure(0);

	function getUserProfileDataCallback(data) {

		if (data.error) {
			self.errors.push(data.error);
			offset = 0;
			return offset;
		}

		if (data.response && data.response.length > 0) {

			for (var key in data.response) {
				key = parseInt(key);
				var friend = data.response[key];

				if (typeof friend.deactivated !== 'undefined' && (friend.deactivated == 'banned' || friend.deactivated == 'deleted'))
					continue;

				if (friend.sex == 1) {
					self.cachedGirls.push(friend);
					self.friendIds.push(friend.uid);

					// If we have pulled another 50 friends
					/*if ((self.friends().length % 50) == 0) {
						self.offset += key+1;
						offset += key+1;
						return offset;
					}*/
				}

				// If it was last iteration we will make new request for friends recursively
				if (data.response.length == (last=key+1)) {

					self.friendPointer = self.friendIds.shift();
					//var getMoreFriends = getFriendsClosure(offset);
					//getMoreFriends();
					return;
				}
			}
		}
		else {
			self.friendPointer = self.friendIds.shift();
			offset = 0;
			return offset;
		}

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

}

function VKViewModel() {

	var self = this;
	var baseURL = window.location.protocol + '//' + window.location.hostname + window.location.pathname;

    self.currentUser = ko.observable();

    self.init = ko.computed(function () {

		VK.init({
			apiId: 3709148
		});

		function authInfo(response) {
			if (response.session) {
                self.currentUser(response.session.mid);
			} else {
				alert('not auth');
			}
		}
		VK.Auth.getLoginStatus(authInfo);
		VK.UI.button('login_button');

	});

	self.doLogin = function() {
		VK.Auth.login(function(response) {
			self.currentUser(response.session.user.id);
        }, VK.access.FRIENDS);
	};

	self.doLogout = function() {
		VK.Auth.logout(function(response) {
			window.location = baseURL;
			//self.currentUser(null);
		});
	};


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
ko.bindingHandlers.stopBinding = {
	init: function() {
		return { controlsDescendantBindings: true };
	}
};

$(document).ready(function () {

	ko.applyBindings(new GirlFriendsViewModel(), document.html);
	ko.applyBindings(new VKViewModel(), document.getElementById('openapi_block'));

});



$(window).scroll(function () {

	var el = document.getElementById('show_more');
	var pos = el.offsetTop;
	if (parseInt($(window).scrollTop()) + 1200 >=  pos) {
		$('button.more-friends').trigger('click');
		$('#show_more_progress').show();
	}

});
