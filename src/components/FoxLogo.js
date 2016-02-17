/**
 * 相关样式保存至app.css
 */
import React, { Component } from 'react';

export default class FoxLogo extends Component {
    render () {
        return (
            <div id="welcome-logo-fox" className="fox-wrapper">
                <div className="fox-face"></div>
                <div className="fox-ears"></div>
                <div className="fox-nose"></div>
                <div className="fox-body"></div>
                <div className="fox-tail"></div>
            </div>
        );
    }
}
