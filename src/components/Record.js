import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import styles from './Record.module.css';

export default class Record extends Component {
    static propTypes = {
        status : PropTypes.func.isRequired,
        start  : PropTypes.func.isRequired,
        stop   : PropTypes.func.isRequired
    };

    render () {
        const { start, stop } = this.props;
        return (
            <div>
                <div className={styles.backButton}>
                    <Link to="/">
                        <i className="fa fa-arrow-left fa-3x"/>
                    </Link>
                </div>
                <div className={styles.caseListConatiner}>
                    <h2>测试用例列表</h2>
                    <ul>
                        <li><a href="#">
                            <i className="fa fa-folder-open"></i>
                            <span>测试用例 a</span>
                        </a></li>
                        <li><a href="#">
                            <i className="fa fa-folder"></i>
                            <span>测试用例 a</span>
                        </a></li>


                        <li><a href="#">测试用例 1</a></li>
                        <li><a href="#">测试用例 2</a></li>
                        <li><a href="#">测试用例 3</a></li>
                        <li><a href="#">测试用例 4</a></li>

                        <li><a href="#">测试用例 1</a></li>
                        <li><a href="#">测试用例 2</a></li>
                        <li><a href="#">测试用例 3</a></li>
                        <li><a href="#">测试用例 4</a></li>

                        <li><a href="#">测试用例 1</a></li>
                        <li><a href="#">测试用例 2</a></li>
                        <li><a href="#">测试用例 3</a></li>
                        <li><a href="#">测试用例 4</a></li>

                        <li><a href="#">测试用例 1</a></li>
                        <li><a href="#">测试用例 2</a></li>
                        <li><a href="#">测试用例 3</a></li>
                        <li><a href="#">测试用例 4</a></li>

                        <li><a href="#">测试用例 1</a></li>
                        <li><a href="#">测试用例 2</a></li>
                        <li><a href="#">测试用例 3</a></li>
                        <li><a href="#">测试用例 4</a></li>

                        <li><a href="#">测试用例 1</a></li>
                        <li><a href="#">测试用例 2</a></li>
                        <li><a href="#">测试用例 3</a></li>
                        <li><a href="#">测试用例 4</a></li>
                    </ul>
                </div>

                <div className={styles.caseContentContainer}>
                    <div className={styles.casePreviewBoxContainer}>
                    </div>
                    <div className={styles.caseScriptSourceConatiner}><code>
                        123
                    </code></div>
                </div>
            </div>
        );
    }
}

