import React from 'react';
import {styles, _l} from '../styles/main';

import {
  View,
  ToolbarAndroid,
  Text as RText,
  TouchableOpacity,
  TouchableNativeFeedback,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';

export const LoadingIndicator = (props) => {
    return (
        <View style={_l(styles.loadingIndicator)}>
            <ActivityIndicator size="small" />
        </View>
    );
};

export const Div = (props) => {
    return (
        <View
            {...props}
        >
            {props.children}
        </View>
    );
};

export class IconMenu extends React.Component {

    constructor(props) {
        super(props);
        this.state = {expanded: false};
    }

    render() {
        const {children, dir, style} = this.props;
        const {expanded} = this.state;
        let menu = null;
        let st =  [styles.hflex, styles.menu];
        let wst = [styles.hflex, styles.menu_popup];
        if (style && style.length) { // Copy
            st = st.concat(style);
            wst = wst.concat(style);
        };
        if (expanded) { // Render
            menu = (
                <View
                    collapsable={false}
                    style={_l(wst)}
                >
                    {children}
                </View>
            );
        };
        return (
            <View
                style={_l(st)}>
                {menu}
                <IconBtn
                    icon={expanded? 'menu_right': 'menu_left'}
                    onClick={this.onMenu.bind(this)}
                />
            </View>
        );
    }

    onMenu() {
        this.setState({
            expanded: !this.state.expanded,
        });
    }

    onMenuHide() {
        this.setState({
            expanded: false,
        });
    }
}
export const IconBtn = (props) => {
    let icon = props.icon || '';
    icon = icon.replace('-', '_');
    return (
        <TouchableOpacity
            style={_l(styles.btn)}
            onPress={(evt) => {
                if (props.onClick) props.onClick({});
            }}
            onLongPress={(evt) => {
                if (props.onClick) props.onClick({longTap: true});
            }}
        >
            <View>
                <Image source={{uri: `ic_${icon}`}} style={_l(styles.icon)} />
            </View>
        </TouchableOpacity>
    );
}

export const Text = (props) => {
    let _st = [styles.flex0, styles.text];
    if (props.style && props.style.length) {
        _st = _st.concat(props.style);
    }
    const val = props.children || '';
    let sfx = ''
    while (props.width > val.length+sfx.length) {
        sfx += ' ';
    }
    if (props.editable !== undefined) {
        sfx += ' ';
    }
    let lines = undefined;
    if (props.style && props.style.indexOf(styles.oneLine) != -1) { // Single line
        lines = 1;
    };
    if (props.single) { // Same
        lines = 1;
    };
    const pressHandler = props.onClick? () => {
        props.onClick({});
    }: undefined;
    const longPressHandler = props.onEdit? () => {
        props.onEdit({longTap: true});
    }: undefined;
    return (
        <RText
            style={_l(_st)}
            numberOfLines={lines}
            onPress={pressHandler}
            onLongPress={longPressHandler}
        >
            {val}{sfx}
        </RText>
    );
}

export class DnD extends React.Component {
    constructor(props) {
        super(props);
        this.dropTypes = [];
    }
}

export class TaskPageInput extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            report: props.report || '',
            filter: props.filter || '',
        };
    }

    onReportChange (value) {
        this.setState({
            report: value,
        });
    }

    onFilterChange (value) {
        this.setState({
            filter: value,
        });
    }

    render() {
        const {
            onPin,
            onRefresh,
            onAdd,
            onToggleSort,
            sortMode,
            onToggleExpand,
            expanded,
        } = this.props;
        const line1 = (
            <View style={_l(styles.flex0, styles.hflex, styles.wflex, styles.hbar)}>
                <TextInput
                    underlineColorAndroid="transparent"
                    style={_l(styles.inp, styles.flex1)}
                    value={this.state.report}
                    onChangeText={this.onReportChange.bind(this)}
                    onSubmitEditing={onRefresh}
                    placeholder="Report"
                />
                <IconBtn
                    icon="plus"
                    onClick={(e) => {
                        onAdd(e.longTap);
                    }}
                    title="Add new"
                />
                <IconBtn icon="refresh" onClick={this.props.onRefresh} />
                <IconBtn icon="close" onClick={this.props.onClose} />
            </View>
        );
        const sortIcon = sortMode == 'tree'? 'tasks_tree': 'tasks_list';
        const expandIcon = expanded? 'compress': 'expand';
        const line2 = (
            <View style={_l(styles.flex0, styles.hflex, styles.wflex, styles.hbar)}>
                <TextInput
                    style={_l(styles.inp, styles.flex1)}
                    ref="filter"
                    value={this.state.filter}
                    onChangeText={this.onFilterChange.bind(this)}
                    onSubmitEditing={onRefresh}
                    placeholder="Filter"
                    underlineColorAndroid="transparent"
                />
                <IconBtn icon={sortIcon} onClick={onToggleSort} />
                <IconBtn icon={expandIcon} onClick={onToggleExpand} />
            </View>
        );

        return (
            <View style={_l(styles.flex0)}>
                {line1}
                {line2}
            </View>
        );
    }

    input() {
        return this.state;
    }

    onKey(evt) {
        if (evt.charCode == 13) {
            // Refresh
            this.props.onRefresh();
        }
    }

    filter(filter) {
        this.state.filter = filter;
        this.setState({
            filter: filter,
        });
    }

}

export class CmdPageInput extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            cmd: props.cmd || '',
        };
    }

    onChange (value) {
        this.setState({
            cmd: value,
        });
    }

    render() {
        const {
            onPin,
            onRefresh,
            onClose,
        } = this.props;
        const line1 = (
            <View style={_l(styles.flex0, styles.hflex, styles.wflex, styles.hbar)}>
                <TextInput
                    style={_l(styles.inp, styles.flex1)}
                    value={this.state.cmd}
                    onChangeText={this.onChange.bind(this)}
                    onSubmitEditing={onRefresh}
                    placeholder="Taskwarriror command"
                    underlineColorAndroid="transparent"
                />
                <IconBtn icon="refresh" onClick={onRefresh} />
                <IconBtn icon="close" onClick={onClose} />
            </View>
        );
        return (
            <View style={_l(styles.flex0)}>
                {line1}
            </View>
        );
    }

    input() {
        return this.state;
    }

    filter(filter) {
        // TODO: no-op
    }

}

export class CalendarItem extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const {style, children, value, onClick} = this.props;
        return (
            <Text
                style={style}
                onClick={onClick}
            >
                {children}
            </Text>
        );
    };
}

