import React from 'react';
import ReactDOM from 'react-dom';
import {styles, _l} from '../styles/main';

const eventInfo = (e) => {
    if (!e) return undefined;
    return {
        shift: e.shiftKey || false,
        ctrl: e.ctrlKey || false,
        alt: e.altKey || false,
        meta: e.metaKey || false,
        key: e.charCode || e.keyCode,
    }
};

const IconBtn = (props) => {
    return (
        <button style={_l([styles.btn])} onClick={(evt) => {
            if (props.onClick) props.onClick(eventInfo(evt));
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
    const val = props.children || '';
    let sfx = ''
    while (props.width > val.length+sfx.length) {
        sfx += ' ';
    }
    let editIcn = null;
    if (props.editable === true) {
        editIcn = (
            <i
                className="fa fa-fw fa-pencil text-edit"
                style={styles.text_edit}
                onClick={(evt) => {
                    props.onEdit && props.onEdit(eventInfo(evt));
                }}
            >
            </i>
        )
    } else if (props.editable === false) {
        editIcn = (
            <i className="fa fa-fw" style={styles.text_edit}></i>
        )
    }
    return (
        <div style={_l(_st)} title={props.title || val} className="text-wrap" onClick={(evt) => {
            if (props.onClick) props.onClick(eventInfo(evt));
        }}>
            <span className="text">{val}</span>
            {editIcn}
            <span>{sfx}</span>
        </div>
    );
}

class Task extends React.Component {

    render() {
        const {
            cols,
            task,
            onDone,
            onClick,
            onDelete,
            onAnnDelete,
        } = this.props;
        const fields = cols.map((item, idx) => {
            if (item.field == 'description') { // Separator
                return (<div key={idx} style={_l(styles.spacer)}></div>);
            }
            const val = task[`${item.field}_`] || '';
            const editable = task[`${item.field}_ro`]? false: true;
            return (<Text editable={editable} width={item.width} key={idx} onEdit={(e) => {
                const edit_val = task[`${item.field}_edit`] || '';
                console.log('Click:', e);
                onClick(e, edit_val);
            }}>{val}</Text>);
        });
        let descSt = [styles.description, styles.flex1];
        if (task.description_truncate) {
            descSt.push(styles.oneLine);
        }
        let desc_count = null;
        if (task.description_count) {
            desc_count = (<Text style={[styles.description]}>{task.description_count}</Text>)
        }
        let annotations = null;
        if (task.description_ann) { // Have list
            annotations = task.description_ann.map((item, idx) => {
                return (
                    <div style={_l(styles.hflex, styles.annotation_line)} key={idx}>
                        <IconBtn icon="close" onClick={(e) => {
                            onAnnDelete(item.origin, e);
                        }}/>
                        <Text style={[styles.flex1, styles.description, styles.textSmall]}>
                            {item.text}
                        </Text>
                    </div>
                );
            });
        };
        let check_icon = 'square-o';
        if (task.status == 'completed') {
            check_icon = 'check-square-o';
        }
        if (task.status == 'deleted') {
            check_icon = 'close';
        }
        if (task.status == 'waiting') {
            check_icon = 'clock-o';
        }
        if (task.status == 'recurring') {
            check_icon = 'refresh';
        }
        return (
            <div style={_l(styles.one_task)}>
                <div style={_l(styles.hflex)}>
                    <IconBtn
                        icon={check_icon}
                        onClick={onDone}
                    />
                    <Text editable style={descSt} onEdit={(e) => {
                        onClick(e, task.description);
                    }}>{task.description_}</Text>
                    {desc_count}
                    <IconBtn icon="close" onClick={(e) => {
                        onDelete(e);
                    }}/>
                </div>
                <div style={_l(styles.hflex, styles.wflex)}>
                    {fields}
                </div>
                {annotations}
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

    async onUndo() {
        await this.props.controller.undo();
    }

    async onSync() {
        const outp = await this.props.controller.sync();
        console.log('Sync:', outp);
    }

    render() {
        return (
            <div style={_l([styles.flex0, styles.toolbar, styles.hflex])}>
                <div style={_l([styles.flex0, styles.hbar])}>
                    <IconBtn icon="navicon"/>
                </div>
                <div style={_l([styles.flex1, styles.hbar])}>
                </div>
                <div style={_l([styles.flex0, styles.hbar])}>
                    <IconBtn
                        icon="undo"
                        onClick={this.onUndo.bind(this)}
                    />
                    <IconBtn
                        icon="cloud"
                        onClick={this.onSync.bind(this)}
                    />
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

class ProjectsNavigation extends React.Component {

    render() {
        const renderProjects = (arr) => {
            return arr.map((item, idx) => {
                let prefix = '';
                for (var i = 0; i < item.indent; i++) {
                    prefix += ' ';
                }
                const jsx = (
                    <div
                        key={item.project}
                        style={_l(styles.one_nav, styles.hflex, styles.hbar)}
                        onClick={(e) => {
                            this.props.onClick(item, e);
                        }}
                    >
                        <Text style={[styles.flex1]}>{prefix+item.name}</Text>
                        <Text style={[styles.flex0]}>{item.count}</Text>
                    </div>
                );
                return [jsx, renderProjects(item.children)];
            });
        };
        return (
            <div style={_l(styles.vproxy)}>
                <div style={_l(styles.flex0, styles.hflex, styles.hbar)}>
                    <Text style={[styles.flex1]}>Projects</Text>
                    <IconBtn icon="refresh" onClick={this.props.onRefresh}/>
                </div>
                <div style={_l(styles.flex1s)}>
                    {renderProjects(this.props.projects)}
                </div>
            </div>
        );
    }
}

class TagsNavigation extends React.Component {

    render() {
        const tags = this.props.tags.map((item, idx) => {
            return (
                <div
                    key={item.name}
                    style={_l(styles.one_nav, styles.hflex, styles.hbar)}
                    onClick={(e) => {
                        this.props.onClick(item, e);
                    }}
                >
                    <Text style={[styles.flex1]}>{item.name}</Text>
                    <Text style={[styles.flex0]}>{item.count}</Text>
                </div>
            );
        });
        return (
            <div style={_l(styles.vproxy)}>
                <div style={_l(styles.flex0, styles.hflex, styles.hbar)}>
                    <Text style={[styles.flex1]}>Tags</Text>
                    <IconBtn icon="refresh" onClick={this.props.onRefresh}/>
                </div>
                <div style={_l(styles.flex1s)}>
                    {tags}
                </div>
            </div>
        );
    }
}

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
                <ProjectsNavigation
                    onRefresh={this.props.onRefreshProjects}
                    onClick={this.props.onProjectClick}
                    projects={this.props.projects || []}
                />
                <TagsNavigation
                    onRefresh={this.props.onRefreshTags}
                    onClick={this.props.onTagClick}
                    tags={this.props.tags || []}
                />
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
        const reports = this.props.reports.map((item, idx) => {
            const onClick = () => {
                this.props.onClick(item);
            };
            return (
                <div
                    style={_l(styles.one_nav)}
                    key={idx}
                    onClick={onClick}
                >
                    <Text style={[styles.oneLine]}>{item.name}</Text>
                    <Text style={[styles.oneLine, styles.textSmall]}>{item.title}</Text>
                </div>
            )
        });
        return (
            <div style={_l(st)}>
                <div style={_l(styles.flex0, styles.hflex, styles.hbar)}>
                    <Text style={[styles.flex1]}>Reports</Text>
                    <IconBtn icon="refresh" onClick={this.props.onRefresh}/>
                </div>
                <div style={_l(styles.flex1s)}>
                    {reports}
                </div>
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
        const e = eventInfo(evt);
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
                        <Text>{this.props.title}</Text>
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
                        <IconBtn icon="check" onClick={(e) => {
                            this.finish(true, e);
                        }}/>
                        <IconBtn icon="close" onClick={(e) => {
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
        if (success && !keepOpen) { // Close
            this.setState({
                input: undefined,
            });
        };
    }

    render() {
        const {pages, page, onNavigation} = this.props;
        const {input} = this.state;
        const pageCmps = pages.map((pageCmp, idx) => {
            if (pageCmp.key == page) { // Visible
                return (<div key={pageCmp.key} style={_l(styles.vproxy)}>{pageCmp.cmp}</div>);
            } else { // Hidden
                return (<div key={pageCmp.key} style={_l(styles.none)}>{pageCmp.cmp}</div>);
            };
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
                />
            );
        };
        return (
            <div style={_l(styles.vproxy, styles.tasks)}>
                <div style={_l(styles.vproxy)}>
                    {pageCmps}
                </div>
                <div style={_l(styles.flex0, styles.hflex, styles.hbar)}>
                    <div style={_l(styles.flex0, styles.hbar)}>
                        <IconBtn icon="chevron-left" onClick={() => {
                            onNavigation(-1);
                        }}/>
                    </div>
                    <div style={_l(styles.flex1, styles.textCenter, styles.textSmall)}>
                        {pageIndicators}
                    </div>
                    <div style={_l(styles.flex0, styles.hbar)}>
                        <IconBtn icon="chevron-right" onClick={() => {
                            onNavigation(1);
                        }}/>
                    </div>
                </div>
                {inputCmp}
            </div>
        );
    }
};

class TaskPageInput extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            report: props.report || '',
            filter: props.filter || '',
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

    render() {
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
                <IconBtn icon="plus" onClick={this.props.onAdd}/>
                <IconBtn icon="refresh" onClick={this.props.onRefresh}/>
                <IconBtn icon="close" onClick={this.props.onClose}/>
            </div>
        );
        const line2 = (
            <div style={_l(styles.flex0, styles.hflex)}>
                <input
                    style={_l(styles.inp, styles.flex1)}
                    type="search"
                    value={this.state.filter}
                    onChange={this.onFilterChange.bind(this)}
                    onKeyPress={this.onKey.bind(this)}
                    placeholder="Filter"
                />
            </div>
        );

        return (
            <div style={_l(styles.flex0)}>
                {line1}
                {line2}
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

    filter(filter) {
        this.state.filter = filter;
        this.setState({
            filter: filter,
        });
    }

}

export class TaskPageCmp extends React.Component {

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
            onEdit,
        } = this.props;
        let body = null;
        if (info) {
            // Render header
            const cols = info.cols.filter((item) => {
                return item.visible;
            });
            const header_items = cols.map((item, idx) => {
                if (item.field == 'description') {
                    // Insert spacer
                    return (<div key={idx} style={_l(styles.spacer)}></div>);
                }
                return (<Text editable={false} width={item.width} key={idx}>{item.label}</Text>);
            });
            const tasks = info.tasks.map((item, idx) => {
                const onDone = (e) => {
                    if (e.ctrl) { // Add annotation
                        return onEdit(item, 'annotate', '');
                    };
                    this.props.onDone(item);
                };
                const onDelete = (e) => {
                    onEdit(item, 'delete', '', true);
                };
                const onAnnDelete = (text, e) => {
                    onEdit(item, 'denotate', text, true);
                };
                const onClick = (e, data, cmd='modify') => {
                    onEdit(item, cmd, data);
                };

                return (
                    <Task
                        task={item}
                        key={idx}
                        cols={cols}
                        onDone={onDone}
                        onClick={onClick}
                        onDelete={onDelete}
                        onAnnDelete={onAnnDelete}
                    />
                );
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
                <TaskPageInput
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

    showMessage(type, message, resp) {
        if (!message) {
            return false;
        }
        if (type == 'question') {
            const fl = {
                type: type,
                message: message,
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
                return (
                    <div key={idx} style={_l(styles.floatBlock)}>
                        <Text>{item.message}</Text>
                        <div style={_l(styles.hflex)}>
                            <div style={_l(styles.spacer)}></div>
                            <IconBtn icon="check" onClick={() => {
                                this.hideFloat(item);
                                item.resp(true);
                            }}/>
                            <IconBtn icon="close" onClick={() => {
                                this.hideFloat(item);
                                item.resp(false);
                            }}/>
                        </div>
                    </div>
                );
            }
            return (
                <div key={idx} style={_l(styles.floatBlock)} onClick={() => {
                    this.hideFloat(item);
                }}>
                    <Text>{item.message}</Text>
                </div>
            );
        });
        let time = null;
        if (this.state.time) {
            time = (
                <Text style={[styles.oneLine, styles.flex0, styles.textSmall]}>
                    {this.state.time.toLocaleTimeString()}:
                </Text>
            );
        }
        return (
            <div style={_l(styles.flex0, styles.hflex, styles.hbar, styles.statusbar)}>
                <div style={_l(styles.floatBR)}>
                    {floats}
                </div>
                <div style={_l(styles.flex0)}>
                    <i className={spinCls}></i>
                </div>
                {time}
                <Text
                    style={[styles.oneLine, styles.flex1, styles.textSmall]}
                >
                    {this.state.message}
                </Text>
            </div>
        );
    }
}
