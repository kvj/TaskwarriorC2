import {layers, fontFamily, layersStyle} from './style';

export let styles = {};

export const init = () => {
    const _layers = layers();
    const _fontFamily = fontFamily();
    const _layersStyle = layersStyle(_layers, _fontFamily);
    const _styles = {
        "vflex": {
            display: 'flex',
            flexDirection: 'column',
        },
        "hflex": {
            display: 'flex',
            flexDirection: 'row',
        },
        "wflex": {
            flexWrap: 'wrap',
        },
        "flex1": {
            flex: '1 1 auto',
        },
        "flex1s": {
            flex: '1 1 0',
            overflowY: 'auto',
            overflowX: 'hidden',
        },
        "flex0": {
            flex: '0 0 auto',
        },
        "spacer": {
            flex: '1 1 0',
        },
        "vproxy": {
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
        },
        "hproxy": {
            flex: '1',
            display: 'flex',
            flexDirection: 'row',
        },
        "hbar": {
            alignItems: "center",
        },
        "eflex": {
            justifyContent: "flex-end",
        },
        "max": {
            width: '100%',
            height: '100%',
        },

        "none": {
            display: 'none',
        },

        "btn": {
            border: 0,
            borderRadius: 0,
            margin: 3,
            padding: 5,
            textAlign: "center",
            fontSize: "1em",
            backgroundColor: 'transparent',
            color: _layers.bg.fg,
            outline: "none",
        },

        "inp": {
            border: 0,
            borderRadius: 0,
            margin: 3,
            padding: 5,
            fontSize: "1em",
            verticalAlign: "middle",
            backgroundColor: _layers.l2.bg,
            color: _layers.l2.fg,
            fontFamily: _fontFamily,
            minWidth: 150,
            borderLeft: `4px solid ${_layers.l2.br}`,
        },
        "oneLine": {
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: 'hidden',
        },

        "pre": {
            whiteSpace: "pre",
        },

        "textSmall": {
            fontSize: "0.8em",
        },

        "textRight": {
            textAlign: "right",
        },

        "textCenter": {
            textAlign: "center",
        },

        "floatBR": {
            position: "absolute",
            right: 5,
            bottom: 20,
            width: 350,
        },
        "floatCenter": {
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
        },

        app: {
            textAlign: "left",
            backgroundColor: _layers.bg.bg,
            color: _layers.bg.fg,
        },

        center: {
            position: 'relative',
        },

        relative: {
            position: 'relative',
        },

        toolbar: {
            borderBottom: `1px solid ${_layers.bg.br}`,
        },

        statusbar: {
            borderTop: `1px solid ${_layers.bg.br}`,
            padding: 3,
            minHeight: 25,
        },

        navigation: {
            width: 150,
            borderRight: `1px solid ${_layers.bg.br}`,
            backgroundColor: _layers.bg.bg,
            order: 0,
        },

        cmdPane: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'auto',
        },

        navigationFloat: {
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
        },

        reports: {
            width: 150,
            borderLeft: `1px solid ${_layers.bg.br}`,
            backgroundColor: _layers.bg.bg,
            order: 2,
        },

        reportsFloat: {
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
        },

        tasks: {
            order: 1,
        },

        text: {
            fontSize: "1em",
            verticalAlign: "middle",
            fontFamily: _fontFamily,
            whiteSpace: 'pre-wrap',
        },

        text_edit: {
            verticalAlign: "middle",
            fontSize: "0.7em",
            visibility: "hidden",
            cursor: "pointer",
        },

        one_task: {
            backgroundColor: _layers.l1.bg,
            color: _layers.l1.fg,
            margin: "0 3px 5px 3px",
        },

        one_nav: {
            backgroundColor: _layers.l1.bg,
            color: _layers.l1.fg,
            margin: "0 3px 5px 3px",
            cursor: "pointer",
        },

        hilite: {
            backgroundColor: _layers.l2.bg,
            color: _layers.l2.fg,
        },

        description: {
            alignSelf: 'center',
        },

        annotation_line: {
            marginLeft: 15,
            alignSelf: 'center',
        },

        cmdLine_error: {
            fontWeight: 'bold',
        },

        floatBlock: {
            backgroundColor: _layers.bg.bg,
            padding: 5,
            marginBottom: 10,
            cursor: "pointer",
            border: `2px solid ${_layers.bg.br}`,
        },
        input_box: {
            margin: "0 auto",
            marginTop: 150,
            width: "100%",
            maxWidth: 700,
            backgroundColor: _layers.bg.bg,
            color: _layers.bg.fg,
            border: `2px solid ${_layers.bg.br}`,
            padding: 5,
        },

        menu: {
        },

        menu_wrap: {
            position: "relative",
            width: 0,
        },

        menu_popup: {
            position: "absolute",
            top: 0,
            right: 0,
        },

    };
    for (var key in _layersStyle) {
        styles[key] = _layersStyle[key];
    };
    for (var key in _styles) {
        styles[key] = _styles[key];
    };
};

export const _l = (...args) => {
    let arr = args;
    if (arr.length == 1 && Array.isArray(arr[0])) { // Convert
        arr = arr[0];
    };
    if (arr.length == 1) { // One item
        return arr[0];
    };
    // Join
    let result = {};
    for (var arg of arr) {
        if (!arg) {
            continue;
        }
        for (var key in arg) {
            if (arg.hasOwnProperty(key)) {
                result[key] = arg[key];
            }
        }
    }
    return result;
}
