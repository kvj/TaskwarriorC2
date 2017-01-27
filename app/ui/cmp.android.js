import React from 'react';
import {styles, _l} from '../styles/main';
import {smooth} from '../tool/ui';

import {
  View,
  ToolbarAndroid,
  Alert,
  TextInput,
  Text,
  Image,
  ToastAndroid,
  ViewPagerAndroid,
  ListView,
  TouchableNativeFeedback,
  TouchableOpacity,
  BackAndroid,
  Dimensions,
  RefreshControl,
} from 'react-native';
import * as widget from './widget';
import * as common from './cmp.common';

export const calculateLayout = (size=Dimensions.get('window')) => {
    const orientation = size.width > size.height ? 'landscape': 'portrait';
    let wide = 'normal';
    if (size.width >= 480) { // Size is big
        wide = 'wide';
    };
    if (size.width < 320) {
        wide = 'narrow';
    };
    let tall = 'normal';
    if (size.height < 426) { // too short
        tall = 'short';
    };
    if (size.height >= 640) { // tall
        tall = 'tall';
    };
    return {
        orientation, wide, tall,
        width: size.width,
        height: size.height,
    };
};

export class AppCmp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    calcLayoutChange(winSize) {
        const {onLayoutChange} = this.props;
        if (onLayoutChange) onLayoutChange(calculateLayout(winSize));
    }

    render() {
        return (
            <View
                style={_l([styles.vproxy, styles.max, styles.app])}
                onLayout={(e) => {
                    this.calcLayoutChange(e.nativeEvent.layout);
                }}
            >
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
            onManageProfiles,
            info,
        } = this.props;
        let subTitle;
        if (info.id != info.title) { // Special title
            subTitle = info.title;
        };
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
        }, {
            title: 'Manage profiles',
            show: 'never',
            onAction: () => {
                onManageProfiles();
            }
        }];
        return (
            <ToolbarAndroid
                style={_l(styles.flex0, styles.toolbar)}
                title="Taskwarrior"
                subtitle={subTitle}
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

    paneConfig(field) {
        return {
            visible: this.props[field] !== 'hidden',
            compact: this.props[field] === 'compact',
        }
    }

    renderExtra() {
        return this.props.extra.map((item, idx) => {
            return (
                <View key={idx} style={_l(styles.flex0)}>
                    {item}
                </View>
            );
        });
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
            const {compact} = this.props;
            if (compact) { // Simple list
                const list = this.state.list.map((item) => {
                    return renderOne(item, this.props);
                });
                return (
                    <View>
                        {list}
                    </View>
                );
            };
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
                props.onClick(item, false);
            }}
            onLongPress={() => {
                props.onClick(item, true);
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
                props.onClick(item, false);
            }}
            onLongPress={() => {
                props.onClick(item, true);
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
                {this.renderExtra()}
                <ProjectsNavigation
                    title="Projects"
                    {...this.paneConfig('projectsMode')}
                    onRefresh={this.props.onRefreshProjects}
                    onClick={this.props.onProjectClick}
                    projects={this.props.projects || []}
                    expanded={this.props.projectsExpanded}
                    onExpand={this.props.onExpandProjects}
                    info={this.props.info}
                />
                <TagsNavigation
                    title="Tags"
                    {...this.paneConfig('tagsMode')}
                    onRefresh={this.props.onRefreshTags}
                    onClick={this.props.onTagClick}
                    tags={this.props.tags || []}
                    expanded={this.props.tagsExpanded}
                    onExpand={this.props.onExpandTags}
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
                props.onClick(item);
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
                props.onClick(item.context, {});
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
                {this.renderExtra()}
                <ReportsNavigation
                    title="Reports"
                    {...this.paneConfig('reportsMode')}
                    reports={reports}
                    onRefresh={onReportsRefresh}
                    onClick={onReportClick}
                    expanded={this.props.reportsExpanded}
                    onExpand={this.props.onExpandReports}
                />
                <ContextsNavigation
                    title="Contexts"
                    {...this.paneConfig('contextsMode')}
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
        let lineStyle = [styles.hflex];
        const {title, multiline} = this.props;
        if (windowSize.width < 600) { // Smaller than Nexus 7
            lineStyle = [styles.vflex, styles.input_narrow];
        } else {
            if (!multiline) {
                lineStyle.push(styles.hbar);
            };
        }
        let extraStyle = {};
        let rows = styles.multiline.rows;
        if (multiline) {
            extraStyle = {
                height: styles.inp.height * rows,
                textAlignVertical: 'top',
            };
        }
        return (
            <View style={_l(styles.input_box, styles.vflex)}>
                <View style={_l(lineStyle)}>
                    <widget.Text style={_l(styles.input_text)}>{title}</widget.Text>
                    <TextInput
                        style={_l(styles.inp, styles.flex1, extraStyle)}
                        ref="input"
                        onChangeText={this.onChange.bind(this)}
                        multiline={multiline? true: false}
                        numberOfLines={rows}
                        value={this.state.input}
                        underlineColorAndroid="transparent"
                        onSubmitEditing={() => {
                            if (!multiline) this.finish(true);
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

class ModalDialog extends React.Component {

    render(body) {
        const windowSize = Dimensions.get('window');
        const large = windowSize.width > 480 && windowSize.height > 480;
        const st = [
            styles.modal_inner, 
            large? styles.modal_large: styles.modal_small, 
            styles.vflex
        ];
        return (
            <View style={_l(styles.modal_dialog)}>
                <View style={_l(st)}>
                    {body}
                </View>
            </View>
        )
    }
}

class ProfilesDialog extends ModalDialog {

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

    refresh() {
        const {provider} = this.props;
        const {dataSource} = this.state;
        smooth(async () => {
            const profiles = await provider.profiles();
            this.setState({
                dataSource: dataSource.cloneWithRows(profiles),
            });
        });
    }

    add() {
        const {provider} = this.props;
        smooth(async () => {
            const err = await provider.addProfile();
            if (!err) { // Added
                this.refresh();
            } else {
                ToastAndroid.show(err, ToastAndroid.LONG);
            }
        });
    }

    star(id) {
        const {provider} = this.props;
        smooth(async () => {
            const success = await provider.profileDefault(id);
            if (success) { // Starred
                this.refresh();
            };
        });
    }

    remove(item) {
        const {provider} = this.props;
        Alert.alert('Remove profile', `Remove profile '${item.title}'?`, [{
            text: 'Cancel',
        }, {
            text: 'Remove',
            onPress: async () => {
                const success = await provider.removeProfile(item.id);
                if (success) {
                    this.refresh();
                    provider.finish();
                }
            },
        }]);
    }

    componentDidMount() {
        this.refresh();
    }

    render() {
        const {provider} = this.props;
        const actions = [{
            title: 'New profile',
            icon: {uri: 'ic_plus'},
            show: 'always',
            onAction: () => {
                this.add();
            },
        }, {
            title: 'Reload',
            icon: {uri: 'ic_refresh'},
            show: 'always',
            onAction: () => {
                this.refresh();
            },
        }];
        const renderOne = (item) => {
            let subText;
            if (item.id != item.title) { // Show id
                subText = (
                    <Text
                        style={_l(styles.text, styles.textSmall)}
                        numberOfLines={1}
                    >
                        {item.id}
                    </Text>
                );
            };
            const starIcon = item['default']? 'starred': 'star';
            return (
                <View style={_l(styles.hflex, styles.hbar, styles.profile_item, styles.one_nav)}>
                    <View style={_l(styles.flex1, styles.vflex)}>
                        <Text
                            style={_l(styles.text)}
                            numberOfLines={1}
                        >
                            {item.title}
                        </Text>
                        {subText}
                    </View>
                    <widget.IconBtn icon={starIcon} onClick={(e) => {
                        this.star(item.id);
                    }}/>
                    <widget.IconBtn icon="close" onClick={(e) => {
                        this.remove(item);
                    }}/>
                    <widget.IconBtn icon="link" onClick={(e) => {
                        smooth(() => {
                            provider.openProfile(item.id);
                        });
                    }}/>
                </View>
            );
        };
        return super.render(
            <View style={_l(styles.vflex, styles.flex1)}>
                <ToolbarAndroid
                    style={_l(styles.flex0, styles.toolbar)}
                    title="Profiles"
                    actions={actions}
                    onActionSelected={(idx) => {
                        actions[idx].onAction();
                    }}
                />
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

export class MainCmp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    showProfiles(provider) {
        if (this.state.dialog) return;
        this.setState({
            dialog: (
                <ProfilesDialog provider={provider} />
            )
        });
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

    componentWillReceiveProps(props) {
        const {pages, layout} = props;
        const pageCmps = pages.forEach((pageCmp, idx) => {
            if (pageCmp.ref) {
                pageCmp.ref.setLayout(layout);
            }
        });
    }

    render() {
        const {pages, pins, page, onNavigation, panes, layout} = this.props;
        const {input, dialog} = this.state;
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
                    multiline={input.context.multiline}
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
                {dialog}
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

    onBack(e) {
        if (this.state.dialog) {
            this.setState({dialog: undefined});
            return true;
        }
    }

    componentDidMount() {
        BackAndroid.addEventListener('hardwareBackPress', this.onBack.bind(this));
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
            refreshing: false,
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

    async onPull() {
        this.setState({refreshing: true});
        await this.props.onSync();
        this.setState({refreshing: false});
    }

    renderBody(header, info) {
        const renderOne = (task, sid, idx) => {
            return this.renderTask(task, idx, cols, info);
        };
        const cols = info.cols.filter((item) => {
            return item.visible;
        });
        const refreshToSync = (
            <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this.onPull.bind(this)}
            />
        );
        const {layout} = this.props;
        let headerDom;
        if (header) { // Show header
            headerDom = (
                <View style={_l(styles.flex0, styles.hflex, styles.wflex)}>{header}</View>
            );
        };
        return (
            <View style={_l(styles.vproxy)}>
                {headerDom}
                <ListView
                    enableEmptySections={true}
                    style={_l(styles.flex1)}
                    dataSource={this.state.dataSource}
                    renderRow={renderOne}
                    refreshControl={refreshToSync}
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

export class CalendarCmp extends React.Component {

    render() {
        const {date, layout} = this.props;
        if (layout.tall == 'short') { // Do not show in short mode
            return null;
        };
        const title = `${date.getFullYear()}/${date.getMonth()+1}`;
        return (
            <common.CalendarPane
                {...this.props}
                title={title}
            />
        );
    }
}
