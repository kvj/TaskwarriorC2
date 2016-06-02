import {layers, fontFamily} from './style';
import {makeCommon} from './main.common';

import {
  StyleSheet,
} from 'react-native';

export let styles = {};

export const init = () => {
    const [_layers, _colorDefs] = layers();
    const _fontFamily = 'monospace';
    const _styles = {
        "vflex": {
            flexDirection: 'column',
        },
        "hflex": {
            flexDirection: 'row',
        },
        "flex1": {
            flex: 1,
        },
        "flex1s": {
            flex: 1,
        },
        "flex0": {
            flex: 0,
        },
        "spacer": {
            flex: 1,
        },
        "vproxy": {
            flex: 1,
            flexDirection: 'column',
        },
        "hproxy": {
            flex: 1,
            flexDirection: 'row',
        },
        toolbar: {
            height: 56,
        },
        input_box: {
            position: 'absolute',
            marginTop: 100,
            left: 0,
            right: 0,
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: _layers.bg.br,
            backgroundColor: _layers.bg.bg,
            padding: 10,
        },
        btn: {
            justifyContent: 'center',
            alignItems: 'center',
            padding: 3,
        },
        icon: {
            width: 32,
            height: 32,
        },
        text: {
            fontSize: 14,
            fontFamily: _fontFamily,
        },
        inp: {
            fontSize: 14,
            width: 1024,
            fontFamily: _fontFamily,
            borderLeftWidth: 2,
            borderStyle: 'solid',
            borderLeftColor: _layers.l2.fg,
            backgroundColor: _layers.l2.bg,
            color: _layers.l2.fg,
            height: 32,
            padding: 3,
            margin: 3,
        },

    };
    let __styles = makeCommon({});
    for (var key in _styles) {
        __styles[key] = _styles[key];
    };
    styles = StyleSheet.create(__styles);
};

export const _l = (...args) => {
    let arr = args;
    if (arr.length == 1 && Array.isArray(arr[0])) { // Convert
        return arr[0];
    };
    return args;
};
