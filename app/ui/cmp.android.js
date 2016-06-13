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
  TouchableOpacity,
  BackAndroid,
  Dimensions,
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
            onUndo,
            onEditConfig,
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
        }, {
            title: 'Edit .taskrc',
            show: 'never',
            onAction: () => {
                onEditConfig();
            }
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

const makeNavigation = (sup, renderOne) => {

    class _Navigation extends sup {
    
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
            const _renderOne = (item) => {
                return renderOne(item, this.props);
            };
            return (
                <ListView
                    style={_l(styles.flex1)}
                    dataSource={this.state.dataSource}
                    renderRow={_renderOne}
                />
            );
        }
    }
    return _Navigation;
};

const ProjectsNavigation = makeNavigation(common.ProjectsNavigation, (item, props) => {
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
                props.onClick(item, {});
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

});

const TagsNavigation = makeNavigation(common.TagsNavigation, (item, props) => {
    let st = [styles.one_nav, styles.hflex, styles.hbar];
    if (item.hilite) st.push(styles.hilite);
    return (
        <TouchableNativeFeedback
            key={item.name}
            onPress={() => {
                props.onClick(item, {});
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
});

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
        let st = [styles.left_pane, styles.navigation, styles.vflex];
        const pane = (
            <View style={_l(st)}>
                <ProjectsNavigation
                    title="Projects"
                    style={styles.flex1}
                    onRefresh={this.props.onRefreshProjects}
                    onClick={this.props.onProjectClick}
                    projects={this.props.projects || []}
                    info={this.props.info}
                />
                <TagsNavigation
                    title="Tags"
                    style={styles.flex1}
                    onRefresh={this.props.onRefreshTags}
                    onClick={this.props.onTagClick}
                    tags={this.props.tags || []}
                    info={this.props.info}
                />
            </View>
        );
        return (
            <View style={_l(styles.float_pane)}>
                {pane}
                <TouchableOpacity
                    onPress={() => {
                        this.hide();
                    }}
                    style={_l(styles.flex1, styles.float_space)}
                >
                    <View></View>
                </TouchableOpacity>
            </View>
        );
    }
}

const ReportsNavigation = makeNavigation(common.ReportsList, (item, props) => {
    let st = [styles.one_nav];
    return (
        <TouchableNativeFeedback
            key={item.name}
            onPress={() => {
                props.onClick(item, {});
            }}
        >
            <View
                style={_l(st)}
            >
                <widget.Text style={[styles.oneLine]}>{item.name}</widget.Text>
                <widget.Text style={[styles.oneLine, styles.textSmall]}>{item.title}</widget.Text>
            </View>
        </TouchableNativeFeedback>
    );
});

const ContextsNavigation = makeNavigation(common.ContextsList, (item, props) => {
    let st = [styles.one_nav];
    if (item.selected) {
        st.push(styles.hilite);
    };
    return (
        <TouchableNativeFeedback
            key={item.name}
            onPress={() => {
                props.onClick(item, {});
            }}
        >
            <View
                style={_l(st)}
            >
                <widget.Text style={[styles.oneLine]}>{item.name}</widget.Text>
                <widget.Text style={[styles.oneLine, styles.textSmall]}>{item.filter}</widget.Text>
            </View>
        </TouchableNativeFeedback>
    );
});

export class ReportsCmp extends PaneCmp {
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
        let st = [styles.right_pane, styles.reports, styles.vflex];
        const pane = (
            <View style={_l(st)}>
                <ReportsNavigation
                    title="Reports"
                    style={styles.flex1}
                    reports={reports}
                    onRefresh={onReportsRefresh}
                    onClick={onReportClick}
                />
                <common.ContextsList
                    title="Reports"
                    style={styles.flex1}
                    contexts={contexts}
                    onRefresh={onContextsRefresh}
                    onClick={onContextClick}
                />
            </View>
        );
        return (
            <View style={_l(styles.float_pane)}>
                <TouchableOpacity
                    onPress={() => {
                        this.hide();
                    }}
                    style={_l(styles.flex1, styles.float_space)}
                >
                    <View></View>
                </TouchableOpacity>
                {pane}
            </View>
        );
    }
}

export class PopupEditor extends React.Component {
    constructor(props) {
        super(props);
        this.onBack = this.onBack.bind(this);
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

    onBack() {
        this.finish(false);
        return true;
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
        BackAndroid.addEventListener('hardwareBackPress', this.onBack);
    }

    componentWillUnmount() {
        BackAndroid.removeEventListener('hardwareBackPress', this.onBack);
    }

    render() {
        const windowSize = Dimensions.get('window');
        let lineStyle = [styles.hflex, styles.hbar];
        if (windowSize.width < 600) { // Smaller than Nexus 7
            lineStyle = styles.vflex;
        };
        return (
            <View style={_l(styles.input_box, styles.vflex)}>
                <View style={_l(lineStyle)}>
                    <widget.Text style={_l(styles.input_text)}>{this.props.title}</widget.Text>
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
        const {pager} = this.refs;
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
                    ref="pager"
                    onPageSelected={(evt) => {
                        onNavigation(0, evt.nativeEvent.position);
                    }}
                    initialPage={0}
                >
                    {pageCmps}
                </ViewPagerAndroid>
                {inputCmp}
            </View>
        );
    }

    componentDidUpdate() {
        const {pages, page} = this.props;
        const {pager} = this.refs;
        pages.forEach((item, idx) => {
            if (item.key == page) { // Found
                pager.setPage(idx);
            };
        })
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
                    enableEmptySections={true}
                    style={_l(styles.flex1)}
                    dataSource={this.state.dataSource}
                    renderRow={renderOne}
                />
            </View>
        );
    }

}

export class CmdPageCmp extends common.CmdPageCmp {

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
        const {list} = this.refs;
        if (info && info.lines) { // Update ds
            this.setState({
                dataSource: dataSource.cloneWithRows(info.lines),
            });
            if (list) { // Scroll
                list.scrollTo({
                    x: 0,
                    y: 0,
                    animated: false
                });
            };
        };
    }

    renderBody(header, info) {
        const renderOne = (line, sid, idx) => {
            return (
                <widget.Text
                    key={idx}
                    single
                    style={[styles.pre, styles[`cmdLine_${line.type}`]]}
                >
                    {line.line}
                </widget.Text>
            );
        };
        return (
            <ListView
                ref="list"
                style={_l(styles.flex1)}
                enableEmptySections={true}
                dataSource={this.state.dataSource}
                renderRow={renderOne}
            />
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
