import React from 'react';
import {styles, _l} from '../styles/main';

const IconBtn = (props) => {
    return (
        <button style={_l([styles.btn])}>
            <i className={`fa fa-fw fa-${props.icon}`}></i>
        </button>
    );
}

export class AppCmp extends React.Component {

    render() {
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
            <div style={_l([styles.flex0, styles.toolbar, styles.hflex])}>
                <div style={_l([styles.flex0, styles.hbar])}>
                    <IconBtn icon="navicon"/>
                </div>
                <div style={_l([styles.flex1, styles.hbar])}>
                </div>
                <div style={_l([styles.flex0, styles.hbar])}>
                    <IconBtn icon="undo"/>
                    <IconBtn icon="cloud"/>
                    <IconBtn icon="navicon"/>
                </div>
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

export class MainCmp extends React.Component {

    render() {
        const {pages, page} = this.props;
        const pageCmp = pages[page];
        if (!pageCmp) { // Not found
            return null;
        };
        return (
            <div style={_l(styles.vproxy, styles.tasks)}>
                <div style={_l(styles.vproxy)}>
                    {pageCmp}
                </div>
                <div style={_l(styles.flex0, styles.hflex)}>
                    <div style={_l(styles.flex0, styles.hbar)}>
                        <IconBtn icon="chevron-left"/>
                    </div>
                    <div style={_l(styles.flex1, styles.hbar)}>
                    </div>
                    <div style={_l(styles.flex0, styles.hbar)}>
                        <IconBtn icon="chevron-right"/>
                    </div>
                </div>
            </div>
        );
    }
};

export class TaskPageCmp extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            report: props.report,
            filter: props.filter,
            tasks: [], // Fill me
        };
    }

    input() {
        return {
            report: this.state.report,
            filter: this.state.filter,
        };
    }

    onReportChange (evt) {
        this.setState({
            report: evt.target.value,
        });
    }

    render() {
        const line1 = (
            <div style={_l(styles.flex0, styles.hflex, styles.wflex)}>
                <input
                    style={_l(styles.inp, styles.flex1)}
                    type="text"
                    value={this.state.report}
                    onChange={this.onReportChange.bind(this)}
                    placeholder="Report"
                />
                <IconBtn icon="plus"/>
                <IconBtn icon="refresh"/>
                <IconBtn icon="close"/>
            </div>
        );
        const line2 = (
            <div style={_l(styles.flex0, styles.hflex)}>
                <input
                    style={_l(styles.inp, styles.flex1)}
                    type="text"
                    placeholder="Filter"
                />
            </div>
        );
        return (
            <div style={_l(styles.vproxy)}>
                {line1}
                {line2}
                <div style={_l(styles.flex1)}>
                </div>
            </div>
        );
    }
}
