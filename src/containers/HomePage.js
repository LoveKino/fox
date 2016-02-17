import React, { Component } from 'react';
import Home from '../components/Home';
import LightPanel from '../components/LeftPanel';
import RightPanel from '../components/RightPanel';
import Modal from '../components/Modal';

export default class HomePage extends Component {
    render () {
        return (
            <div className="react-wrap">
                <fox-workspace-axis class="horizontal">

                    <LightPanel />
                    <Home />
                    <RightPanel />

                </fox-workspace-axis>

                <Modal />
            </div>
        );
    }
}

