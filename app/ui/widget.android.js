import React from 'react';
import {styles, _l} from '../styles/main';

import {
  View,
  ToolbarAndroid,
  Text as RText,
  TouchableOpacity,
  Image,
} from 'react-native';


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

