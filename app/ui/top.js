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
        this.state.pages.push(
            <TasksPagePane report="next" controller={this.props.controller} />
        );
        this.setState({
            pages: this.state.pages,
        });
    }

    render() {
        return (
            <cmp.AppCmp>
                <ToolbarPane />
                <CenterPane>
                    <MainPane
                        controller={this.props.controller}
                        pages={this.state.pages}
                        page={this.state.page}
                        ref="main"
                    />
                    <NavigationPane mode='dock' />
                    <ReportsPane mode='dock'/>
                </CenterPane>
            </cmp.AppCmp>
        );
    }
}

class ToolbarPane extends React.Component {
    render() {
        return (<cmp.ToolbarCmp />);
    }
}

// Can be task list or task output or whatever
// Member of pages
class PagePane extends React.Component {

}

class TasksPagePane extends PagePane {

    render() {
        return (
            <cmp.TaskPageCmp {...this.props} ref="cmp" />
        );
    }

    componentDidMount() {
        this.refresh();
    }

    async refresh() {
        let data = this.refs.cmp.input();
        console.log('Refresh:', this.refs, data);
        let info = await this.props.controller.filter(data.report, data.filter);
        if (info) {
            // Load data
        }
    }
}



class MainPane extends React.Component {

    render() {
        return (
            <cmp.MainCmp {...this.props} />
        );
    }
}

class NavigationPane extends React.Component {
    render() {
        return (<cmp.NavigationCmp mode={this.props.mode} />);
    }
}

class ReportsPane extends React.Component {
    render() {
        return (<cmp.ReportsCmp mode={this.props.mode} />);
    }
}

class CenterPane extends React.Component {
    render() {
        return (<cmp.CenterCmp>{this.props.children}</cmp.CenterCmp>);
    }
}
