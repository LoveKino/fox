import React, { Component } from 'react';
import { Link } from 'react-router';
import FoxLogo from './FoxLogo'


export default class HomePageGuide extends Component {

    render () {

        let style = {
            'paneAxis' : {
                'flexGrow' : 1
            }
        };

        return (
            <fox-pane class="pane active" tabindex="-1" style={style.paneAxis}>
                <ul is="fox-tabs" class="list-inline tab-bar inset-panel" tabindex="-1">
                    <li is="tabs-tab" class="tab sortable active" data-type="WelcomeView">
                        <div className="title">欢迎使用</div>
                        <div className="close-icon"></div>
                    </li>
                </ul>
                <div className="item-views">
                    <div class="welcome" is="space-pen-div">
                        <div className="welcome-container">
                            <header className="welcome-header">
                                <FoxLogo />
                                <h1 className="welcome-title welcome-main-title">FOX</h1>
                                <h2 className="welcome-desc">一款被坑出来的测试工具。</h2>
                            </header>
                            <section className="welcome-panel">
                                <p>使用上遇到问题，可以浏览以下资源：</p>
                                <ul>
                                    <li>你可以在<a href="https://www.atom.io/docs" data-event="fox-docs">项目文档</a>中找到使用指南</li>
                                    <li>要参与讨论请前往<a href="http://discuss.atom.io" data-event="discuss">discuss.fox.io</a>.
                                    </li>
                                    <li>所有的视频资源可以在 <a href="https://github.com/atom" data-event="fox-org">XX视频网站找到</a>，如果你不想看文字又想快速上手的话。</li>

                                    <li><Link to="/record">录制</Link></li>
                                    <li><Link to="/about">关于</Link></li>
                                    <li><Link to="/counter">test</Link></li>
                                    <li><Link to="/fox-option">设置</Link></li>

                                </ul>
                                <p className="welcome-note welcome-metrics">
                                    <strong>咳咳:</strong> 如果你想获得更好的使用体验和产品质量，不妨参与社区，和我们一起将工作完善，你好我好大家好，大家好才是真的好。
                                </p>
                            </section>
                            <footer className="welcome-footer"><a href="https://atom.io/" data-event="footer-fox-io">MX TEAM</a> <span
                                className="text-subtle">×</span> <a className="icon icon-octoface"
                                                                    href="https://github.com/"
                                                                    data-event="footer-octocat"></a></footer>
                        </div>
                    </div>
                </div>
            </fox-pane>
        );
    }
}

