import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import styles from './Record.module.css';

import util from '../utils/common';
import userHome from 'user-home';
const foxWorkDir = userHome + '/.fox-workspace';

const PROJECT_INFO = require('../../package.json');
const DefaultUser = PROJECT_INFO.defaultUser;

import ListItem from './ListItem';

import caseApi from '../api/case';
var caseInfo = caseApi('list', DefaultUser);
if ('success' === caseInfo.status) {
    console.info(caseInfo.data.user, caseInfo.data.list);
}

// 'docuemntIDLE', 'request', 'end'
export default class Record extends Component {

    static displayName = 'RecordList';

    static propTypes = {
        status : PropTypes.func.isRequired,
        start  : PropTypes.func.isRequired,
        stop   : PropTypes.func.isRequired
    };

    render () {
        const { start, stop } = this.props;

        const iconStyle = {
            color : '#f0f0f0'
        };

        return (
            <div className="record" onClick="{this.handleClick}">
                <div className={styles.backButton}>
                    <Link to="/">
                        <i className="fa fa-arrow-left fa-2x" style={iconStyle}/>
                    </Link>
                </div>
                <div className={styles.caseListConatiner}>
                    <h2>测试用例列表</h2>
                    <ListItem />
                </div>

                <div className={styles.caseContentContainer}>
                    <div className={styles.casePreviewBoxContainer}>
                    </div>
                    <div className={styles.caseScriptSourceConatiner}>
                        <code className={styles.caseScriptSourceCode}>123</code>
                    </div>
                </div>
            </div>
        );
    }


    handleClick (e) {
        this.setState(111);
        console.log(this.props);
    }

;

}
