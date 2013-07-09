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

			var j = i + 1;
			while (typeof collection[j] != 'undefined' && collection[j][field] == find[field]) {

				if (find.user_id == collection[j].user_id) {
					return null;
				}
				j++;

			}

			j = i;
			while (typeof collection[j] != 'undefined' && collection[j][field] == find[field]) {

				if (find.user_id == collection[j].user_id) {
					return null;
				}
				j--;

			}

			return i+1;
		}
		if (comparison > 0 && high <= 0) {  return i; }
		if (comparison < 0) { low = i + 1;  continue; }
		if (comparison > 0) { high = i - 1; continue; }

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
}


function Error(code, message) {
	var self = this;
	self.code = code;
	self.message = message;
}

function GirlFriendsViewModel() {

	var self = this;

	self.friendIds = [];
	self.friendPointer = 0;
	self.errors = ko.observableArray([]);
	self.friends = ko.observableArray([]);
	self.cachedGirls = [];

	self.relations = ko.observableArray([
		{ status: 0, sex: 0, relation: "не указан" },
		{ status: 1, sex: 1, relation: "не замужем" },
		{ status: 1, sex: 2, relation: "не женат" },
		{ status: 2, sex: 2, relation: "есть подруга" },
		{ status: 2, sex: 1, relation: "есть друг" },
		{ status: 3, sex: 1, relation: "помолвлена" },
		{ status: 3, sex: 2, relation: "помолвлен" },
		{ status: 4, sex: 1, relation: "замужем" },
		{ status: 4, sex: 2, relation: "женат" },
		{ status: 5, sex: 0, relation: "всё сложно" },
		{ status: 6, sex: 0, relation: "в активном поиске" },
		{ status: 7, sex: 1, relation: "влюблена" },
		{ status: 7, sex: 2,  relation: "влюблен" }
	]);

	self.relationSearch = ko.observable();

	self.filteredFriends = ko.computed(function() {
		return ko.utils.arrayFilter(self.friends(), function(item) {
			if (typeof self.relationSearch() != 'undefined') {
				return self.relationSearch().length == 0 || item.relation == self.relationSearch();
			}
			return true;
		})
	});

	self.relationText = function(status, sex) {
		for (var key in self.relations()) {
			if (self.relations()[key].status == status && (self.relations()[key].sex == sex || self.relations()[key].sex == 0)) {
				return self.relations()[key].relation;
			}
		}
	};

	self.getMoreFriends = function() {
		getMoreFriends(0);
	};

	var getFriendsByPage = function(itemsPerPage) {

		return function(offset) {

			if (self.cachedGirls.length <= itemsPerPage) {
				VK.Api.call(
					'friends.get',
					{
						uid     : self.friendPointer,
						fields  : 'sex, photo, followers_count, relation',
						order   : 'name'
					},
					function(data) {
						if (!data.error) {
							getUserProfileDataCallback(data);
							offset = displayPage(itemsPerPage, offset);

							if (offset < itemsPerPage) {
								getMoreFriends(offset);
							}
						}
						else {
							self.errors.push(data.error);
							return false;
						}
					}
				)
			}
			else {
				offset = displayPage(itemsPerPage, offset);
			}
		}
	};

	var getMoreFriends = getFriendsByPage(10);

	function displayPage(itemsPerPage, offset) {

		var count = self.cachedGirls.length;
		for (var i = 0;  i < count; i++) {

			var girl = self.cachedGirls.shift();
			var position = self.friends.binarySearch(girl, 'followers_count', binarySearchCallback);

			if (position != null) {
				self.friends.splice(position, 0, girl);

				offset += 1;

				if ((self.friends().length % itemsPerPage) == 0) {
					break;
				}
			}
		}

		return offset;
	}

	function getUserProfileDataCallback(data) {

		if (data.response && data.response.length > 0) {

			for (var key in data.response) {
				key = parseInt(key);
				var friend = data.response[key];

				// Skip if user is banned
				if (friend.hasOwnProperty('deactivated') && (friend.deactivated == 'banned' || friend.deactivated == 'deleted')) {
					continue;
				}

				if (friend.sex == 1) {
					self.cachedGirls.push(friend);
					self.friendIds.push(friend.uid);
				}
			}
		}
		self.friendPointer = self.friendIds.shift();

	}

}