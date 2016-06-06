import React from 'react';
import {styles, _l} from '../styles/main';
import * as widget from './widget';
import * as common from './cmp.common';

/*
class TaskTag extends DnD {

    constructor(props) {
        super(props);
        this.dropTypes.push('tw/tag');
        this.state = {};
    }

    onDropHandler(type, data) {
        this.props.onDrop(type, data);
    }

    render() {
        const {item} = this.props;
        const {dragTarget} = this.state;
        return (
        );
    }

}
*/

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
        const {
            onCommand,
            onTogglePane,
            onSync,
            onUndo
        } = this.props;
        return (
            <div style={_l([styles.flex0, styles.toolbar, styles.hflex])}>
                <div style={_l([styles.flex0, styles.hbar])}>
                    <widget.IconBtn
                        icon="navicon"
                        title="Toggle Projects and Tags pane"
                        onClick={(e) => {
                            onTogglePane('left', e);
                        }}
                    />
                </div>
                <div style={_l([styles.flex1, styles.hbar])}>
                </div>
                <div style={_l([styles.flex0, styles.hbar])}>
                    <widget.IconBtn
                        icon="terminal"
                        title="Run custom task command"
                        onClick={onCommand}
                    />
                    <widget.IconBtn
                        icon="undo"
                        title="Undo latest operation"
                        onClick={onUndo}
                    />
                    <widget.IconBtn
                        icon="cloud"
                        title="Sync with taskd server"
                        onClick={onSync}
                    />
                    <widget.IconBtn
                        icon="navicon"
                        title="Toggle Reports and Contexts pane"
                        onClick={(e) => {
                            onTogglePane('right', e);
                        }}
                    />
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

class PaneCmp extends React.Component {

    constructor(props, name) {
        super(props);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.name = name;
    }

    onMouseLeave(e) {
        const {mode, onHide} = this.props;
        if (mode == 'float') {
            onHide(this.name);
        };
    }
}

export class NavigationCmp extends PaneCmp {

    constructor(props) {
        super(props, 'left');
    }

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
            <div style={_l(st)} onMouseLeave={this.onMouseLeave}>
                <common.ProjectsNavigation
                    onRefresh={this.props.onRefreshProjects}
                    onClick={this.props.onProjectClick}
                    projects={this.props.projects || []}
                    info={this.props.info}
                />
                <common.TagsNavigation
                    onRefresh={this.props.onRefreshTags}
                    onClick={this.props.onTagClick}
                    tags={this.props.tags || []}
                    info={this.props.info}
                />
            </div>
        );
    }
};

export class ReportsCmp extends PaneCmp {

    constructor(props) {
        super(props, 'right');
    }

    render() {
        const {reports, onReportsRefresh, onReportClick} = this.props;
        const {contexts, onContextsRefresh, onContextClick} = this.props;
        let st = [styles.right_pane, styles.reports, styles.vflex];
        if (this.props.mode == 'dock') {
            st.push(styles.flex0);
        }
        if (this.props.mode == 'float') {
            st.push(styles.right_pane_float);
        }
        if (this.props.mode == 'hidden') {
            st.push(styles.none);
        }
        return (
            <div style={_l(st)} onMouseLeave={this.onMouseLeave}>
                <common.ReportsList
                    reports={reports}
                    onRefresh={onReportsRefresh}
                    onClick={onReportClick}
                />
                <common.ContextsList
                    contexts={contexts}
                    onRefresh={onContextsRefresh}
                    onClick={onContextClick}
                />
            </div>
        );
    }
};

class PopupEditor extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            input: props.input || '',
        };
    }

    reset() {
        this.setState({
            input: this.props.input,
        });
    }

    onChange(evt) {
        this.setState({
            input: evt.target.value,
        });
    }

    finish(success, e) {
        const input = this.state.input.trim();
        if (success)
            this.props.onDone(input, e);
        else
            this.props.onCancel(input, e);
    }

    onKey(evt) {
        const e = widget.eventInfo(evt);
        if (e.key == 13) { // Enter
            this.finish(true, e);
        }
        if (e.key == 27) { // Escape
            this.finish(false, e);
        }
    }

    componentDidMount() {
        this.refs.input.focus();
    }

    render() {
        return (
            <div style={_l(styles.floatCenter)}>
                <div style={_l(styles.input_box)}>
                    <div style={_l(styles.hflex, styles.hbar, styles.wflex)}>
                        <widget.Text>{this.props.title}</widget.Text>
                        <input
                            style={_l(styles.inp, styles.flex1)}
                            type="search"
                            value={this.state.input}
                            onChange={this.onChange.bind(this)}
                            onKeyDown={this.onKey.bind(this)}
                            ref="input"
                        />
                    </div>
                    <div style={_l(styles.hflex)}>
                        <div style={_l(styles.spacer)}></div>
                        <widget.IconBtn icon="check" onClick={(e) => {
                            this.finish(true, e);
                        }}/>
                        <widget.IconBtn icon="close" onClick={(e) => {
                            this.finish(false, e);
                        }}/>
                    </div>
                </div>
            </div>
        );
    }

}

export class MainCmp extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    showInput(title, input, context) {
        this.setState({
            input: {
                title, input, context,
            },
        });
    }

    onInputCancel() {
        this.setState({
            input: undefined,
        });
    }

    async onInputDone(input, e) {
        const keepOpen = e.ctrl;
        const success = await this.props.onInput(input, this.state.input.context);
        if (success) { // Close
            if (keepOpen) { // Reset
                this.refs.popup_input.reset();
                return;
            };
            this.setState({
                input: undefined,
            });
        };
    }

    render() {
        const {pages, pins, page, onNavigation} = this.props;
        const {input} = this.state;
        const pageCmps = pages.map((pageCmp, idx) => {
            if (pageCmp.key == page) { // Visible
                return (<div key={pageCmp.key} style={_l(styles.vproxy)}>{pageCmp.cmp}</div>);
            } else { // Hidden
                return (<div key={pageCmp.key} style={_l(styles.none)}>{pageCmp.cmp}</div>);
            };
        });
        const pinsCmps = pins.map((pageCmp, idx) => {
            return (<div key={pageCmp.key} style={_l(styles.vproxy)}>{pageCmp.cmp}</div>);
        });
        const pageIndicators = pages.map((pageCmp, idx) => {
            const icn = pageCmp.key == page? 'circle': 'circle-o';
            return (<i key={idx} className={`fa fa-fw fa-${icn}`}></i>);
        });
        let inputCmp = null;
        if (input) { // Render
            inputCmp = (
                <PopupEditor
                    input={input.input}
                    title={input.title}
                    onDone={this.onInputDone.bind(this)}
                    onCancel={this.onInputCancel.bind(this)}
                    ref="popup_input"
                />
            );
        };
        return (
            <div style={_l(styles.vproxy, styles.tasks)}>
                <div style={_l(styles.flex1, styles.hflex)}>
                    <div style={_l(styles.vproxy)}>
                        {pageCmps}
                    </div>
                    {pinsCmps}
                </div>
                <div style={_l(styles.flex0, styles.hflex, styles.hbar)}>
                    <div style={_l(styles.flex0, styles.hbar)}>
                        <widget.IconBtn icon="chevron-left" onClick={() => {
                            onNavigation(-1);
                        }}/>
                    </div>
                    <div style={_l(styles.flex1, styles.textCenter, styles.textSmall)}>
                        {pageIndicators}
                    </div>
                    <div style={_l(styles.flex0, styles.hbar)}>
                        <widget.IconBtn icon="chevron-right" onClick={() => {
                            onNavigation(1);
                        }}/>
                    </div>
                </div>
                {inputCmp}
            </div>
        );
    }
};

class CmdPageInput extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            cmd: props.cmd || '',
        };
    }

    onChange (evt) {
        this.setState({
            cmd: evt.target.value,
        });
    }

    componentDidMount() {
        this.refs.input.focus();
    }

    render() {
        const {onRefresh, onPin, onClose} = this.props;
        const line1 = (
            <div style={_l(styles.flex0, styles.hflex, styles.wflex)}>
                <input
                    style={_l(styles.inp, styles.flex1)}
                    type="text"
                    ref="input"
                    value={this.state.cmd}
                    onChange={this.onChange.bind(this)}
                    onKeyPress={this.onKey.bind(this)}
                    placeholder="Command"
                />
                <widget.IconBtn icon="refresh" onClick={onRefresh}/>
                <widget.IconBtn
                    icon="thumb-tack"
                    onClick={onPin}
                    title="Pin/unpin panel"
                />
                <widget.IconBtn icon="close" onClick={onClose}/>
            </div>
        );
        return (
            <div style={_l(styles.flex0)}>
                {line1}
            </div>
        );
    }

    input() {
        return this.state;
    }

    onKey(evt) {
        if (evt.charCode == 13) {
            // Refresh
            this.props.onRefresh();
        }
    }

}

export class TaskPageCmp extends common.TaskPageCmp {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    renderBody(header, info) {
        const cols = info.cols.filter((item) => {
            return item.visible;
        });
        const _tasks = info.tasks.map((item, idx) => {
            return this.renderTask(item, idx, cols);
        });
        return (
            <div style={_l(styles.vproxy)}>
                <div style={_l(styles.flex0, styles.hflex, styles.wflex)}>{header}</div>
                <div style={_l(styles.flex1s)}>{_tasks}</div>
            </div>
        );
    }

}

export class CmdPageCmp extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }


    input() {
        return this.refs.input.input();
    }

    filter(filter) {
        this.refs.input.filter(filter);
    }

    render() {
        const {
            info,
        } = this.props;
        let body = null;
        if (info) {
            const lines = info.lines.map((line, idx) => {
                return (
                    <widget.Text
                        key={idx}
                        style={[styles.pre, styles[`cmdLine_${line.type}`]]}
                    >
                        {line.line}
                    </widget.Text>
                );
            })
            body = (
                <div style={_l(styles.vproxy, styles.relative)}>
                    <div style={_l(styles.cmdPane)}>{lines}</div>
                </div>
            );
        }
        return (
            <div style={_l(styles.vproxy)}>
                <CmdPageInput
                    {...this.props}
                    ref="input"
                />
                <div style={_l(styles.vproxy)}>
                    {body}
                </div>
            </div>
        );
    }
}

export class StatusbarCmp extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            message: '',
            floats: [],
        };
    }

    hideFloat(fl) {
        this.state.floats.forEach((item, idx) => {
            if (item == fl) { // OK
                this.state.floats.splice(idx, 1);
                this.setState({
                    floats: this.state.floats,
                });
            };
        });
    }

    showMessage(type, message, choices, resp) {
        if (!message) {
            return false;
        }
        if (type == 'question') {
            const fl = {
                type: type,
                message: message,
                choices: choices,
                resp: resp,
            };
            this.state.floats.push(fl);
            this.setState({
                floats: this.state.floats,
            });
            return;
        }
        this.setState({
            type: type,
            message: message,
            time: new Date(),
        });
        if (type == 'error') { // Add float
            const fl = {
                type: type,
                message: message,
            };
            this.state.floats.push(fl);
            this.setState({
                floats: this.state.floats,
            });
            setTimeout(() => {
                this.hideFloat(fl);
            }, 2000);
        };
    }

    render() {
        const {spin} = this.props;
        let spinCls = 'fa fa-fw fa-cloud';
        if (spin) spinCls += ' fa-spin';
        const floats = this.state.floats.map((item, idx) => {
            if (item.type == 'question') {
                const btns = item.choices.map((btn) => {
                    return (
                        <a
                            key={btn}
                            href="#"
                            style={_l(styles.btn_a)}
                            onClick={(e) => {
                                this.hideFloat(item);
                                item.resp(btn);
                            }}
                        >
                            {btn}
                        </a>
                    );
                });
                return (
                    <div key={idx} style={_l(styles.floatBlock)}>
                        <widget.Text>{item.message}</widget.Text>
                        <div style={_l(styles.hflex)}>
                            <div style={_l(styles.spacer)}></div>
                            {btns}
                        </div>
                    </div>
                );
            }
            return (
                <div key={idx} style={_l(styles.floatBlock)} onClick={() => {
                    this.hideFloat(item);
                }}>
                    <widget.Text>{item.message}</widget.Text>
                </div>
            );
        });
        let time = null;
        if (this.state.time) {
            time = (
                <widget.Text style={[styles.oneLine, styles.flex0, styles.textSmall]}>
                    {this.state.time.toLocaleTimeString()}:
                </widget.Text>
            );
        }
        return (
            <div style={_l(styles.flex0, styles.hflex, styles.hbar, styles.statusbar)}>
                <div style={_l(styles.floatBR)}>
                    {floats}
                </div>
                <div style={_l(styles.flex0, spin? null: styles.hidden)}>
                    <i className={spinCls}></i>
                </div>
                {time}
                <widget.Text
                    style={[styles.oneLine, styles.flex1, styles.textSmall]}
                >
                    {this.state.message}
                </widget.Text>
            </div>
        );
    }
}
