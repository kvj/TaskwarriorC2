// High level React components

import React from 'react';
import * as cmp from './cmp';

import {smooth} from '../tool/ui';

export class AppPane extends React.Component {

    constructor(props) {
        super(props);
        const {controller} = props;
        this.pageIndex = 0;
        this.state = {
            pages: [],
            defaultCmd: controller.defaultCmd,
            layout: cmp.calculateLayout(),
            panes: {
                left: controller.panesConfig.left || controller.panesConfig._default,
                right: controller.panesConfig.right || controller.panesConfig._default,
            },
            pins: [],
            calendarDate: controller.fromCalendar(),
        };
    }

    componentDidMount() {
        const {controller} = this.props;
        for (let pin of controller.panesConfig.pins) {
            this.showPage({
                type: 'list',
                report: pin.report,
                filter: pin.filter,
            }, true); // Open in pinned mode
        }
        for (let page of controller.panesConfig.pages) {
            this.showPage({
                type: 'list',
                report: page.report,
                filter: page.filter,
            }); // Open in normal mode
        }
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
        const {_modes} = this.props.controller.panesConfig;
        // console.log('Toggle pane:', pane, state);
        if (!state) return;
        if (state == 'dock') { // Hide
            state = _modes['hidden']? 'hidden': 'float';
        } else if (state == 'hidden') {
            state = _modes["float"]? 'float': 'dock';
        } else {
            state = _modes['dock']? 'dock': 'hidden';
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

    onAdd(key, filter, completed) {
        let cmd = completed? 'log': 'add';
        let input = '';
        if (filter) input = `${filter} `;
        this.refs.main.showInput(cmd, input, {
            cmd: cmd,
        });
    }

    onEdit(key, cmd, tasks, input, unint, multiline) {
        if (unint) { // Unintended - run
            return this.processInput(input, {
                cmd: cmd,
                tasks: tasks,
            });
        };
        let title = cmd;
        if (tasks.length) { // Prepend number of tasks
            title = `{${tasks.length}} ${cmd}`;
        };
        let inp = input;
        if (multiline && inp) { // Split
            inp = input.split(this.props.controller.multilineSep).join('\n');
        };
        this.refs.main.showInput(title, input, {
            cmd: cmd,
            input: inp,
            tasks: tasks,
            multiline: multiline
        });
    }

    async processInput(input, ctx) {
        let cmd = ctx.cmd;
        if (cmd == 'reannotate') { // Special case
            const denotateResult = await this.props.controller.cmd('denotate', ctx.input, ctx.tasks, true);
            if (!denotateResult) { // Failed
                return false;
            };
            cmd = 'annotate';
        };
        if (ctx.multiline) { // Multiline mode
            input = `"${cmd}${input.split('\n').join(this.props.controller.multilineSep)}"`;
            cmd = 'modify';
        };
        return smooth(async () => {
            return await this.props.controller.cmd(cmd, input, ctx.tasks);
        });
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
        if (page && !page.pin && this.refs.navigation) { // Refresh navigation
            this.refs.navigation.hilite(info);
        };
    }

    showPage(page, pin) {
        let {pages, pins, layout} = this.state;
        const {controller} = this.props;
        let item = pages.find((item) => {
            return item.type == page.type && item.ref && item.ref.same(page);
        });
        if (!item || pin) { // Add new
            let paneCmp = null;
            let key = Date.now() + (++this.pageIndex);
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
                onPin: this.togglePin.bind(this),
            };
            if (page.type == 'list') { // Create list
                paneCmp = (
                    <TasksPagePane
                        {...props}
                        expanded={controller.panesConfig.expanded}
                        report={page.report}
                        filter={page.filter}
                        layout={layout}
                        onAdd={this.onAdd.bind(this)}
                        onEdit={this.onEdit.bind(this)}
                        onSync={this.onSync.bind(this)}
                    />
                );
            };
            if (page.type == 'cmd') { // Create cmd pane
                paneCmp = (
                    <CmdPagePane
                        {...props}
                        layout={layout}
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
                pin: pin || false,
                cmp: paneCmp,
            };
            if (pin) { // Pinned entry
                pins.push(item);
                key = this.state.page; // No change
            } else { // Normal page
                pages.push(item);
            };
            this.setState({
                pages: pages,
                pins: pins,
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

    onNavigation(dir, index) {
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
            case 0:
                idx = index;
        }
        this.setState({
            page: pages[idx].key,
        });
        pages[idx].ref.refresh();
    }

    async onContextClick(context) {
        await this.props.controller.setContext(context);
        this.refs.reports.refreshContexts();
        this.hidePane('right');
    }

    onReportClick(report, filter='') {
        if (report.special) { // Show cmd window
            let cmd = report.name;
            if (filter) { // Append
                cmd += ` ${filter}`;
            };
            this.showPage({
                cmd: cmd,
                type: 'cmd',
            });
        } else {
            this.showPage({
                report: report.name,
                filter: filter,
                type: 'list',
            });
        }
        this.hidePane('right');
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

    async openReport(type, filter) {
        const name = await this.props.controller.specialList(type);
        if (name) { // Open
            this.showPage({
                report: name,
                filter: filter,
                type: 'list',
            });
        };
    }

    onTagClick(tag, special) {
        this.hidePane('left');
        if (special) { // Open new pane
            return this.openReport('tag', `+${tag.name}`);
        };
        const page = this.current();
        if (page && page.ref) {
            page.ref.filter(`+${tag.name}`);
        }
    }

    onProjectClick(project, special) {
        this.hidePane('left');
        if (special) { // Open new pane
            return this.openReport('project', `pro:${project.project}`);
        };
        const page = this.current();
        if (page && page.ref) {
            page.ref.filter(`pro:${project.project}`);
        }
    }

    onTagEdit(tag) {
        const title = `+${tag.name} modify`;
        this.refs.main.showInput(title, `-${tag.name} +${tag.name}`, {
            cmd: title,
        });
    }

    onProjectEdit(project) {
        const title = `pro:${project.project} modify`;
        this.refs.main.showInput(title, `pro:${project.project}`, {
            cmd: title,
        });
    }

    async onUndo() {
        return await this.props.controller.undo();
    }

    async onSync() {
        const success = await this.props.controller.sync();
        if (success) {
            this.props.controller.info('Sync complete');
        }
    }

    async onEditConfig() {
        const {controller} = this.props;
        await controller.editConfig();
    }

    async onMakeBackup() {
        const {controller} = this.props;
        await controller.makeBackup();
    }

    onManageProfiles() {
        const {controller} = this.props;
        this.refs.main.showProfiles(controller.provider);
    }

    onCalendarChange(dir, special) {
        let date = this.state.calendarDate;
        if (dir === 0) {
            date = new Date();
            date.setDate(1);
        } else {
            if (special) {
                date.setFullYear(date.getFullYear() + dir);
            } else {
                date.setMonth(date.getMonth() + dir);
            };
        }
        this.setState({calendarDate: date});
    }

    onCalendarClick(date, special) {
        // Apply filter
        const {calendarConfig} = this.props.controller;
        const cmd = special? calendarConfig.filterAlt: calendarConfig.filter;
        const filter = `${cmd}:${date}`;
        const page = this.current();
        if (page && page.ref) {
            page.ref.filter(filter);
        }
        this.hidePane(calendarConfig.pane);
    }

    onCalendarDrag(date, special) {
        const {calendarConfig} = this.props.controller;
        const cmd = special? calendarConfig.commandAlt: calendarConfig.command;
        return `${cmd}:${date}`;
    }

    onLayoutChange(l) {
        const {layout} = this.state;
        const fields = ['orientation', 'width', 'height', 'wide', 'tall'];
        for (var f of fields) {
            if (l[f] !== layout[f]) { // Changed
                this.setState({layout: l});
                return true;
            };
        };
        return false;
    }

    render() {
        if (!this.state) return (
            <cmp.AppCmp />
        );
        const {panes, pages, pins, page, calendarDate, layout} = this.state;
        const {controller} = this.props;
        let leftExtra = [];
        let rightExtra = [];
        if (['left', 'right'].includes(controller.calendarConfig.pane)) {
            const cal = (
                <cmp.CalendarCmp
                    onChange={this.onCalendarChange.bind(this)}
                    onClick={this.onCalendarClick.bind(this)}
                    onDrag={this.onCalendarDrag.bind(this)}
                    date={calendarDate}
                    data={controller.calendar(calendarDate)}
                    layout={layout}
                />
            );
            if ('left' == controller.calendarConfig.pane) {
                leftExtra.push(cal);
            }
            if ('right' == controller.calendarConfig.pane) {
                rightExtra.push(cal);
            }
        }
        return (
            <cmp.AppCmp
                onLayoutChange={this.onLayoutChange.bind(this)}
            >
                <ToolbarPane
                    onCommand={this.onCommand.bind(this)}
                    onTogglePane={this.togglePane.bind(this)}
                    onUndo={this.onUndo.bind(this)}
                    info={controller.providerInfo()}
                    onSync={this.onSync.bind(this)}
                    onEditConfig={this.onEditConfig.bind(this)}
                    onManageProfiles={this.onManageProfiles.bind(this)}
                    onMakeBackup={this.onMakeBackup.bind(this)}
                />
                <CenterPane>
                    <MainPane
                        navigation={panes.navigation}
                        panes={panes}
                        pages={pages}
                        pins={pins}
                        page={page}
                        layout={layout}
                        ref="main"
                        onNavigation={this.onNavigation.bind(this)}
                        onInput={this.processInput.bind(this)}
                    />
                    <NavigationPane
                        controller={controller}
                        onTagClick={this.onTagClick.bind(this)}
                        onProjectClick={this.onProjectClick.bind(this)}
                        onTagEdit={this.onTagEdit.bind(this)}
                        onProjectEdit={this.onProjectEdit.bind(this)}
                        ref="navigation"
                        mode={panes.left}
                        tagsMode={this.paneMode('tags')}
                        projectsMode={this.paneMode('reports')}
                        onHide={this.hidePane.bind(this)}
                        extra={leftExtra}
                        layout={layout}
                    />
                    <ReportsPane
                        ref="reports"
                        controller={controller}
                        reportsExpandable={controller.reportsSublist? true: false}
                        onReportClick={this.onReportClick.bind(this)}
                        onContextClick={this.onContextClick.bind(this)}
                        mode={panes.right}
                        contextsMode={this.paneMode('contexts')}
                        reportsMode={this.paneMode('reports')}
                        onHide={this.hidePane.bind(this)}
                        extra={rightExtra}
                        layout={layout}
                    />
                </CenterPane>
                <StatusbarPane
                    controller={controller}
                />
            </cmp.AppCmp>
        );
    }

    paneMode(name) {
        return this.props.controller.panesConfig[name];
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
    
    setLayout(layout) {
        this.setState({layout});
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
                loading={this.state.loading}
                onRefresh={this.run.bind(this)}
                onClose={this.onClose.bind(this)}
                onPin={this.onPin.bind(this)}
            />
        );
    }

    refresh() {
    }

    run() {
        const {controller, onRefreshed, id} = this.props;
        let data = this.input();
        this.setState({loading: true});
        smooth(async () => {
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
            this.setState({loading: false});
        });
    }
}

class TasksPagePane extends PagePane {

    constructor(props) {
        super(props);
        this.state = {
            selection: {},
            filter: props.filter,
            layout: props.layout,
            sortMode: 'list',
            expanded: props.expanded || false,
        };
    }

    toggleSort() {
        const {sortMode} = this.state;
        const modes = ['list', 'tree', 'tree_back'];
        this.setState({
            sortMode: modes[(modes.indexOf(sortMode) + 1) % modes.length], // Cycle
        });
        this.refresh();
    }

    toggleExpand() {
        const {expanded} = this.state;
        this.setState({expanded: !expanded});
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

    onAdd(completed, ...cmds) {
        let cmd = [];
        const input = this.input().filter;
        if (input) cmd.push(input);
        cmds.forEach((item) => {
            if (item) cmd.push(item);
        });
        this.props.onAdd(this.props.id, cmd.join(' '), completed);
    }

    onEdit(task, cmd, input, unint=false, multiline=false) {
        const {selection, info} = this.state;
        let tasks = [];
        if (info && info.tasks) {
            tasks = info.tasks.filter((item) => selection[item.uuid]);
        }
        if (!tasks.length || tasks.indexOf(task) == -1) {
            if (task) tasks = [task]; // Current
        }
        this.props.onEdit(this.props.id, cmd, tasks, input, unint, multiline);
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
        if (['waiting', 'pending'].indexOf(status) != -1) { // OK to done
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
                layout={this.state.layout}
                ref="cmp"
                info={this.state.info}
                selection={this.state.selection}
                loading={this.state.loading}
                sortMode={this.state.sortMode}
                expanded={this.state.expanded}
                onToggleExpand={() => {
                    this.toggleExpand();
                }}
                onToggleSort={this.toggleSort.bind(this)}
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

    refresh(reset) {
        this.setState({loading: true});
        const {controller, onRefreshed, id} = this.props;
        let data = this.input();
        smooth(async () => {
            const oldInfo = reset? undefined: this.state.info;
            let info = await controller.filter(data.report, data.filter, oldInfo, this.state.sortMode);
            let newState = {
                loading: false,
            };
            if (info) {
                // Load data
                if (reset) {
                    newState.selection = {};
                }
                newState.info = info;
                onRefreshed(id, info);
            }
            this.setState(newState);
        });
    }
}



class MainPane extends React.Component {

    showInput(...args) {
        return this.refs.cmp.showInput.apply(this.refs.cmp, args);
    }

    showProfiles(...args) {
        return this.refs.cmp.showProfiles.apply(this.refs.cmp, args);
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
            tagsExpanded: false,
            projectsExpanded: false,
        }
        this.mounted = false;
    }

    componentDidMount() {
        this.props.controller.events.on('change', this.refresh.bind(this));
        this.refresh();
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    refresh() {
        this.refreshProjects();
        this.refreshTags();
    }

    toggleExpand(prop) {
        if (!this.mounted) return false;
        let state = {};
        state[prop] = !this.state[prop];
        this.setState(state);
    }

    async refreshTags() {
        return smooth(async () => {
            const tags = await this.props.controller.tags(this.state.tagsExpanded);
            if (tags && this.mounted) this.setState({tags});
        });
    }

    async refreshProjects() {
        return smooth(async () => {
            const projects = await this.props.controller.projects(this.state.projectsExpanded);
            if (projects && this.mounted) this.setState({projects});
        });
    }

    hilite(info) {
        if (!this.mounted) return false;
        this.setState({
            info: info,
        });
        return true;
    }

    render() {
        return (
            <cmp.NavigationCmp
                {...this.props}
                tags={this.state.tags}
                tagsExpanded={this.state.tagsExpanded}
                projectsExpanded={this.state.projectsExpanded}
                projects={this.state.projects}
                info={this.state.info}
                onRefreshProjects={this.refreshProjects.bind(this)}
                onRefreshTags={this.refreshTags.bind(this)}
                onExpandProjects={() => {
                    this.toggleExpand('projectsExpanded');
                    this.refreshProjects();
                }}
                onExpandTags={() => {
                    this.toggleExpand('tagsExpanded');
                    this.refreshTags();
                }}
            />
        );
    }
}

class ReportsPane extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            reports: [],
            reportsExpanded: props.reportsExpandable? false: undefined,
        }
    }

    componentDidMount() {
        this.refreshReports();
        this.refreshContexts();
    }

    async refreshReports() {
        return smooth(async () => {
            const {reportsExpanded} = this.state;
            const reports = await this.props.controller.reports(reportsExpanded);
            this.setState({
                reports: reports,
            });
        });
    }

    async refreshContexts() {
        return smooth(async () => {
            const data = await this.props.controller.contexts();
            this.setState({
                contexts: data,
            });
        });
    }

    toggleExpand(prop) {
        let state = {};
        state[prop] = !this.state[prop];
        this.setState(state);
    }

    render() {
        return (
            <cmp.ReportsCmp
                {...this.props}
                reports={this.state.reports}
                contexts={this.state.contexts}
                onReportsRefresh={this.refreshReports.bind(this)}
                onContextsRefresh={this.refreshContexts.bind(this)}
                reportsExpanded={this.state.reportsExpanded}
                onExpandReports={() => {
                    this.toggleExpand('reportsExpanded');
                    this.refreshReports();
                }}
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
