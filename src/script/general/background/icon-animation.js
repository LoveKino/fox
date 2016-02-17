/**
 * 工具栏图标录制动画
 *
 * @desc 在录制过程中展示图标动画，参考Google Mail Checker实现
 * @constructor
 */

function Animation () {
    this.instance = null;
    this.maxCount = 8;  // Total number of states in animation
    this.current = 0;  // Current state
    this.maxDot = 3;  // Max number of dots in animation
}

Animation.prototype.updateFrame = function () {
    var text = '';

    for (var i = 0; i < this.maxDot; i++) {
        if (i === this.current) {
            text += '-';
        } else {
            text += ' ';
        }
    }

    if (this.current >= this.maxDot) {
        text += '';
    }

    chrome.browserAction.setBadgeText({text : text});
    this.current++;

    if (this.current === this.maxCount) {
        this.current = 0;
    }
};

Animation.prototype.start = function () {
    if (this.instance) {
        return;
    }

    var self = this;

    this.instance = window.setInterval(function () {
        self.updateFrame();
    }, 100);
};

Animation.prototype.stop = function () {
    if (!this.instance) {
        return;
    }

    window.clearInterval(this.instance);
    this.instance = 0;
};

module.exports = new Animation;
