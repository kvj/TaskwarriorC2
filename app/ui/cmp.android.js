import React from 'react';
import {styles, _l} from '../styles/main';

import {
  View,
  ToolbarAndroid,
  TextInput,
  Image,
  ToastAndroid,
  ViewPagerAndroid,
  ListView,
  TouchableNativeFeedback,
} from 'react-native';
import * as widget from './widget';
import * as common from './cmp.common';

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
                onTogglePane('right');
            },
        }];
        return (
            <ToolbarAndroid
                style={_l(styles.flex0, styles.toolbar)}
                title="Taskwarrior"
                actions={actions}
                navIcon={{uri: 'ic_menu'}}
                onIconClicked={() => {
                    onTogglePane('left');
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

class PaneCmp extends React.Component {

    constructor(props, name) {
        super(props);
        this.name = name;
    }

    hide(e) {
        const {mode, onHide} = this.props;
        if (mode == 'float') {
            onHide(this.name);
        };
    }
}

class ProjectsNavigation extends common.ProjectsNavigation {
    
    constructor(props) {
        super(props);
        let ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => true
        });
        this.state.dataSource = ds.cloneWithRows(this.state.list);
    }

    componentWillReceiveProps(props) {
        const {dataSource} = this.state;
        const list = this.convert(props);
        this.setState({
            list,
            dataSource: dataSource.cloneWithRows(list),
        });
    }

    renderList(list) {
        const renderOne = (item) => {
            let st = [styles.one_nav, styles.hflex, styles.hbar];
            if (item.hilite) st.push(styles.hilite);
            let prefix = '';
            for (var i = 0; i < item.indent; i++) {
                prefix += ' ';
            }
            return (
                <TouchableNativeFeedback
                    key={item.name}
                    onPress={() => {
                        this.props.onClick(item, {});
                    }}
                >
                    <View
                        style={_l(st)}
                    >
                        <widget.Text style={[styles.flex1]}>{prefix+item.name}</widget.Text>
                        <widget.Text style={[styles.flex0]}>{item.count}</widget.Text>
                    </View>
                </TouchableNativeFeedback>
            );
        };
        return (
            <ListView
                style={_l(styles.flex1)}
                dataSource={this.state.dataSource}
                renderRow={renderOne}
            />
        );
    }

}

class TagsNavigation extends common.TagsNavigation {

    constructor(props) {
        super(props);
        let ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => true
        });
        this.state.dataSource = ds.cloneWithRows(this.state.tags);
    }


    componentWillReceiveProps(props) {
        const {dataSource} = this.state;
        const tags = this.convert(props);
        this.setState({
            tags,
            dataSource: dataSource.cloneWithRows(tags),
        });
    }

    renderList(list) {
        const renderOne = (item) => {
            let st = [styles.one_nav, styles.hflex, styles.hbar];
            if (item.hilite) st.push(styles.hilite);
            return (
                <TouchableNativeFeedback
                    key={item.name}
                    onPress={() => {
                        this.props.onClick(item, {});
                    }}
                >
                    <View
                        style={_l(st)}
                    >
                        <widget.Text style={[styles.flex1]}>{item.name}</widget.Text>
                        <widget.Text style={[styles.flex0]}>{item.count}</widget.Text>
                    </View>
                </TouchableNativeFeedback>
            );
        };
        return (
            <ListView
                style={_l(styles.flex1)}
                dataSource={this.state.dataSource}
                renderRow={renderOne}
            />
        );
    }
}

export class NavigationCmp extends PaneCmp {
    constructor(props) {
        super(props, 'left');
        this.state = {};
    }

    render() {
        const {mode} = this.props;
        if (mode == 'hidden') {
            return null;
        }
        let st = [styles.left_pane, styles.left_pane_float, styles.navigation, styles.vflex];
        return (
            <View style={_l(st)}>
                <ProjectsNavigation
                    onRefresh={this.props.onRefreshProjects}
                    onClick={this.props.onProjectClick}
                    projects={this.props.projects || []}
                    info={this.props.info}
                />
                <TagsNavigation
                    onRefresh={this.props.onRefreshTags}
                    onClick={this.props.onTagClick}
                    tags={this.props.tags || []}
                    info={this.props.info}
                />
            </View>
        );
    }
}

export class ReportsCmp extends React.Component {
    constructor(props) {
        super(props, 'right');
        this.state = {};
    }

    render() {
        const {reports, onReportsRefresh, onReportClick, mode} = this.props;
        const {contexts, onContextsRefresh, onContextClick} = this.props;
        if (mode == 'hidden') {
            return null;
        }
        let st = [styles.right_pane, styles.right_pane_float, styles.reports, styles.vflex];
        return (
            <View style={_l(st)}>
                <common.ReportsList
                    reports={reports}
                    onRefresh={onReportsRefresh}
                    onClick={onReportClick}
                />
                <common.ContextsList
                    contexts={contexts}
                    onRefresh={onContextsRefresh}
                    onClick={onContextClick}
                />
            </View>
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
        const {pages, pins, page, onNavigation, panes} = this.props;
        const {input} = this.state;
        const pageCmps = pages.map((pageCmp, idx) => {
            return (
                <View key={pageCmp.key}>{pageCmp.cmp}</View>
            );
        });
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
        let st = [styles.flex1];
        if (panes.left == 'dock') st.push(styles.left_dock);
        if (panes.right == 'dock') st.push(styles.right_dock);
        return (
            <View style={_l(st)}>
                <ViewPagerAndroid
                    style={_l(styles.flex1)}
                    initialPage={0}
                >
                    {pageCmps}
                </ViewPagerAndroid>
                {inputCmp}
            </View>
        );
    }
}

export class TaskPageCmp extends common.TaskPageCmp {

    constructor(props) {
        super(props);
        let ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => {
                return true;
            }
        });
        this.state = {
            dataSource: ds,
        };
    }

    componentWillReceiveProps(props) {
        const {dataSource} = this.state;
        const {info, selection} = props;
        if (info && info.tasks) { // Update ds
            this.setState({
                dataSource: dataSource.cloneWithRows(info.tasks),
            });
        };
    }

    renderBody(header, info) {
        const renderOne = (task, sid, idx) => {
            return this.renderTask(task, idx, cols);
        };
        const cols = info.cols.filter((item) => {
            return item.visible;
        });
        return (
            <View style={_l(styles.vproxy)}>
                <View style={_l(styles.flex0, styles.hflex, styles.wflex)}>{header}</View>
                <ListView
                    style={_l(styles.flex1)}
                    dataSource={this.state.dataSource}
                    renderRow={renderOne}
                />
            </View>
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
