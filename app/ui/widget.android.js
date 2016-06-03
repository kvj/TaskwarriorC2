import React from 'react';
import {styles, _l} from '../styles/main';

import {
  View,
  ToolbarAndroid,
  Text as RText,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';

export const Div = (props) => {
    return (<View {...props}>{props.children}</View>);
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
        let st = [styles.hflex, styles.menu];
        let wst = [styles.hflex, styles.menu_popup];
        if (style && style.length) { // Copy
            st = st.concat(style);
            wst = wst.concat(style);
        };
        if (expanded) { // Render
            menu = (
                <View style={_l(styles.flex0, styles.menu_wrap)}>
                    <View
                        style={_l(wst)}
                    >
                        {children}
                    </View>
                </View>
            );
        };
        return (
            <View style={_l(st)}>
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
            <Image source={{uri: `ic_${icon}`}} style={_l(styles.icon)} />
        </TouchableOpacity>
    );
    return (
        <button
            style={_l([styles.btn])}
            onClick={(evt) => {
                if (props.onClick) props.onClick(eventInfo(evt));
            }}
            title={props.title}
        >
            <i className={`fa fa-fw fa-${props.icon}`}></i>
        </button>
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
    if (props.style && props.style.indexOf(styles.oneLine)) { // Single line
        lines = 1;
    };
    return (
        <RText
            style={_l(_st)}
            numberOfLines={lines}
            onPress={() => {
                if (props.onClick) props.onClick({});
            }}
            onLongPress={() => {
                if (props.onEdit) props.onEdit({longTap: true});
            }}
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
        const {onPin} = this.props;
        const line1 = (
            <View style={_l(styles.flex0, styles.hflex, styles.wflex)}>
                <TextInput
                    style={_l(styles.inp, styles.flex1)}
                    value={this.state.report}
                    onChangeText={this.onReportChange.bind(this)}
                    placeholder="Report"
                />
                <IconBtn
                    icon="plus"
                    onClick={this.props.onAdd}
                    title="Add new"
                />
                <IconBtn icon="refresh" onClick={this.props.onRefresh} />
                <IconBtn icon="close" onClick={this.props.onClose} />
            </View>
        );
        const line2 = (
            <View style={_l(styles.flex0, styles.hflex)}>
                <TextInput
                    style={_l(styles.inp, styles.flex1)}
                    ref="filter"
                    value={this.state.filter}
                    onChangeText={this.onFilterChange.bind(this)}
                    placeholder="Filter"
                />
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
