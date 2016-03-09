/**
 *
 * @type {{error: string}}
 */

var topicList = {
    'error' : '/page/knowledge/error.html',
    '404'   : '/page/knowledge/404.html'
};


/**
 * 打开主题页面
 * @param topic
 * @param query
 * @param newWindow
 */
function showTopic (topic, query, newWindow) {
    var topicUrl = '';
    if (topicList.hasOwnProperty(topic)) {

        if (query) {
            topicUrl = [topicList[topic], query].join('?showTopic=');
        } else {
            topicUrl = topicList[topic];
        }
    } else {
        topicUrl = topicList['404'];
    }

    if(newWindow){
        try {
            chrome.tabs.create({url : chrome.extension.getURL(topicUrl)});
        } catch (e) {
            alert('插件发生错误，请重载插件。');
        }
    }else{
        return topicUrl;
    }
}

module.exports = {
    showTopic : showTopic
};