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

    paneConfig(field) {
        return {
            visible: this.props[field] !== 'hidden',
            compact: this.props[field] === 'compact',
        }
    }

    onMouseLeave(e) {
        const {mode, onHide} = this.props;
        if (mode == 'float') {
            onHide(this.name);
        };
    }

    renderExtra() {
        return this.props.extra.map((item, idx) => {
            return (
                <div key={idx} style={_l(styles.flex0)}>
                    {item}
                </div>
            );
        });
    }
}

class ProjectsNavigation extends common.ProjectsNavigation {

    renderList(list) {
        const {onClick, onEdit, compact} = this.props;
        const projects = list.map((item, idx) => {
            let prefix = '';
            for (var i = 0; i < item.indent; i++) {
                prefix += ' ';
            }
            let st = [styles.one_nav, styles.hflex, styles.hbar];
            if (item.hilite) st.push(styles.hilite);
            return (
                <div
                    key={item.project}
                    style={_l(st)}
                    onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', `pro:${item.project}`);
                        e.dataTransfer.setData('tw/project', item.project);
                    }}
                    draggable
                    onClick={(evt) => {
                        const e = widget.eventInfo(evt);
                        onClick(item, e.meta);
                    }}
                >
                    <widget.Text
                        style={[styles.flex1]}
                        editable
                        onEdit={(e) => {
                            e.stop();
                            onEdit(item);
                        }}
                    >
                        {prefix+item.name}
                    </widget.Text>
                    <widget.Text style={[styles.flex0]}>{item.count}</widget.Text>
                </div>
            );
        });
        return (
            <div style={_l(compact? styles.flex0: styles.flex1s)}>
                {projects}
            </div>
        );
    }
}

class TagsNavigation extends common.TagsNavigation {

    renderList(list) {
        const {onClick, onEdit, compact} = this.props;
        const tags = list.map((item, idx) => {
            let st = [styles.one_nav, styles.hflex, styles.hbar];
            if (item.hilite) st.push(styles.hilite);
            return (
                <div
                    key={item.name}
                    style={_l(st)}
                    onClick={(evt) => {
                        const e = widget.eventInfo(evt);
                        onClick(item, e.meta);
                    }}
                    onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', `+${item.name}`);
                        e.dataTransfer.setData('tw/tag', item.name);
                    }}
                    draggable
                >
                    <widget.Text
                        style={[styles.flex1]}
                        editable
                        onEdit={(e) => {
                            e.stop();
                            onEdit(item);
                        }}
                    >
                        {item.name}
                    </widget.Text>
                    <widget.Text style={[styles.flex0]}>{item.count}</widget.Text>
                </div>
            );
        });
        return (
            <div style={_l(compact? styles.flex0: styles.flex1s)}>
                {tags}
            </div>
        );
    }
}

export class NavigationCmp extends PaneCmp {

    constructor(props) {
        super(props, 'left');
    }

    render() {
        let st = [styles.navigation, styles.vflex];
        const {mode} = this.props;
        if (mode == 'hidden') {
            return null;
        };
        const pane = (
            <div style={_l(st)} onMouseLeave={this.onMouseLeave}>
                {this.renderExtra()}
                <ProjectsNavigation
                    title="Projects"
                    {...this.paneConfig('projectsMode')}
                    onRefresh={this.props.onRefreshProjects}
                    onClick={this.props.onProjectClick}
                    onEdit={this.props.onProjectEdit}
                    projects={this.props.projects || []}
                    expanded={this.props.projectsExpanded}
                    onExpand={this.props.onExpandProjects}
                    info={this.props.info}
                />
                <TagsNavigation
                    title="Tags"
                    {...this.paneConfig('tagsMode')}
                    onRefresh={this.props.onRefreshTags}
                    onClick={this.props.onTagClick}
                    onEdit={this.props.onTagEdit}
                    tags={this.props.tags || []}
                    expanded={this.props.tagsExpanded}
                    onExpand={this.props.onExpandTags}
                    info={this.props.info}
                />
            </div>
        );
        if (mode == 'float') {
            return (
                <div style={_l(styles.float_pane)}>
                    {pane}
                    <div style={_l(styles.float_space, styles.flex1)}></div>
                </div>
            );
        };
        return pane;
    }
};

class ContextsList extends common.ContextsList {
    
    renderList(list) {
        const {onRefresh, onClick, compact} = this.props;
        const items = list.map((item, idx) => {
            const click = () => {
                onClick(item.context);
            };
            return (
                <widget.Div
                    style={_l(styles.one_nav, item.selected? styles.hilite: null)}
                    key={idx}
                    onClick={click}
                >
                    <widget.Text style={[styles.oneLine]}>{item.name}</widget.Text>
                    <widget.Text style={[styles.oneLine, styles.textSmall]}>{item.filter}</widget.Text>
                </widget.Div>
            )
        });
        return (
            <widget.Div style={_l(styles.vflex, compact? styles.flex0: styles.flex1s)}>
                {items}
            </widget.Div>
        );
    }
}

class ReportsListItem extends widget.DnD {

    constructor(props) {
        super(props);
        this.dropTypes.push('tw/tag', 'tw/project');
        this.state = {};
    }

    onDropHandler(type, data) {
        this.props.onDrop(type, data);
    }

    render () {
        const {onClick, item} = this.props;
        const {dragTarget} = this.state;
        return (
            <widget.Div
                onDragEnter={this.onDragStart}
                onDragLeave={this.onDragFinish}
                onDragOver={this.onDragOver}
                onDrop={this.onDrop}
                style={_l(styles.one_nav, dragTarget? styles.task_drop: null)}
                onClick={onClick}
            >
                <widget.Text style={[styles.oneLine]}>{item.name}</widget.Text>
                <widget.Text style={[styles.oneLine, styles.textSmall]}>{item.title}</widget.Text>
            </widget.Div>
        );
    }
}

class ReportsList extends common.ReportsList {

    renderList(list) {
        const {compact} = this.props;
        const reports = list.map((item, idx) => {
            const onClick = () => {
                this.props.onClick(item);
            };
            const onDrop = (type, data) => {
                this.props.onClick(item, type, data);
            };
            return (
                <ReportsListItem
                    key={idx}
                    onDrop={onDrop}
                    onClick={onClick}
                    item={item}
                />
            )
        });
        return (
            <widget.Div style={_l(compact? styles.flex0: styles.flex1s)}>
                {reports}
            </widget.Div>
        );
    }

}

export class ReportsCmp extends PaneCmp {

    constructor(props) {
        super(props, 'right');
    }

    render() {
        const {
            reports, 
            onReportsRefresh, 
            onReportClick, 
            mode, 
            contexts, 
            onContextsRefresh, 
            onContextClick
        } = this.props;
        if (mode == 'hidden') {
            return null; // No render
        };
        let st = [styles.right_pane, styles.reports, styles.vflex, styles.flex0];
        const onClick = (item, type, data) => {
            let filter = '';
            if (type == 'tw/tag' && data) { // Drop
                filter = `+${data}`;
            };
            if (type == 'tw/project' && data) { // Drop
                filter = `pro:${data}`;
            };
            onReportClick(item, filter);
        };
        const pane = (
            <div style={_l(st)} onMouseLeave={this.onMouseLeave}>
                {this.renderExtra()}
                <ReportsList
                    title="Reports"
                    {...this.paneConfig('reportsMode')}
                    style={styles.flex1}
                    reports={reports}
                    onRefresh={onReportsRefresh}
                    onClick={onClick}
                />
                <ContextsList
                    {...this.paneConfig('contextsMode')}
                    title="Contexts"
                    style={styles.flex0}
                    contexts={contexts}
                    onRefresh={onContextsRefresh}
                    onClick={onContextClick}
                />
            </div>
        );
        if (mode == 'float') {
            return (
                <div style={_l(styles.float_pane)}>
                    <div style={_l(styles.float_space, styles.flex1)}></div>
                    {pane}
                </div>
            );
        }
        return pane;
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

    onTAKey(evt) {
        const e = widget.eventInfo(evt);
        if (e.key == 13 && e.ctrl) { // Enter
            this.finish(true, {});
        }
        if (e.key == 27 && e.ctrl) { // Ctrl+Escape
            this.finish(false, {});
        }
    }

    componentDidMount() {
        this.refs.input.focus();
    }

    render() {
        let input;
        let lineStyle;
        const {title, multiline} = this.props;
        if (multiline) { // Textarea
            lineStyle = [styles.hflex, styles.wflex];
            input = (
                <textarea
                    style={_l(styles.inp, styles.flex1)}
                    value={this.state.input}
                    onChange={this.onChange.bind(this)}
                    rows={styles.multiline.rows}
                    onKeyDown={this.onTAKey.bind(this)}
                    ref="input"
                ></textarea>
            );
        } else { // input
            lineStyle = [styles.hflex, styles.hbar, styles.wflex];
            input = (
                <input
                    style={_l(styles.inp, styles.flex1)}
                    type="search"
                    value={this.state.input}
                    onChange={this.onChange.bind(this)}
                    onKeyDown={this.onKey.bind(this)}
                    ref="input"
                />
            );
        };
        return (
            <div style={_l(styles.floatCenter)}>
                <div style={_l(styles.input_box)}>
                    <div style={_l(lineStyle)}>
                        <widget.Text>{this.props.title}</widget.Text>
                        {input}
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
                    multiline={input.context.multiline}
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

export class TaskPageCmp extends common.TaskPageCmp {

    constructor(props) {
        super(props);
    }

    renderBody(header, info) {
        const cols = info.cols.filter((item) => {
            return item.visible;
        });
        const _tasks = info.tasks.map((item, idx) => {
            return this.renderTask(item, idx, cols, info);
        });
        return (
            <div style={_l(styles.vproxy)}>
                <div style={_l(styles.flex0, styles.hflex, styles.wflex)}>{header}</div>
                <div style={_l(styles.flex1s)}>{_tasks}</div>
            </div>
        );
    }

}

export class CmdPageCmp extends common.CmdPageCmp {

    constructor(props) {
        super(props);
    }

    renderBody(info) {
        const lines = info.lines.map((line, idx) => {
            return (
                <widget.Text
                    key={idx}
                    style={[styles.pre, styles[`cmdLine_${line.type}`]]}
                >
                    {line.line}
                </widget.Text>
            );
        });
        return (
            <div style={_l(styles.vproxy, styles.relative)}>
                <div style={_l(styles.cmdPane)}>{lines}</div>
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

export class CalendarCmp extends React.Component {

    render() {
        const {date} = this.props;
        const title = date.toLocaleDateString(undefined, {
            year: '2-digit',
            month: 'short'
        });
        return (
            <common.CalendarPane
                {...this.props}
                title={title}
            />
        );
    }
}
