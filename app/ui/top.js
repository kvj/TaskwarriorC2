// High level React components

import React from 'react';
import {styles, _l} from '../styles/main';
import * as cmp from './cmp';

export class AppPane extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            pages: [],
        };
    }

    componentDidMount() {
        this.showPage({
            type: 'list',
            report: 'next',
            filter: '',
        });
    }

    checkActive(key) {
        return this.state.page == key;
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
        let {pages} = this.state;
        let idx = pages.findIndex((item) => {
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
            };
        };
    }

    onRefreshed(key, info) {
        if (this.checkActive(key)) { // Refresh navigation
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
                ref: (ref) => {
                    item.ref = ref;
                },
                controller: this.props.controller,
                onClose: this.onClose.bind(this),
                checkActive: this.checkActive.bind(this),
                onRefreshed: this.onRefreshed.bind(this),
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
    }

    current(page=this.state.page) {
        return this.state.pages.find((item) => {
            return item.key == page;
        });
    }

    onTagClick(tag) {
        const page = this.current();
        if (page && page.ref) {
            page.ref.filter(`+${tag.name}`);
        }
    }

    onProjectClick(project) {
        const page = this.current();
        if (page && page.ref) {
            page.ref.filter(`pro:${project.project}`);
        }
    }

    render() {
        return (
            <cmp.AppCmp>
                <ToolbarPane
                    controller={this.props.controller}
                    onCommand={this.onCommand.bind(this)}
                />
                <CenterPane>
                    <MainPane
                        controller={this.props.controller}
                        pages={this.state.pages}
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
                        mode='dock'
                    />
                    <ReportsPane
                        controller={this.props.controller}
                        onClick={this.onReportClick.bind(this)}
                        mode='dock'
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
        this.props.controller.events.on('question', (msg, resp) => {
            this.refs.cmp.showMessage('question', msg, resp);
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

    input() {
        return this.refs.cmp.input();
    }

    same(page) {
        let data = this.input();
        return page.cmd === data.cmd;
    }

    filter(filter) {
        // this.refs.cmp.filter(filter);
        this.refresh();
    }

    render() {
        return (
            <cmp.CmdPageCmp
                {...this.props}
                ref="cmp"
                info={this.state.info}
                onRefresh={this.refresh.bind(this)}
                onClose={this.onClose.bind(this)}
            />
        );
    }

    async refresh() {
        const {controller, onRefreshed, id} = this.props;
        let data = this.input();
        let info = await controller.cmdRaw(data.cmd);
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
        this.state = {};
    }

    onAdd() {
        this.props.onAdd(this.props.id, this.input().filter);
    }

    onEdit(task, cmd, input, unint=false) {
        this.props.onEdit(this.props.id, cmd, [task], input, unint);
    }

    filter(filter) {
        this.refs.cmp.filter(filter);
        this.refresh();
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
                onRefresh={this.refresh.bind(this)}
                onDone={this.onDone.bind(this)}
                onClose={this.onClose.bind(this)}
                onAdd={this.onAdd.bind(this)}
                onEdit={this.onEdit.bind(this)}
            />
        );
    }

    async refresh() {
        const {controller, onRefreshed, id} = this.props;
        let data = this.input();
        let info = await controller.filter(data.report, data.filter);
        if (info) {
            // Load data
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
        this.refresh();
    }

    async refresh() {
        const reports = await this.props.controller.reports();
        this.setState({
            reports: reports,
        });
    }

    render() {
        return (
            <cmp.ReportsCmp
                reports={this.state.reports}
                onRefresh={this.refresh.bind(this)}
                onClick={this.props.onClick}
                mode={this.props.mode}
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
