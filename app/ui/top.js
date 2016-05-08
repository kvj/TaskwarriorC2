// High level React components

import React from 'react';
import {styles, _l} from '../styles/main';
import * as cmp from './cmp';

export class AppPane extends React.Component {
    render() {
        return (
            <cmp.AppCmp>
                <ToolbarPane />
                <CenterPane>
                    <TasksPane />
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

class TasksPane extends React.Component {
    render() {
        return (<cmp.TasksCmp />);
    }
}

class NavigationPane extends React.Component {
    render() {
        return (<cmp.NavigationCmp mode={this.props.mode}/>);
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
