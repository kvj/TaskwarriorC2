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

export const IconBtn = (props) => {
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
            <Image source={{uri: `ic_${props.icon}`}} style={_l(styles.icon)} />
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
    return (
        <RText style={_l(_st)}
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
                <IconBtn icon="cancel" onClick={this.props.onClose} />
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
