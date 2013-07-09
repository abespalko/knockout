function VKViewModel(appId) {

	var self = this;
	var baseURL = window.location.protocol + '//' + window.location.hostname + window.location.pathname;

	self.currentUser = ko.observable();

	self.init = ko.computed(function () {

		VK.init({
			apiId: appId
		});

		function authInfo(response) {
			if (response.session) {
				self.currentUser(response.session.mid);
			} else {
				alert('Not auth');
			}
		}
		VK.Auth.getLoginStatus(authInfo);

	});

	self.doLogin = function() {
		VK.Auth.login(function(response) {
			self.currentUser(response.session.user.id);
		}, VK.access.FRIENDS);
	};

	self.doLogout = function() {
		VK.Auth.logout(function(response) {
			window.location = baseURL;
		});
	};

}