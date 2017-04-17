import React from 'react';
import {styles, _l} from '../styles/main';
import * as widget from './widget';

class Task extends widget.DnD {

    constructor(props) {
        super(props);
        this.dropTypes.push('tw/tag', 'tw/project', 'tw/task', 'tw/date');
        this.state = {
            dependsVisible: false,
        };
    }

    onDropHandler(type, data, e) {
        this.props.onDrop(type, data, e);
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
            onMultiEdit,
            onDelete,
            onAnnDelete,
            onAnnModify,
            onDepDelete,
            onAnnAdd,
            onStartStop,
            onTap,
            expanded,
            layout,
        } = this.props;
        const {dragTarget, dependsVisible} = this.state;
        let desc_field = 'description';
        let multiline = [];
        let multilineBtn = [];
        const fields = cols.map((item, idx) => {
            if (item.field == 'description') { // Separator
                desc_field = item.full;
                return (<widget.Div key={idx} style={_l(styles.spacer)}></widget.Div>);
            }
            if (item.multiline) { // Render as multiline field
                const lines = task[`${item.full}_lines`];
                multilineBtn.push(
                    <widget.IconBtn
                        icon="pencil"
                        key={`${item.full}-btn`}
                        onClick={(e) => {
                            onMultiEdit(item.field, task[item.field], e);
                        }}
                        title={item.label}
                    />
                );
                const _lines = lines.map((l, lidx) => {
                    let editBtn = null;
                    return (
                        <widget.Div
                            style={_l(styles.hflex, styles.annotation_line)}
                            key={`${item.full}-${lidx}`}
                        >
                            <widget.Text
                                title={l}
                                style={[styles.flex1, styles.description, styles.textSmall]}
                            >
                                {l}
                            </widget.Text>
                        </widget.Div>
                    );
                });
                // console.log('Multi:', lines, item);
                multiline.push(_lines);
                return null;
            };
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
                            editable
                            onEdit={(e) => {
                                onAnnModify(item.origin, e);
                            }}
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
        if (task.level > 0) { // Add margin
            taskStyles.push({
                marginLeft: task.level * 15,
            });
        };
        const menuStyles = [styles.task_menu].concat(style);
        let expandedPart;
        if (expanded) {
            expandedPart = (
                <widget.Div>
                    <widget.Div style={_l(styles.hflex, styles.wflex)}>
                        {fields}
                    </widget.Div>
                    {multiline}
                    {depends}
                    {annotations}
                </widget.Div>
            );
        };
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
                        onClick={(e) => {
                            if (e.meta) { // Start annotation add
                                e.stop();
                                onAnnAdd(e);
                            };
                        }}
                        onEdit={(e) => {
                            onClick(e, task.description);
                        }}
                    >
                        {task[`${desc_field}_`]}
                    </widget.Text>
                    {desc_count}
                    <widget.IconMenu style={menuStyles}>
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
                        {multilineBtn}
                    </widget.IconMenu>
                </widget.Div>
                {expandedPart}
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

    renderTask(item, idx, cols, info) {
        const {
            selection,
            onEdit,
            onSelect,
            onAdd,
            layout,
            expanded,
        } = this.props;
        const findTask = (uuid) => {
            return info.tasks.find((t) => t.uuid == uuid);
        };
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
            onEdit(item, 'annotate', '', false, true);
        };
        const onDelete = (e) => {
            onEdit(item, 'delete', '', true);
        };
        const onAnnDelete = (text, e) => {
            onEdit(item, 'denotate', text, true);
        };
        const onAnnModify = (text, e) => {
            onEdit(item, 'reannotate', text, false, true);
        };
        const onClick = (e, data, cmd='modify') => {
            if (e.meta) {
                let addCmd = data;
                if (e.field == 'id') {
                    addCmd = `depends:${item.id || item.uuid}`;
                }
                onAdd(false, addCmd);
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
        const onDrop = (type, data, e) => {
            if (type == 'tw/date') { // Drop date
                onEdit(item, 'modify', data, true);
            }
            if (type == 'tw/tag') { // Drop tag - add tag
                onEdit(item, 'modify', `+${data}`, true);
            };
            if (type == 'tw/project') { // Drop project - set project
                onEdit(item, 'modify', `pro:${data}`, true);
            };
            if (type == 'tw/task') { // Drop task - add dependency
                const t = findTask(data);
                if (!t) return;
                let uuids = t.depends || [];
                if (uuids.indexOf(item.uuid) != -1 || item.uuid == data) { // Already or invalid
                    return;
                };
                uuids.push(item.uuid);
                onEdit(t, 'modify', `depends:${uuids.join(',')}`, true);
            };
        };
        const onMultiEdit = (field, lines) => {
            onEdit(item, `${field}:`, lines, false, true);
        };
        let style = [styles.one_item];
        if (item.styles) { // Append
            style.push.apply(style, item.styles);
        };
        if (selection[item.uuid]) {
            style.push(styles.task_selected);
        }
        const key = `${item.uuid || item.id}-${idx}`;
        return (
            <Task
                task={item}
                running={running}
                style={style}
                layout={layout}
                expanded={expanded}
                key={key}
                cols={cols}
                onDone={onDone}
                onClick={onClick}
                onMultiEdit={onMultiEdit}
                onDelete={onDelete}
                onAnnDelete={onAnnDelete}
                onAnnModify={onAnnModify}
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
            loading,
            expanded,
        } = this.props;
        let body = null;
        if (info) {
            // Render header
            const cols = info.cols.filter((item) => {
                return item.visible;
            });
            let header_items;
            if (expanded) {
                header_items = cols.map((item, idx) => {
                    if (item.multiline) { // Skip
                        return null;
                    };
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
            };
            // Render tasks
            body = this.renderBody(header_items, info);
        }
        let loadingIndicator;
        if (loading) { // Show it
            loadingIndicator = (<widget.LoadingIndicator />);
        };
        return (
            <widget.Div style={_l(styles.vproxy, styles.pane)}>
                <widget.TaskPageInput
                    {...this.props}
                    ref="input"
                />
                <widget.Div style={_l(styles.vproxy, styles.paneBody)}>
                    {body}
                </widget.Div>
                {loadingIndicator}
            </widget.Div>
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

    renderBody(info) {
        return null;
    }

    render() {
        const {
            info,
            loading,
        } = this.props;
        let body = null;
        body = this.renderBody(info);
        let loadingIndicator;
        if (loading) { // Show it
            loadingIndicator = (<widget.LoadingIndicator />);
        };
        return (
            <widget.Div style={_l(styles.vproxy, styles.pane)}>
                <widget.CmdPageInput
                    {...this.props}
                    ref="input"
                />
                <widget.Div style={_l(styles.vproxy, styles.paneBody)}>
                    {body}
                </widget.Div>
                {loadingIndicator}
            </widget.Div>
        );
    }
}

class Navigation extends React.Component {

    constructor(props) {
        super(props);
        this.state = {list: this.convert(props)};
    }

    renderList(list) {
        return null; // Implement me
    }

    convert(props) {
        return []; // Implement me
    }

    componentWillReceiveProps(props) {
        this.setState({list: this.convert(props)});
    }

    render() {
        if (!this.props.visible) { // Hidden
            return null;
        };
        const list = this.state.list;
        if (!list.length) {
            // No items
            return null;
        }
        const {title, onRefresh, onExpand, compact, expanded} = this.props;
        let expandBtn;
        if (expanded === false || expanded === true) { // Toggle
            expandBtn = (
                <widget.IconBtn
                    icon={expanded? 'compress': 'expand'}
                    title="Collapse/expand list"
                    onClick={onExpand}
                />
            );
        };
        return (
            <widget.Div style={_l(styles.vflex, compact? styles.flex0: styles.flex1)}>
                <widget.Div style={_l(styles.flex0, styles.hflex, styles.hbar, styles.paneTitle)}>
                    <widget.Text style={[styles.flex1]}>{title}</widget.Text>
                    {expandBtn}
                    <widget.IconBtn
                        icon="refresh"
                        title="Refresh list"
                        onClick={onRefresh}
                    />
                </widget.Div>
                {this.renderList(list)}
            </widget.Div>
        );
    }
}

export class ProjectsNavigation extends Navigation {

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
            }).forEach((item, idx) => {
                list.push(item);
                transformProjects(item.children);
            });
        };
        transformProjects(projects);
        return list;
    }

    render() {
        const projects = this.state.list;
        if (!projects.length || (projects.length == 1 && projects[0].project == '')) {
            // No projects
            return null;
        }
        return super.render();
    }
}

export class TagsNavigation extends Navigation {

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
        });
    }

}

export class ReportsList extends Navigation {
    convert(props) {
        return props.reports;
    }
}

export class ContextsList extends Navigation {
    convert(props) {
        return props.contexts || []; // Can be empty
    }
}

export class CalendarPane extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const {title, data, onChange, onClick, onDrag} = this.props;
        const header = (
            <widget.Div style={_l(styles.vflex)}>
                <widget.Div style={_l(styles.flex0, styles.hflex, styles.hbar, styles.paneTitle)}>
                    <widget.Text
                        style={[styles.flex1]}
                        onClick={(e) => {
                            onChange(0);
                        }}
                        title="Jump to current month"
                    >
                        {title}
                    </widget.Text>
                    <widget.IconBtn
                        icon="chevron-left"
                        title="Month before"
                        onClick={(e) => {
                            return onChange(-1, e.meta);
                        }}
                    />
                    <widget.IconBtn
                        icon="chevron-right"
                        title="Next month"
                        onClick={(e) => {
                            return onChange(1, e.meta);
                        }}
                    />
                </widget.Div>
            </widget.Div>
        );
        const weeks = data.map((week, widx) => {
            const days = week.map((day, didx) => {
                let style = [styles.flex1, styles.calendar_day, styles.textSmall];
                if (!day.active) style.push(styles.calendar_passive);
                if (day.weekend) style.push(styles.calendar_weekend);
                return (
                    <widget.CalendarItem
                        key={didx}
                        style={style}
                        value={day.date}
                        onDrag={onDrag}
                        onClick={(e) => {
                            onClick(day.date, e.meta);
                        }}
                    >
                        {day.day}
                    </widget.CalendarItem>
                );
            });
            return (
                <widget.Div key={widx} style={_l(styles.hflex, styles.calendar_week)}>
                    {days}
                </widget.Div>
            );
        });
        return (
            <widget.Div>
                {header}
                {weeks}
            </widget.Div>
        );
    }
}
