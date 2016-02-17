import React, { Component } from 'react';
import { Link } from 'react-router';
import Tabs from './Tabs';


export default class CommonFunctions extends Component {

    render () {
        let style = {
            'paneAxis' : {
                'flexGrow' : 1
            }
        };


        let tabs = [
            {title : '用户指引', type : 'GuideView', active : true},
            {title : '用户指引2', type : 'GuideView'}
        ];

        return (
            <fox-pane class="pane" tabindex="-1" style={style.paneAxis}>
                <Tabs tabs={tabs}/>

                <div className="item-views">
                    <div class="welcome is-guide" is="space-pen-div">
                        <div className="welcome-container">
                            <section className="welcome-panel">
                                <h1 className="welcome-title">了解测试工具 Fox!</h1>
                                <details className="welcome-card" data-section="project">
                                    <summary className="welcome-summary icon icon-repo">创建新的<span
                                        className="welcome-highlight"><Link to="/record">测试用例</Link></span>
                                    </summary>
                                    <div className="welcome-detail">
                                        <p><img className="welcome-img" src="atom://welcome/assets/project.svg"/></p>

                                        <p>Fox可以帮助你完成自动化测试中常见的交互问题。</p>

                                        <p>
                                            <button className="btn btn-primary">创建新用例</button>
                                        </p>

                                        <p className="welcome-note"><strong>提示:</strong>你也可以使用菜单栏的创建按钮。</p></div>
                                </details>
                                <details className="welcome-card" data-section="packages">
                                    <summary className="welcome-summary icon icon-package">浏览已有<span
                                        className="welcome-highlight">测试用例</span></summary>
                                    <div className="welcome-detail">
                                        <p><img className="w elcome-img"
                                                data-src="atom://welcome/assets/package.svg"/></p>

                                        <p>查看和管理之前已经存在的测试用例。</p>

                                        <p>
                                            <button className="btn btn-primary">查看用例</button>
                                        </p>
                                        <p className="welcome-note"><strong>提示:</strong>你也可以使用菜单栏的创建按钮。</p></div>
                                </details>
                                <details className="welcome-card" data-section="themes">
                                    <summary className="welcome-summary icon icon-paintcan">围观15秒<span
                                        className="welcome-highlight">教学视频</span></summary>
                                    <div className="welcome-detail">
                                        <p><img className="welcome-img"
                                                data-src="atom://welcome/assets/theme.svg"/></p>

                                        <p>我们将视频时间缩短到了十五秒，希望你能喜欢。</p>

                                        <p>
                                            <button className="btn btn-primary">浏览教学视频
                                            </button>
                                        </p>
                                        <p>更多教学视频即将推出。</p>

                                        <p className="welcome-note"><strong>提示:</strong>你也可以使用菜单栏的创建按钮。</p></div>

                                </details>
                                <details className="welcome-card" data-section="styling">
                                    <summary className="welcome-summary icon icon-paintcan">前往<span
                                        className="welcome-highlight">工具社区</span>看看
                                    </summary>
                                    <div className="welcome-detail">
                                        <p><img className="welcome-img"
                                                data-src="atom://welcome/assets/code.svg"/></p>

                                        <p>一款好用的软件离不开社区的支持，如果你遇到了什么问题，欢迎在社区里提出。</p>

                                        <p>
                                            <button className="btn btn-primary">打开社区</button>
                                        </p>
                                        <p>Now uncomment some of the examples or try your
                                            own.</p>

                                        <p className="welcome-note"><strong>提示:</strong>你也可以使用菜单栏的创建按钮。</p></div>

                                </details>
                            </section>
                        </div>
                    </div>
                </div>
            </fox-pane>
        );
    }
}
