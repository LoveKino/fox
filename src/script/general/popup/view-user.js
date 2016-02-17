/**
 * todo: 重构network & request & toast tips
 */

var Debug = require('debug.js');
var debugModuleName = '[popup/view-user]';

var view = $('.view-user');

var Config = require('config');

/** network util **/
var Network = require('network');

/** local user data method for popup **/
var User = require('./user');


/**
 * owl box animation
 */
function owlBox () {
    var owlHands = view.find('.owl .hand');
    var owlArms = view.find('.owl .arms');
    var activeClass = 'password';

    view.find('#password').on('focus', function () {
        owlHands.addClass(activeClass);
        owlArms.addClass(activeClass);
    }).on('focusout', function () {
        owlHands.removeClass(activeClass);
        owlArms.removeClass(activeClass);
    });
}

function initForm () {
    var userData = User.getUserData();
    var user = userData.user;
    var pass = userData.pass;

    if (!(user && pass)) {
        Debug.warn(debugModuleName, '用户尚未登录，使用单机模式。');
        return;
    }

    var inputEmail = view.find('#email');
    var inputPassword = view.find('#password');

    inputEmail.val(userData.user);
    inputPassword.val(userData.pass);
    // try to login
    view.find('.btn-login').trigger('click');
}

function switchStateLable (action) {
    var label = view.find('.user-state-label');

    switch (action) {
        case 'login':
            label.text(label.attr('data-text-login'));
            break;
        case 'logout':
            label.text(label.attr('data-text-logout'));
            break;
    }
}


function bindEvent () {

    var inputEmail = view.find('#email');
    var inputPassword = view.find('#password');

    //TODO: .btn-register, .btn-login
    view.find('.btn-login').on('click', function (e) {
        e.preventDefault();

        // request api to save case
        Network.request('register', null, {
            user : inputEmail.val(),
            pass : inputPassword.val()
        }, function (resp) {
            if (resp && resp.status === 'success') {
                User.login(inputEmail.val(), inputPassword.val());

                inputEmail.attr('readonly', true);
                inputPassword.attr('readonly', true);

                view.find('.btn-login').addClass(Config.CSS_LIST.hide);
                view.find('.btn-logout').removeClass(Config.CSS_LIST.hide);

                switchStateLable('login');
            }
        }, function (resp) {
            Debug.info(debugModuleName, 'register fail', resp);
        }, {contentType : 'application/json'});

    });

    view.find('.btn-logout').on('click', function (e) {
        e.preventDefault();

        var logout = User.logout();

        if (logout) {
            inputEmail.val('').attr('readonly', false);
            inputPassword.val('').attr('readonly', false);

            view.find('.btn-login').removeClass(Config.CSS_LIST.hide);
            view.find('.btn-logout').addClass(Config.CSS_LIST.hide);

            switchStateLable('logout');
        } else {
            Debug.info(debugModuleName, 'logout fail');
        }
    });

}


module.exports = {
    init : function () {
        owlBox();
        bindEvent();
        initForm();
    }
};

