import React, { Component, PropTypes } from 'react';

var ChildTab = React.createClass({
    render : function () {

        const active = this.props.active ? 'active': '';
        let className = 'tab sortable ' + active;

        return (
            <li is="tabs-tab" class={className} data-type={this.props.type}>
                <div className="title">{this.props.title}</div>
                <div className="close-icon"></div>
            </li>
        );
    }
});

export default class Tabs extends Component {
    static propTypes = {
        tabs : PropTypes.arrayOf(
            PropTypes.shape({
                title  : PropTypes.string.isRequired,
                type   : PropTypes.string.isRequired,
                active : PropTypes.bool.optional
            })
        )
    };

    render () {
        return (
            <ul is="fox-tabs" class="list-inline tab-bar inset-panel" tabindex="-1">
                {this.props.tabs.map(function (tab) {
                    const { title, type, active } = tab;
                    return <ChildTab title={title} type={type} active={active}/>
                })}
            </ul>
        );
    }
}
