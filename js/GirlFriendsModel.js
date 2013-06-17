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

		// If the fields are equal check if second parameter of object (F.x. id, uid, user_id... ) are equal too
		if (comparison == 2) {
			var a = collection[i].user_id;
			if (find.user_id == collection[i].user_id || (typeof collection[i+1] !== 'undefined' && find.user_id == collection[i+1].user_id)) {
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
		relation: ""
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

					var position = self.friends.binarySearch(val, 'followers_count', binarySearchCallback);

					if (position != null) {
						self.friends.splice(position, 0, val);
					}

					// We have pulled another 50 friends so lets sort them and exit
					if ((self.friends().length % 50) == 0) {

						self.offset += key+1;
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

    self.currentUserId = ko.observable();

    self.init = ko.computed(function () {

		VK.init({
			apiId: 3709148
		});

		function authInfo(response) {
			if (response.session) {
                self.currentUserId(response.session.mid);
			} else {
				alert('not auth');
			}
		}
		VK.Auth.getLoginStatus(authInfo);
		VK.UI.button('login_button');

	});

	self.doLogin = function() {
		VK.Auth.login(function(response) {
            window.location = baseURL;
        }, VK.access.FRIENDS);
	};

	self.doLogout = function() {
		VK.Auth.logout(function(response) {
			window.location = baseURL;
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

ko.applyBindings(new GirlFriendsViewModel(), document.getElementById('wrapper'));
ko.applyBindings(new VKViewModel(), document.getElementById('openapi_header'));




$(window).scroll(function () {

	var el = document.getElementById('show_more');
	var pos = el.offsetTop;
	if (parseInt($(window).scrollTop()) + 1200 >=  pos) {
		$('button.more-friends').trigger('click');
	}

});
