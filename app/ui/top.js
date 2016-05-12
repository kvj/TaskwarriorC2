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
            report: 'next',
            filter: '',
        });
    }

    checkActive(key) {
        return this.state.page == key;
    }

    onClose(key) {
        let {pages} = this.state;
        let idx = pages.findIndex((item) => {
            return item.key == key;
        });
        if (idx != -1) { // Not last
            pages.splice(idx, 1);
            if (idx > 0) idx--;
            this.setState({
                pages: pages,
                page: (pages[idx] || {}).key,
            });
        };
    }

    showPage(page) {
        let {pages} = this.state;
        let item = pages.find((item) => {
            return item.ref.same(page);
        });
        if (!item) { // Add new
            const key = Date.now();
            let item = {
                key: key,
                cmp: (
                    <TasksPagePane
                        id={key}
                        key={key}
                        ref={(ref) => {
                            item.ref = ref;
                        }}
                        report={page.report}
                        filter={page.filter}
                        controller={this.props.controller}
                        onClose={this.onClose.bind(this)}
                        checkActive={this.checkActive.bind(this)}
                    />
                ),
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
        this.showPage({
            report: report.name,
            filter: '',
        });
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
                />
                <CenterPane>
                    <MainPane
                        controller={this.props.controller}
                        pages={this.state.pages}
                        page={this.state.page}
                        ref="main"
                        onNavigation={this.onNavigation.bind(this)}
                    />
                    <NavigationPane
                        controller={this.props.controller}
                        onTagClick={this.onTagClick.bind(this)}
                        onProjectClick={this.onProjectClick.bind(this)}
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

class TasksPagePane extends PagePane {

    constructor(props) {
        super(props);
        // console.log('TaskPagePane');
        this.refreshHandler = this.onChanged.bind(this);
        this.state = {
            report: props.report || '',
            filter: props.filter || '',
        };
    }

    filter(filter) {
        this.state.filter = filter || '';
        this.setState({
            filter: this.state.filter,
        });
        this.refresh();
    }

    same(page) {
        return page.filter === this.state.filter && page.report === this.state.report;
    }

    async onDone(task) {
        const {uuid, status} = task;
        if (['waiting', 'pending'].includes(status)) { // OK to done
            await this.props.controller.done(uuid);
        } else { // Show error
            this.props.controller.err('Invalid task');
        };
    };

    render() {
        return (
            <cmp.TaskPageCmp
                {...this.props}
                report={this.state.report}
                filter={this.state.filter}
                onReportChange={this.onReportChange.bind(this)}
                onFilterChange={this.onFilterChange.bind(this)}
                info={this.state.info}
                onRefresh={this.refresh.bind(this)}
                onDone={this.onDone.bind(this)}
                onClose={this.onClose.bind(this)}
            />
        );
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


    async refresh() {
        let info = await this.props.controller.filter(this.state.report, this.state.filter);
        if (info) {
            // Load data
            this.setState({
                info: info,
            });
        }
    }
}



class MainPane extends React.Component {

    render() {
        return (
            <cmp.MainCmp
                {...this.props}
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
        this.props.controller.events.on('change', this.refresh);
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

    render() {
        return (
            <cmp.NavigationCmp
                {...this.props}
                tags={this.state.tags}
                projects={this.state.projects}
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
