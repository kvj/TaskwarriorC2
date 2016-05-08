import React from 'react';
import {styles, _l} from '../styles/main';

export class AppCmp extends React.Component {

    render() {
        console.log('AppCmp');
        return (
            <div style={_l([styles.vproxy, styles.max, styles.app])}>
                {this.props.children}
            </div>
        );
    }
};

export class ToolbarCmp extends React.Component {

    render() {
        return (
            <div style={_l([styles.flex0, styles.toolbar])}>
                <i className="fa fa-square-o"></i>
            </div>
        );
    }
};

export class CenterCmp extends React.Component {

    render() {
        return (
            <div style={_l([styles.hproxy, styles.center])}>
                {this.props.children}
            </div>
        );
    }
};

export class NavigationCmp extends React.Component {

    render() {
        let st = [styles.navigation, styles.vflex];
        if (this.props.mode == 'dock') {
            st.push(styles.flex0);
        }
        if (this.props.mode == 'float') {
            st.push(styles.navigationFloat);
        }
        if (this.props.mode == 'hidden') {
            st.push(styles.none);
        }
        return (
            <div style={_l(st)}>
                {this.props.children}
            </div>
        );
    }
};

export class ReportsCmp extends React.Component {

    render() {
        let st = [styles.reports, styles.vflex];
        if (this.props.mode == 'dock') {
            st.push(styles.flex0);
        }
        if (this.props.mode == 'float') {
            st.push(styles.reportsFloat);
        }
        if (this.props.mode == 'hidden') {
            st.push(styles.none);
        }
        return (
            <div style={_l(st)}>
                {this.props.children}
            </div>
        );
    }
};

export class TasksCmp extends React.Component {

    render() {
        return (
            <div style={_l([styles.vproxy, styles.tasks])}>
                {this.props.children}
            </div>
        );
    }
};
