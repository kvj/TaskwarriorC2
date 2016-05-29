// High level React components

import React from 'react';
import {styles, _l} from '../styles/main';
import * as cmp from './cmp';

export class AppPane extends React.Component {

    constructor(props) {
        super(props);
    }

    async componentDidMount() {
        let conf = await this.props.controller.config('default.command');
        const defaultCmd = conf['default.command'] || 'next';
        conf = await this.props.controller.config('ui.pane.', true);
        this.state = {
            pages: [],
            defaultCmd: defaultCmd,
            panes: {
                navigation: conf.navigation || 'dock',
                reports: conf.reports || 'dock',
            },
            pins: [],
        };
        this.showPage({
            type: 'list',
            report: this.state.defaultCmd,
            filter: '',
        });
    }

    hidePane(pane) {
        let {panes} = this.state;
        let state = panes[pane];
        if (state != 'float') return;
        panes[pane] = 'hidden';
        this.setState({
            panes,
        });
    }

    togglePane(pane) {
        let state = this.state.panes[pane];
        if (!state) return;
        if (state == 'dock') { // Hide
            state = 'hidden';
        } else if (state == 'hidden') {
            state = 'float';
        } else {
            state = 'dock';
        }
        this.state.panes[pane] = state;
        this.setState({
            panes: this.state.panes,
        });
    }

    checkActive(key) {
        const page = this.current(key);
        if (page && (this.state.page == key || page.pin)) {
            return page;
        };
        return undefined;
    }

    onCommand() {
        this.showPage({
            cmd: '',
            type: 'cmd',
        });
    }

    onAdd(key, filter) {
        let input = '';
        if (filter) input = `${filter} `;
        this.refs.main.showInput('add', input, {
            cmd: 'add',
        });
    }

    onEdit(key, cmd, tasks, input, unint) {
        if (unint) { // Uninitended - run
            return this.processInput(input, {
                cmd: cmd,
                tasks: tasks,
            });
        };
        let title = cmd;
        if (tasks.length) { // Prepend number of tasks
            title = `{${tasks.length}} ${cmd}`;
        };
        this.refs.main.showInput(title, input, {
            cmd: cmd,
            tasks: tasks,
        });
    }

    async processInput(input, ctx) {
        return await this.props.controller.cmd(ctx.cmd, input, ctx.tasks);
    }

    onClose(key) {
        let {pages, pins} = this.state;
        let idx = pins.findIndex((item) => {
            return item.key == key;
        });
        if (idx != -1) { // Easy - remove pin
            pins.splice(idx, 1);
            this.setState({pins});
            return idx;
        };
        idx = pages.findIndex((item) => {
            return item.key == key;
        });
        if (idx != -1) { // Not last
            pages.splice(idx, 1);
            if (idx > 0) idx--;
            const page = pages[idx];
            this.state.page = (page || {}).key;
            this.setState({
                pages: pages,
                page: this.state.page,
            });
            if (page && page.ref) { // Refresh currently visible
                page.ref.refresh();
                return idx;
            };
        };
        return -1;
    }

    onRefreshed(key, info) {
        const page = this.checkActive(key);
        if (page && !page.pin) { // Refresh navigation
            this.refs.navigation.hilite(info);
        };
    }

    showPage(page) {
        let {pages} = this.state;
        let item = pages.find((item) => {
            return item.type == page.type && item.ref.same(page);
        });
        if (!item) { // Add new
            let paneCmp = null;
            const key = Date.now();
            let props = {
                id: key,
                key: key,
                pin: false,
                ref: (ref) => {
                    item.ref = ref;
                },
                controller: this.props.controller,
                onClose: this.onClose.bind(this),
                checkActive: this.checkActive.bind(this),
                onRefreshed: this.onRefreshed.bind(this),
                onPin: this.togglePin.bind(this),
            };
            if (page.type == 'list') { // Create list
                paneCmp = (
                    <TasksPagePane
                        {...props}
                        report={page.report}
                        filter={page.filter}
                        onAdd={this.onAdd.bind(this)}
                        onEdit={this.onEdit.bind(this)}
                    />
                );
            };
            if (page.type == 'cmd') { // Create cmd pane
                paneCmp = (
                    <CmdPagePane
                        {...props}
                        cmd={page.cmd}
                    />
                );
            }
            if (!paneCmp) { // Invalid
                console.log('Invalid');
                return;
            };
            let item = {
                key: key,
                type: page.type,
                cmp: paneCmp,
            };
            pages.push(item);
            this.setState({
                pages: pages,
                page: key,
            });
        } else {
            this.setState({
                page: item.key,
            });
        }
    }

    togglePin(key) {
        let page = this.current(key);
        let {pages, pins} = this.state;
        if (!page) return;
        page.pin = !page.pin;
        // console.log('Pin:', key, page.pin);
        if (page.pin) { // Remove from pages, add to pins
            this.onClose(key);
            pins.push(page);
        } else {
            pages.push(page);
            const idx = pins.findIndex((item) => {
                return item.key == key;
            });
            if (idx != -1) { // Splice
                pins.splice(idx, 1);
            };
            this.setState({
                pages,
                page: key,
            });
        }
        this.setState({pages, pins});
    }

    onNavigation(dir) {
        let {pages, page} = this.state;
        let idx = pages.findIndex((item) => {
            return item.key == page;
        });
        switch(dir) {
            case -1:
                if (idx > 0) idx -= 1;
                break;
            case 1:
                if (idx < pages.length-1) idx += 1;
                break;
        }
        this.setState({
            page: pages[idx].key,
        });
        pages[idx].ref.refresh();
    }

    async onContextClick(context) {
        await this.props.controller.setContext(context);
        this.refs.reports.refreshContexts();
    }

    onReportClick(report) {
        if (report.special) { //
            this.showPage({
                cmd: report.name,
                type: 'cmd',
            });
        } else {
            this.showPage({
                report: report.name,
                filter: '',
                type: 'list',
            });
        }
        this.hidePane('reports');
    }

    current(key=this.state.page) {
        let page = this.state.pages.find((item) => {
            return item.key == key;
        });
        if (page) return page;
        return this.state.pins.find((item) => {
            return item.key == key;
        });
    }

    onTagClick(tag) {
        const page = this.current();
        if (page && page.ref) {
            page.ref.filter(`+${tag.name}`);
        }
        this.hidePane('navigation');
    }

    onProjectClick(project) {
        const page = this.current();
        if (page && page.ref) {
            page.ref.filter(`pro:${project.project}`);
        }
        this.hidePane('navigation');
    }

    async onUndo() {
        return await this.props.controller.undo();
    }

    async onSync() {
        return await this.props.controller.sync();
    }

    render() {
        if (!this.state) return null;
        return (
            <cmp.AppCmp>
                <ToolbarPane
                    onCommand={this.onCommand.bind(this)}
                    onTogglePane={this.togglePane.bind(this)}
                    onUndo={this.onUndo.bind(this)}
                    onSync={this.onSync.bind(this)}
                />
                <CenterPane>
                    <MainPane
                        controller={this.props.controller}
                        pages={this.state.pages}
                        pins={this.state.pins}
                        page={this.state.page}
                        ref="main"
                        onNavigation={this.onNavigation.bind(this)}
                        onInput={this.processInput.bind(this)}
                    />
                    <NavigationPane
                        controller={this.props.controller}
                        onTagClick={this.onTagClick.bind(this)}
                        onProjectClick={this.onProjectClick.bind(this)}
                        ref="navigation"
                        mode={this.state.panes.navigation}
                        onHide={this.hidePane.bind(this)}
                    />
                    <ReportsPane
                        ref="reports"
                        controller={this.props.controller}
                        onReportClick={this.onReportClick.bind(this)}
                        onContextClick={this.onContextClick.bind(this)}
                        mode={this.state.panes.reports}
                        onHide={this.hidePane.bind(this)}
                    />
                </CenterPane>
                <StatusbarPane
                    controller={this.props.controller}
                />
            </cmp.AppCmp>
        );
    }
}

class ToolbarPane extends React.Component {

    render() {
        return (<cmp.ToolbarCmp {...this.props} />);
    }
}

class StatusbarPane extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.props.controller.events.on('notify:error', (err) => {
            this.refs.cmp.showMessage('error', err);
        });
        this.props.controller.events.on('notify:info', (msg) => {
            this.refs.cmp.showMessage('info', msg);
        });
        this.props.controller.events.on('question', (msg, choices, resp) => {
            this.refs.cmp.showMessage('question', msg, choices, resp);
        });
        this.props.controller.events.on('sync:start', () => {
            this.setState({
                spin: true,
            });
        });
        this.props.controller.events.on('sync:finish', () => {
            this.setState({
                spin: false,
            });
        });
    }

    render() {
        return (
            <cmp.StatusbarCmp
                ref="cmp"
                {...this.props}
                spin={this.state.spin}
            />
        );
    }
}

// Can be task list or task output or whatever
// Member of pages
class PagePane extends React.Component {

    constructor(props) {
        super(props);
        this.refreshHandler = this.onChanged.bind(this);
    }

    onClose() {
        this.props.onClose(this.props.id);
    }

    onPin() {
        this.props.onPin(this.props.id);
    }

    onChanged() {
        if (this.props.checkActive(this.props.id)) {
            this.refresh();
        };
    }

    componentDidMount() {
        this.props.controller.events.on('change', this.refreshHandler);
        this.refresh();
    }

    componentWillUnmount() {
        this.props.controller.events.removeListener('change', this.refreshHandler);
    }

}

class CmdPagePane extends PagePane {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        if (this.props.cmd) {
            this.run();
        }
    }

    input() {
        return this.refs.cmp.input();
    }

    same(page) {
        let data = this.input();
        return page.cmd === data.cmd;
    }

    filter(filter) {
        // this.refs.cmp.filter(filter);
        this.run();
    }

    render() {
        return (
            <cmp.CmdPageCmp
                {...this.props}
                ref="cmp"
                info={this.state.info}
                onRefresh={this.run.bind(this)}
                onClose={this.onClose.bind(this)}
                onPin={this.onPin.bind(this)}
            />
        );
    }

    refresh() {
    }

    async run() {
        const {controller, onRefreshed, id} = this.props;
        let data = this.input();
        let info = await controller.cmdRaw(data.cmd, (outp) => {
            this.setState({
                info: outp,
            });
        });
        if (info) {
            // Load data
            this.setState({
                info: info,
            });
            onRefreshed(id, info);
        }
    }
}

class TasksPagePane extends PagePane {

    constructor(props) {
        super(props);
        this.state = {
            selection: {},
        };
    }

    resetSelection() {
        this.setState({
            selection: {},
        });
    }

    select(task) {
        let {selection} = this.state;
        if (selection[task.uuid]) {
            // unselect
            selection[task.uuid] = false;
        } else {
            selection[task.uuid] = true;
        }
        this.setState({selection});
    }

    onAdd(e, ...cmds) {
        let cmd = [];
        const input = this.input().filter;
        if (input) cmd.push(input);
        cmds.forEach((item) => {
            if (item) cmd.push(item);
        });
        this.props.onAdd(this.props.id, cmd.join(' '));
    }

    onEdit(task, cmd, input, unint=false) {
        const {selection, info} = this.state;
        let tasks = [];
        if (info && info.tasks) {
            tasks = info.tasks.filter((item) => selection[item.uuid]);
        }
        if (!tasks.length || !tasks.includes(task)) {
            if (task) tasks = [task]; // Current
        }
        this.props.onEdit(this.props.id, cmd, tasks, input, unint);
    }

    filter(filter) {
        this.refs.cmp.filter(filter);
        this.refresh(true);
    }

    input() {
        return this.refs.cmp.input();
    }

    same(page) {
        let data = this.input();
        return page.filter === data.filter && page.report === data.report;
    }

    async onDone(task) {
        const {uuid, status} = task;
        if (['waiting', 'pending'].includes(status)) { // OK to done
            return this.onEdit(task, 'done', '', true);
        } else { // Show error
            return this.props.controller.err('Invalid task');
        };
    };

    render() {
        return (
            <cmp.TaskPageCmp
                {...this.props}
                filter={this.state.filter}
                ref="cmp"
                info={this.state.info}
                selection={this.state.selection}
                onRefresh={() => {
                    this.refresh(true);
                }}
                onDone={this.onDone.bind(this)}
                onClose={this.onClose.bind(this)}
                onAdd={this.onAdd.bind(this)}
                onEdit={this.onEdit.bind(this)}
                onPin={this.onPin.bind(this)}
                onSelect={this.select.bind(this)}
            />
        );
    }

    async refresh(reset) {
        const {controller, onRefreshed, id} = this.props;
        let data = this.input();
        let info = await controller.filter(data.report, data.filter);
        if (info) {
            // Load data
            if (reset) {
                this.resetSelection();
            }
            this.setState({
                info: info,
            });
            onRefreshed(id, info);
        }
    }
}



class MainPane extends React.Component {

    showInput(...args) {
        return this.refs.cmp.showInput.apply(this.refs.cmp, args);
    }

    render() {
        return (
            <cmp.MainCmp
                {...this.props}
                ref="cmp"
                onNavigation={this.props.onNavigation}
            />
        );
    }

}

class NavigationPane extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            tags: [],
            projects: [],
        }
    }

    componentDidMount() {
        this.props.controller.events.on('change', this.refresh.bind(this));
        this.refresh();
    }

    refresh() {
        this.refreshProjects();
        this.refreshTags();
    }

    refreshProjects() {
        this.props.controller.tags().then((tags) => {
            this.setState({
                tags: tags,
            });
        });
    }

    refreshTags() {
        this.props.controller.projects().then((projects) => {
            this.setState({
                projects: projects,
            });
        });
    }

    hilite(info) {
        this.setState({
            info: info,
        });
    }

    render() {
        return (
            <cmp.NavigationCmp
                {...this.props}
                tags={this.state.tags}
                projects={this.state.projects}
                info={this.state.info}
                onRefreshProjects={this.refreshProjects.bind(this)}
                onRefreshTags={this.refreshTags.bind(this)}
            />
        );
    }
}

class ReportsPane extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            reports: [],
        }
    }

    componentDidMount() {
        this.refreshReports();
        this.refreshContexts();
    }

    async refreshReports() {
        const reports = await this.props.controller.reports();
        this.setState({
            reports: reports,
        });
    }

    async refreshContexts() {
        const data = await this.props.controller.contexts();
        this.setState({
            contexts: data,
        });
    }

    render() {
        return (
            <cmp.ReportsCmp
                {...this.props}
                reports={this.state.reports}
                contexts={this.state.contexts}
                onReportsRefresh={this.refreshReports.bind(this)}
                onContextsRefresh={this.refreshContexts.bind(this)}
                ref="cmp"
            />
        );
    }
}

class CenterPane extends React.Component {
    render() {
        return (<cmp.CenterCmp>{this.props.children}</cmp.CenterCmp>);
    }
}
