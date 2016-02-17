/**
 * 临时模块
 */
module.exports = {
    init : function () {
        $('#echo-box .msg-box').html('insert debug content...');
        $('#echo-box .opt-box > a').each(function (k, v) {
            switch ($(v).attr('data-action')) {
                case 'reload-plugin':
                    (function (button) {
                        button.on('click', function () {
                            location.reload();
                        });
                    })($(v));
                    break;
            }
        });
        var cmdBox = $('#console-content');
        cmdBox.on('keypress', function (e) {
            var cmd = $.trim(cmdBox.val());
            if (e.keyCode === 13 && cmd) {
                e.preventDefault();
                try {
                    eval(cmd);
                } catch (e) {
                    throw Error(e);
                }
                cmdBox.text('');
            }
        });
    }
};