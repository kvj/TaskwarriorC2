import React from 'react';
import ReactDOM from 'react-dom';
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
    const val = props.children || '';
    let sfx = ''
    while (props.width > val.length+sfx.length) {
        sfx += ' ';
    }
    return (
        <div style={_l(_st)} title={props.title || val}>
            <span className="text">{val}</span>
            <span>{sfx}</span>
        </div>
    );
}

class Task extends React.Component {

    render() {
        const {cols, task, onDone} = this.props;
        const fields = cols.map((item, idx) => {
            if (item.field == 'description') { // Separator
                return (<div key={idx} style={_l(styles.spacer)}></div>);
            }
            const val = task[`${item.field}_`] || '';
            return (<Text width={item.width} key={idx}>{val}</Text>);
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

export class MainCmp extends React.Component {

    render() {
        const {pages, page, onNavigation} = this.props;
        const pageCmps = pages.map((pageCmp, idx) => {
            if (pageCmp.key == page) { // Visible
                return (<div key={pageCmp.key} style={_l(styles.vproxy)}>{pageCmp.cmp}</div>);
            } else { // Hidden
                return (<div key={pageCmp.key} style={_l(styles.none)}>{pageCmp.cmp}</div>);
            };
        });
        return (
            <div style={_l(styles.vproxy, styles.tasks)}>
                <div style={_l(styles.vproxy)}>
                    {pageCmps}
                </div>
                <div style={_l(styles.flex0, styles.hflex)}>
                    <div style={_l(styles.flex0, styles.hbar)}>
                        <IconBtn icon="chevron-left" onClick={() => {
                            onNavigation(-1);
                        }}/>
                    </div>
                    <div style={_l(styles.flex1, styles.hbar)}>
                    </div>
                    <div style={_l(styles.flex0, styles.hbar)}>
                        <IconBtn icon="chevron-right" onClick={() => {
                            onNavigation(1);
                        }}/>
                    </div>
                </div>
            </div>
        );
    }
};

export class TaskPageCmp extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    onKey(evt) {
        if (evt.charCode == 13) {
            // Refresh
            this.props.onRefresh();
        }
    }

    render() {
        const {
            info,
            onRefresh,
            controller,
            onReportChange,
            onFilterChange,
            onClose,
        } = this.props;
        const line1 = (
            <div style={_l(styles.flex0, styles.hflex, styles.wflex)}>
                <input
                    style={_l(styles.inp, styles.flex1)}
                    type="text"
                    value={this.props.report}
                    onChange={onReportChange}
                    onKeyPress={this.onKey.bind(this)}
                    placeholder="Report"
                />
                <IconBtn icon="plus"/>
                <IconBtn icon="refresh" onClick={onRefresh}/>
                <IconBtn icon="close" onClick={onClose}/>
            </div>
        );
        const line2 = (
            <div style={_l(styles.flex0, styles.hflex)}>
                <input
                    style={_l(styles.inp, styles.flex1)}
                    type="text"
                    value={this.props.filter}
                    onChange={onFilterChange}
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
            const header_items = cols.map((item, idx) => {
                if (item.field == 'description') {
                    // Insert spacer
                    return (<div key={idx} style={_l(styles.spacer)}></div>);
                }
                return (<Text width={item.width} key={idx}>{item.label}</Text>);
            });
            const tasks = info.tasks.map((item, idx) => {
                const onDone = () => {
                    this.props.onDone(item);
                };

                return (
                    <Task
                        task={item}
                        key={idx}
                        cols={cols}
                        onDone={onDone}
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
                {line1}
                {line2}
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
