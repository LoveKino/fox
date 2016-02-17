import React, { Component } from 'react';
import { Link } from 'react-router';
import styles from './Home.module.css';

import HomePageGuide from './HomePageGuide';
import CommonFunctions from './CommonFunctions';

var LoadingPic = React.createClass({
    render : function () {
        function createMarkup (width, height) {
            return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${width}" height="${height}" fill="white">
            <circle transform="translate(8 0)" cx="0" cy="16" r="0">
              <animate attributeName="r" values="0; 4; 0; 0" dur="1.2s" repeatCount="indefinite" begin="0" keytimes="0;0.2;0.7;1" keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.6 0.4 0.8" calcMode="spline" />
            </circle>
            <circle transform="translate(16 0)" cx="0" cy="16" r="0">
              <animate attributeName="r" values="0; 4; 0; 0" dur="1.2s" repeatCount="indefinite" begin="0.3" keytimes="0;0.2;0.7;1" keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.6 0.4 0.8" calcMode="spline" />
            </circle>
            <circle transform="translate(24 0)" cx="0" cy="16" r="0">
              <animate attributeName="r" values="0; 4; 0; 0" dur="1.2s" repeatCount="indefinite" begin="0.6" keytimes="0;0.2;0.7;1" keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.6 0.4 0.8" calcMode="spline" />
            </circle>
          </svg>`;
        };

        return (
            <div dangerouslySetInnerHTML={{__html: createMarkup(this.props.width, this.props.height)}}/>
        );
    }
});


export default class Home extends Component {

    render () {
        let style = {
            'paneAxis' : {
                'flexGrow' : 1
            }
        };
        return (
            <fox-workspace-axis class="vertical">

                <fox-panel-container class="top"></fox-panel-container>

                <fox-pane-container class="panes">

                    <fox-pane-axis class="horizontal pane-row" style={style.paneAxis}>

                        <HomePageGuide />

                        <fox-pane-resize-handle class=" horizontal"></fox-pane-resize-handle>

                        <CommonFunctions />

                    </fox-pane-axis>

                </fox-pane-container>

                <fox-panel-container class="bottom">

                    <fox-panel class="bottom tool-panel panel-bottom">
                        <status-bar class="status-bar">
                            <div className="flexbox-repaint-hack">
                                <div className="status-bar-left">
                                    <div is="status-bar-file" class="file-info inline-block" data-original-title="" title="">
                                        <a className="current-path">Welcome</a>
                                    </div>
                                    <div is="status-bar-cursor" class="cursor-position inline-block hide" data-original-title="" title="">
                                        <a className="inline-block" href="#"></a>
                                    </div>
                                    <div is="status-bar-selection" class="selection-count inline-block"></div>
                                </div>
                                <div className="status-bar-right">
                                    <a className="line-ending-tile inline-block"></a>
                                    <encoding-selector-status class="encoding-status inline-block">
                                        <a className="inline-block" href="#"></a>
                                    </encoding-selector-status>
                                    <grammar-selector-status class="grammar-status inline-block">
                                        <a className="inline-block" href="#"></a>
                                    </grammar-selector-status>
                                    <div is="status-bar-git" class="git-view">
                                        <div className="git-branch inline-block">
                                            <span className="icon icon-git-branch"></span>
                                            <span className="branch-label"></span>
                                        </div>
                                        <div className="git-commits inline-block">
                                            <span className="icon icon-arrow-up commits-ahead-label"></span>
                                            <span className="icon icon-arrow-down commits-behind-label"></span>
                                        </div>
                                        <div className="git-status inline-block">
                                            <span className="icon"></span>
                                        </div>
                                    </div>
                                    <span type="button" class="about-release-notes icon icon-squirrel inline-block" is="space-pen-span" data-original-title="" title=""></span>
                                </div>
                            </div>
                        </status-bar>
                    </fox-panel>

                </fox-panel-container>

            </fox-workspace-axis>

        );
    }
}
//
//<Link to="/record">录制</Link>
//<Link to="/about">关于</Link>
//    <Link to="/counter">test</Link>
//    <Link to="/fox-option">设置</Link>
//                                            <LoadingPic width="32" height="32"/>
