import React from 'react';
import {styles, _l} from '../styles/main';

import {
  View,
  ToolbarAndroid,
  TextInput,
  Image,
  ToastAndroid,
} from 'react-native';
import * as widget from './widget';

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
            <View style={_l(styles.hproxy)}>
                {this.props.children}
            </View>
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

export class PopupEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            input: props.input || '',
        };
    }

    reset() {
        this.setState({
            input: this.props.input,
        });
    }

    onChange(value) {
        this.setState({
            input: value,
        });
    }

    finish(success, e={}) {
        const input = this.state.input.trim();
        if (success)
            this.props.onDone(input, e);
        else
            this.props.onCancel(input, e);
    }

    componentDidMount() {
        this.refs.input.focus();
    }

    render() {
        return (
            <View style={_l(styles.input_box, styles.vflex)}>
                <View style={_l(styles.hbar, styles.hflex, styles.wflex)}>
                    <widget.Text>{this.props.title}</widget.Text>
                    <TextInput
                        style={_l(styles.inp, styles.flex1)}
                        ref="input"
                        onChangeText={this.onChange.bind(this)}
                        multiline={false}
                        value={this.state.input}
                        onSubmitEditing={() => {
                            this.finish(true);
                        }}
                    />
                </View>
                <View style={_l(styles.hflex)}>
                    <View style={_l(styles.spacer)}/>
                    <widget.IconBtn icon="accept" onClick={(e) => {
                        this.finish(true, e);
                    }}/>
                    <widget.IconBtn icon="cancel" onClick={(e) => {
                        this.finish(false, e);
                    }}/>
                </View>
            </View>
        );
    }
}

export class MainCmp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    showInput(title, input, context) {
        this.setState({
            input: {
                title, input, context,
            },
        });
    }

    onInputCancel() {
        this.setState({
            input: undefined,
        });
    }

    async onInputDone(input, e) {
        const keepOpen = e.longTap;
        const success = await this.props.onInput(input, this.state.input.context);
        if (success) { // Close
            if (keepOpen) { // Reset
                this.refs.popup_input.reset();
                return;
            };
            this.onInputCancel();
        };
    }

    render() {
        const {pages, pins, page, onNavigation} = this.props;
        const {input} = this.state;
        let inputCmp = null;
        if (input) { // Render
            inputCmp = (
                <PopupEditor
                    input={input.input}
                    title={input.title}
                    onDone={this.onInputDone.bind(this)}
                    onCancel={this.onInputCancel.bind(this)}
                    ref="popup_input"
                />
            );
        };
        return (
            <View style={_l(styles.flex1)}>
                {inputCmp}
            </View>
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
        if (type == 'error') { // Long Toast
            ToastAndroid.show(message, ToastAndroid.LONG);
        };
        if (type == 'info') { // Long Toast
            ToastAndroid.show(message, ToastAndroid.SHORT);
        };
    }

    render() {
        return (
            <View />
        );
    }
}

