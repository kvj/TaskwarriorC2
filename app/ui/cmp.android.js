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
        return (
            <View />
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

