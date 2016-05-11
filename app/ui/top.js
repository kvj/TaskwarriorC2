// High level React components

import React from 'react';
import {styles, _l} from '../styles/main';
import * as cmp from './cmp';

export class AppPane extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            pages: [],
            page: 0,
        };
    }

    componentDidMount() {
        this.showPage({
            report: 'next',
            filter: '',
        });
    }

    showPage(page) {
        let {pages} = this.state;
        const idx = pages.findIndex((item) => {
            console.log('Index:', item, page);
            return false;
        });
        if (idx == -1) { // Add new
            pages.push(
                <TasksPagePane
                    key={new Date().getTime()}
                    report={page.report}
                    filter={page.filter}
                    controller={this.props.controller}
                />
            );
            this.setState({
                pages: pages,
                page: pages.length-1,
            });
        } else {
            this.setState({
                page: idx,
            });
        }
    }

    onNavigation(dir) {
        let {page, pages} = this.state;
        switch(dir) {
            case -1:
                if (page > 0) page -= 1;
                break;
            case 1:
                if (page < pages.length-1) page += 1;
                break;
        }
        this.setState({
            page: page,
        });
    }

    onReportClick(report) {
        this.showPage({
            report: report.name,
            filter: '',
        });
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
                    <NavigationPane mode='dock' />
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

}

class TasksPagePane extends PagePane {

    constructor(props) {
        super(props);
        this.refreshHandler = this.onChanged.bind(this);
        this.state = {};
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
                info={this.state.info}
                ref="cmp"
                onRefresh={this.refresh.bind(this)}
                onDone={this.onDone.bind(this)}
            />
        );
    }

    onChanged() {
        this.refresh();
    }

    componentDidMount() {
        this.props.controller.events.on('change', this.refreshHandler);
        this.refresh();
    }

    componentWillUnmount() {
        this.props.controller.events.removeListener('change', this.refreshHandler);
    }

    async refresh() {
        let data = this.refs.cmp.input();
        // console.log('Refresh:', this.refs, data);
        let info = await this.props.controller.filter(data.report, data.filter);
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
    render() {
        return (<cmp.NavigationCmp mode={this.props.mode} />);
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
