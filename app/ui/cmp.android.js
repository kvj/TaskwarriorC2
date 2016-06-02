import React from 'react';
import {styles, _l} from '../styles/main';

import {
  View,
  ToolbarAndroid,
} from 'react-native';

export class AppCmp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <View style={_l([styles.vproxy, styles.max, styles.app])}>
                {this.props.children}
            </View>
        );
    }
};

export class ToolbarCmp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const {
            onCommand,
            onTogglePane,
            onSync,
            onUndo
        } = this.props;
        const actions = [{
            title: 'Run command',
            icon: {uri: 'ic_cmd'},
            show: 'ifRoom',
            onAction: onCommand,
        }, {
            title: 'Undo last command',
            icon: {uri: 'ic_undo'},
            show: 'always',
            onAction: onUndo,
        }, {
            title: 'Sync',
            icon: {uri: 'ic_sync'},
            show: 'ifRoom',
            onAction: onSync,
        }, {
            title: 'Show right pane',
            icon: {uri: 'ic_menu'},
            show: 'always',
            onAction: () => {
                onTogglePane('reports');
            },
        }];
        return (
            <ToolbarAndroid
                style={_l(styles.flex0, styles.toolbar)}
                title="Taskwarrior"
                actions={actions}
                navIcon={{uri: 'ic_menu'}}
                onIconClicked={() => {
                    onTogglePane('navigation');
                }}
                onActionSelected={(idx) => {
                    actions[idx].onAction();
                }}
            />
        );
    }

}

export class CenterCmp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <View />
        );
    }
}

export class NavigationCmp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <View />
        );
    }
}

export class ReportsCmp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <View />
        );
    }
}

export class MainCmp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <View />
        );
    }
}


export class TaskPageCmp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <View />
        );
    }
}

export class CmdPageCmp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <View />
        );
    }
}

export class StatusbarCmp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    showMessage(type, message) {
        console.log('Show message:', type, message);
    }

    render() {
        return (
            <View />
        );
    }
}

