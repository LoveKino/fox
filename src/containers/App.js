import React, { Component, PropTypes } from 'react';

export default class App extends Component {
    static propTypes = {
        children : PropTypes.element.isRequired
    };

    render () {
        return (
            <fox-workspace class="workspace theme-one-dark-syntax theme-one-dark-ui scrollbars-visible-always">
                {this.props.children}
                {
                    (() => {
                        if (false && process.env.NODE_ENV !== 'production') {
                            const DevTools = require('./DevTools');
                            return <DevTools />;
                        }
                    })()
                }
            </fox-workspace>
        );
    }
}
