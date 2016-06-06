import React from 'react';
import {styles, _l} from '../styles/main';
import * as widget from './widget';

class Task extends widget.DnD {

    constructor(props) {
        super(props);
        this.dropTypes.push('tw/tag', 'tw/project', 'tw/task');
        this.state = {
            dependsVisible: false,
        };
    }

    onDropHandler(type, data) {
        this.props.onDrop(type, data);
    }

    toggleDepends() {
        this.setState({
            dependsVisible: !this.state.dependsVisible,
        });
    }

    render() {
        const {
            cols,
            task,
            style,
            running,
            onDone,
            onClick,
            onDelete,
            onAnnDelete,
            onDepDelete,
            onAnnAdd,
            onStartStop,
            onTap,
        } = this.props;
        const {dragTarget, dependsVisible} = this.state;
        let desc_field = 'description'
        const fields = cols.map((item, idx) => {
            if (item.field == 'description') { // Separator
                desc_field = item.full;
                return (<widget.Div key={idx} style={_l(styles.spacer)}></widget.Div>);
            }
            const val = task[`${item.full}_`] || '';
            const editable = task[`${item.field}_ro`]? false: true;
            const onFieldClick = (e) => {
                if (item.field == 'depends' && task.dependsList) { // Toggle
                    this.toggleDepends();
                };
            };
            return (
                <widget.Text
                    editable={editable}
                    width={item.width}
                    title={task[`${item.field}_title`]}
                    key={item.full}
                    onEdit={(e) => {
                        e.field = item.field;
                        const edit_val = task[`${item.field}_edit`] || '';
                        onClick(e, edit_val);
                    }}
                    onClick={onFieldClick}
                >
                    {val}
                </widget.Text>
            );
        });
        let descSt = [styles.description, styles.flex1];
        if (task.description_truncate) {
            descSt.push(styles.oneLine);
        }
        let desc_count = null;
        if (task.description_count) {
            desc_count = (
                <widget.Text style={[styles.description]}>
                    {task.description_count}
                </widget.Text>
            );
        }
        let depends = null;
        if (dependsVisible && task.dependsTasks) { // Render tasks
            depends = task.dependsTasks.map((item) => {
                return (
                    <widget.Div style={_l(styles.hflex, styles.annotation_line)} key={item.unique}>
                        <widget.Text
                            title={item.description}
                            style={[styles.flex1, styles.description, styles.textSmall, styles.oneLine]}
                            >
                            {`${item.id} ${item.description}`}
                        </widget.Text>
                        <widget.IconMenu style={style}>
                            <widget.IconBtn
                                icon="close"
                                onClick={(e) => {
                                    onDepDelete(item.uuid, e);
                                }}
                                title="Remove dependency"
                            />
                        </widget.IconMenu>
                    </widget.Div>
                );
            });
        };
        let annotations = null;
        if (task.description_ann) { // Have list
            annotations = task.description_ann.map((item, idx) => {
                return (
                    <widget.Div
                        style={_l(styles.hflex, styles.annotation_line)}
                        key={item.unique}
                    >
                        <widget.Text
                            title={item.title}
                            style={[styles.flex1, styles.description, styles.textSmall]}
                            >
                            {item.text}
                        </widget.Text>
                        <widget.IconMenu style={style}>
                            <widget.IconBtn
                                icon="close"
                                onClick={(e) => {
                                    onAnnDelete(item.origin, e);
                                }}
                                title="Remove annotation"
                            />
                        </widget.IconMenu>
                    </widget.Div>
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
        let taskStyles = [styles.one_task];
        if (dragTarget) { // As target
           taskStyles.push(styles.task_drop);
        };
        taskStyles = taskStyles.concat(style);
        return (
            <widget.Div
                style={_l(taskStyles)}
                onClick={(e) => {
                    onTap(widget.eventInfo(e));
                }}
                onDragEnter={this.onDragStart}
                onDragLeave={this.onDragFinish}
                onDragOver={this.onDragOver}
                onDrop={this.onDrop}
            >
                <widget.Div style={_l(styles.hflex)}>
                    <widget.IconBtn
                        icon={check_icon}
                        onClick={onDone}
                    />
                    <widget.Text
                        editable
                        style={descSt}
                        onDrag={(e) => {
                            return ['tw/task', task.uuid, task.description];
                        }}
                        onEdit={(e) => {
                            onClick(e, task.description);
                        }}
                    >
                        {task[`${desc_field}_`]}
                    </widget.Text>
                    {desc_count}
                    <widget.IconMenu style={style}>
                        <widget.IconBtn
                            icon="close"
                            onClick={(e) => {
                                onDelete(e);
                            }}
                            title="Delete task"
                        />
                        <widget.IconBtn
                            icon="plus"
                            onClick={(e) => {
                                onAnnAdd(e);
                            }}
                            title="Add annotation"
                        />
                        <widget.IconBtn
                            icon={running? 'stop': 'play'}
                            onClick={(e) => {
                                onStartStop(e);
                            }}
                            title={running? "Stop task": "Start task"}
                        />
                    </widget.IconMenu>
                </widget.Div>
                <widget.Div style={_l(styles.hflex, styles.wflex)}>
                    {fields}
                </widget.Div>
                {depends}
                {annotations}
            </widget.Div>
        );
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

    renderTask(item, idx, cols) {
        const {
            selection,
            onEdit,
            onSelect,
            onAdd,
        } = this.props;
        const running = item.start? true: false;
        const onDone = (e) => {
            if (e.longTap || e.meta) { // Do as select
                onSelect(item);
                e.stop && e.stop();
                return;
            };
            this.props.onDone(item);
        };
        const onAnnAdd = (e) => {
            onEdit(item, 'annotate', '');
        };
        const onDelete = (e) => {
            onEdit(item, 'delete', '', true);
        };
        const onAnnDelete = (text, e) => {
            onEdit(item, 'denotate', text, true);
        };
        const onClick = (e, data, cmd='modify') => {
            if (e.meta) {
                let addCmd = data;
                if (e.field == 'id') {
                    addCmd = `depends:${item.id || item.uuid}`;
                }
                onAdd(e, addCmd);
                e.stop();
                return;
            }
            onEdit(item, cmd, data);
        };
        const onTap = (e) => {
            if (e.meta) {
                onSelect(item);
            }
        };
        const onDepDelete = (uuid, e) => {
            let uuids = item.depends || [];
            const dep = uuids.map((u) => u != uuid? u: `-${u}`).join(',')
            onEdit(item, 'modify', `depends:${dep}`, true);
        };
        const onDrop = (type, data) => {
            if (type == 'tw/tag') { // Drop tag - add tag
                onEdit(item, 'modify', `+${data}`, true);
            };
            if (type == 'tw/project') { // Drop project - set project
                onEdit(item, 'modify', `pro:${data}`, true);
            };
            if (type == 'tw/task') { // Drop task - add dependency
                let uuids = item.depends || [];
                if (uuids.indexOf(data) != -1 || item.uuid == data) { // Already or invalid
                    return;
                };
                uuids.push(data);
                onEdit(item, 'modify', `depends:${uuids.join(',')}`, true);
            };
        };
        let style = [styles.one_item];
        if (item.styles) { // Append
            style.push.apply(style, item.styles);
        };
        if (selection[item.uuid]) {
            style.push(styles.task_selected);
        }
        return (
            <Task
                task={item}
                running={running}
                style={style}
                key={idx}
                cols={cols}
                onDone={onDone}
                onClick={onClick}
                onDelete={onDelete}
                onAnnDelete={onAnnDelete}
                onAnnAdd={onAnnAdd}
                onTap={onTap}
                onStartStop={(e) => {
                    onEdit(item, running? 'stop': 'start', '', true);
                }}
                onDrop={onDrop}
                onDepDelete={onDepDelete}
            />
        );

    }

    render() {
        const {
            info,
            selection,
            onEdit,
            onSelect,
            onAdd,
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
                    return (<widget.Div key={idx} style={_l(styles.spacer)}></widget.Div>);
                }
                return (
                    <widget.Text
                        editable={false}
                        width={item.width}
                        key={idx}
                    >
                        {item.label}
                    </widget.Text>
                );
            });
            // Render tasks
            body = this.renderBody(header_items, info);
        }
        return (
            <widget.Div style={_l(styles.vproxy)}>
                <widget.TaskPageInput
                    {...this.props}
                    ref="input"
                />
                <widget.Div style={_l(styles.vproxy)}>
                    {body}
                </widget.Div>
            </widget.Div>
        );
    }
}

export class ProjectsNavigation extends React.Component {

    constructor(props) {
        super(props);
        this.state = {list: this.convert(props)};
    }

    renderList(list) {
        return null;
    }

    convert(props) {
        const {projects, info} = props;
        let hilites = {};
        if (info && info.tasks) { // Have something
            info.tasks.forEach((item) => {
                if (item.project) {
                    const val = hilites[item.project] || 0;
                    hilites[item.project] = val+1;
                }
            });
        };
        let list = [];
        const transformProjects = (arr) => {
            arr.map((item, idx) => {
                item.hilite = hilites[item.project];
                item.index = idx;
                return item;
            }).sort((a, b) => {
                if (!a.project && b.project) return -1;
                if (!b.project && a.project) return  1;
                if (a.hilite && !b.hilite) return -1;
                if (!a.hilite && b.hilite) return 1;
                return a.index-b.index;
            }).forEach((item, idx) => {
                list.push(item);
                transformProjects(item.children);
            });
        };
        transformProjects(projects);
        return list;
    }

    componentWillReceiveProps(props) {
        this.setState({list: this.convert(props)});
    }

    render() {
        const projects = this.state.list;
        if (!projects.length || (projects.length == 1 && projects[0].project == '')) {
            // No projects
            return null;
        }
        return (
            <widget.Div style={_l(styles.vproxy)}>
                <widget.Div style={_l(styles.flex0, styles.hflex, styles.hbar)}>
                    <widget.Text style={[styles.flex1]}>Projects</widget.Text>
                    <widget.IconBtn
                        icon="refresh"
                        title="Refresh list"
                        onClick={this.props.onRefresh}
                    />
                </widget.Div>
                {this.renderList(projects)}
            </widget.Div>
        );
    }
}

export class TagsNavigation extends React.Component {

    constructor(props) {
        super(props);
        this.state = {tags: this.convert(props)};
    }

    convert(props) {
        const {info, tags} = props;
        let hilites = {};
        if (info && info.tasks) { // Have something
            info.tasks.forEach((item) => {
                if (item.tags) {
                    item.tags.forEach((tag) => {
                        const val = hilites[tag] || 0;
                        hilites[tag] = val+1;
                    })
                }
            });
        };
        return tags.map((item, idx) => {
            item.hilite = hilites[item.name];
            item.index = idx;
            return item;
        }).sort((a, b) => {
            if (a.hilite && !b.hilite) return -1;
            if (!a.hilite && b.hilite) return 1;
            return a.index-b.index;
        });
    }

    componentWillReceiveProps(props) {
        this.setState({
            tags: this.convert(props),
        });
    }

    render() {
        const {tags} = this.state;
        if (!tags.length) {
            return null; // Hide
        }
        return (
            <widget.Div style={_l(styles.vproxy)}>
                <widget.Div style={_l(styles.flex0, styles.hflex, styles.hbar)}>
                    <widget.Text style={[styles.flex1]}>Tags</widget.Text>
                    <widget.IconBtn
                        icon="refresh"
                        onClick={this.props.onRefresh}
                        title="Refresh list"
                    />
                </widget.Div>
                {this.renderList(tags)}
            </widget.Div>
        );
    }

}

export const ReportsList = React.createClass({
    render() {
        const reports = this.props.reports.map((item, idx) => {
            const onClick = () => {
                this.props.onClick(item);
            };
            return (
                <widget.Div
                    style={_l(styles.one_nav)}
                    key={idx}
                    onClick={onClick}
                >
                    <widget.Text style={[styles.oneLine]}>{item.name}</widget.Text>
                    <widget.Text style={[styles.oneLine, styles.textSmall]}>{item.title}</widget.Text>
                </widget.Div>
            )
        });
        return (
            <widget.Div style={_l(styles.vproxy)}>
                <widget.Div style={_l(styles.flex0, styles.hflex, styles.hbar)}>
                    <widget.Text style={[styles.flex1]}>Reports</widget.Text>
                    <widget.IconBtn
                        icon="refresh"
                        onClick={this.props.onRefresh}
                        title="Refresh list"
                    />
                </widget.Div>
                <widget.Div style={_l(styles.flex1s)}>
                    {reports}
                </widget.Div>
            </widget.Div>
        );
    },
});

export const ContextsList = React.createClass({
    render() {
        const {contexts, onRefresh, onClick} = this.props;
        if (!contexts) {
            return null; // Hide
        }
        const list = contexts.map((item, idx) => {
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
            <widget.Div style={_l(styles.flex0, styles.vflex)}>
                <widget.Div style={_l(styles.flex0, styles.hflex, styles.hbar)}>
                    <widget.Text style={[styles.flex1]}>Contexts</widget.Text>
                    <widget.IconBtn
                        icon="refresh"
                        onClick={onRefresh}
                        title="Refresh list"
                    />
                </widget.Div>
                {list}
            </widget.Div>
        );
    },
});

