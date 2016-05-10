import React from 'react';
import {styles, _l} from '../styles/main';

const IconBtn = (props) => {
    return (
        <button style={_l([styles.btn])} onClick={(evt) => {
            if (props.onClick) props.onClick(evt);
        }}>
            <i className={`fa fa-fw fa-${props.icon}`}></i>
        </button>
    );
}

const Text = (props) => {
    let _st = [styles.flex0, styles.text];
    if (props.style && props.style.length) {
        _st = _st.concat(props.style);
    }
    let val = props.children || '';
    while (props.width > val.length) {
        val += ' ';
    }
    return (<div style={_l(_st)}>{val}</div>);
}

class Task extends React.Component {

    render() {
        const {cols, task} = this.props;
        const fields = cols.map((item) => {
            if (item.field == 'description') { // Separator
                return (<div key='desc' style={_l(styles.spacer)}></div>);
            }
            const val = task[`${item.field}_`] || '';
            return (<Text width={item.width} key={item.field}>{val}</Text>);
        });
        let descSt = [styles.description, styles.flex1];
        if (task.description_truncate) {
            descSt.push(styles.oneLine);
        }
        let desc_count = null;
        if (task.description_count) {
            desc_count = (<Text style={[styles.description]}>{task.description_count}</Text>)
        }
        let check_icon = 'square-o';
        if (task.status == 'completed') {
            check_icon = 'check-square-o';
        }
        if (task.status == 'deleted') {
            check_icon = 'close';
        }
        return (
            <div style={_l(styles.one_task)}>
                <div style={_l(styles.hflex)}>
                    <IconBtn icon={check_icon}/>
                    <Text style={descSt}>{task.description_}</Text>
                    {desc_count}
                    <IconBtn icon="caret-down"/>
                </div>
                <div style={_l(styles.hflex, styles.wflex)}>
                    {fields}
                </div>
            </div>
        );
    }
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
            report: props.report || '',
            filter: props.filter || '',
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

    onFilterChange (evt) {
        this.setState({
            filter: evt.target.value,
        });
    }

    onKey(evt) {
        if (evt.charCode == '13') {
            // Refresh
            this.props.onRefresh();
        }
    }

    render() {
        const {info, onRefresh} = this.props;
        const line1 = (
            <div style={_l(styles.flex0, styles.hflex, styles.wflex)}>
                <input
                    style={_l(styles.inp, styles.flex1)}
                    type="text"
                    value={this.state.report}
                    onChange={this.onReportChange.bind(this)}
                    onKeyPress={this.onKey.bind(this)}
                    placeholder="Report"
                />
                <IconBtn icon="plus"/>
                <IconBtn icon="refresh" onClick={onRefresh}/>
                <IconBtn icon="close"/>
            </div>
        );
        const line2 = (
            <div style={_l(styles.flex0, styles.hflex)}>
                <input
                    style={_l(styles.inp, styles.flex1)}
                    type="text"
                    value={this.state.filter}
                    onChange={this.onFilterChange.bind(this)}
                    onKeyPress={this.onKey.bind(this)}
                    placeholder="Filter"
                />
            </div>
        );
        let body = null;
        if (info) {
            // Render header
            const cols = info.cols.filter((item) => {
                return item.visible;
            });
            const header_items = cols.map((item) => {
                if (item.field == 'description') {
                    // Insert spacer
                    return (<div key='desc' style={_l(styles.spacer)}></div>);
                }
                return (<Text width={item.width} key={item.field}>{item.label}</Text>);
            });
            const tasks = info.tasks.map((item, idx) => {
                return (<Task task={item} key={idx} cols={cols} />);
            });
            // Render tasks
            body = (
                <div style={_l(styles.vproxy)}>
                    <div style={_l(styles.flex0, styles.hflex, styles.wflex)}>{header_items}</div>
                    <div style={_l(styles.flex1s)}>{tasks}</div>
                </div>
            );
        }
        return (
            <div style={_l(styles.vproxy)}>
                {line1}
                {line2}
                <div style={_l(styles.vproxy)}>
                    {body}
                </div>
            </div>
        );
    }
}
