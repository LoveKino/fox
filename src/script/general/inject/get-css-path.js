/**
 * 获取CSS PATH
 *
 * @notice 回头提PR, 2个问题
 * @param elem
 * @returns {string}
 */


/**
 * @link https://github.com/timoxley/indexof
 * @param el
 * @returns {*}
 */
function indexOf (el) {
    function dir (elem, dir) {
        var matched = [],
            cur     = elem[dir];

        while (cur && cur.nodeType !== 9) {
            if (cur.nodeType === 1) {
                matched.push(cur);
            }
            cur = cur[dir];
        }
        return matched;
    }

    return el && el.parentNode
        ? dir(el, 'previousSibling').length
        : -1;
}

/**
 * @link https://github.com/timoxley/css-path/blob/master/index.js
 * @param el
 * @returns {*|string|String}
 */
function cssPath (el, shortMode) {

    function _cssPath (el, path) {
        path = path || [];

        if (!el || getNodeName(el) === 'html') return path;

        var elSelector = '';

        if (shortMode) {

            var idName = getIdSelector(el);

            if (idName) {
                elSelector = idName;
                path.unshift(elSelector);
                return path;
            } else {

                var className = getClassSelector(el);
                if (className) {
                    elSelector = className;
                    path.unshift(elSelector);
                    return _cssPath(el.parentNode, path);
                } else {

                    var nodeName = getNodeName(el);
                    if (nodeName) {
                        elSelector = nodeName;
                        if (!(elSelector.indexOf('#') > -1 || elSelector.indexOf('.') > -1)) {
                            elSelector += getChildIndex(el);
                        }
                        path.unshift(elSelector);
                        return _cssPath(el.parentNode, path);
                    }
                }
            }
        } else {
            // 存在Id or Class 后不应该出现ChildIndex
            elSelector = [getNodeName, getIdSelector, getClassSelector]
                .map(function (func) {return func(el);}) // apply functions
                .filter(function (item) {return !!item;}) // remove non-results
                .join('').trim();

            if (!(elSelector.indexOf('#') > -1 || elSelector.indexOf('.') > -1)) {
                elSelector += getChildIndex(el);
            }

            path.unshift(elSelector);
            return _cssPath(el.parentNode, path);
        }
    }

    /**
     * Get element's .class .list
     * @param {Element} dom element
     * @return {String} classes of element as CSS selector
     */

    function getClassSelector (el) {
        return el.className && el.className.split(' ')
                // 这里需要过滤空结果
                .filter(function (item) {return !!item;})
                .map(function (className) {return '.' + className;})
                .join('');
    }

    /**
     * Get element #id
     *
     * @param {Element} dom element
     * @return {String} id of element as CSS selector
     */

    function getIdSelector (el) {
        var id = el.id;
        if (el.id) {
            if (typeof id === 'number') {
                return '';
            } else if (typeof id === 'string' && id.match(/^\d+$/)) {
                return '';
            }
            return '#' + el.id;
        } else {
            return '';
        }
    }

    /**
     * Get element node name (e.g. div, li, body)
     *
     * @param {Element} dom element
     * @return {String} node name of element as CSS selector
     */

    function getNodeName (el) {
        return (el.nodeName).toLowerCase();
    }

    /**
     * Get CSS position of node relative to siblings, e.g. :nth-child(3)
     *
     * @param {Element} dom element
     * @return {String} node name of element as CSS selector
     */

    function getChildIndex (el) {
        var index = indexOf(el);
        if (!~index || el.tagName === 'BODY') return '';
        return ':nth-child(' + (index + 1) + ')';
    }

    return _cssPath(el).join(' ').trim();
    //return _cssPath(el).join(' > ').trim();
}

module.exports = cssPath;
