$(document).ready(function () {

    ko.applyBindings(new GirlFriendsViewModel(), document.html);
    ko.applyBindings(new VKViewModel(3709148), document.getElementById('openapi_block'));

});

$(window).scroll(function () {

    var el = document.getElementById('show_more');
    var pos = el.offsetTop;
    if (parseInt($(window).scrollTop()) + 1200 >=  pos) {
        $('button.more-friends').trigger('click');
        $('#show_more_progress').show();
    }

});
