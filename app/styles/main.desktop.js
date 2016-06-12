import {layers, fontFamily} from './style';
import {makeCommon} from './main.common';

export let styles = {};

export const init = () => {
    const [_layers, _colorDefs] = layers();
    const _fontFamily = fontFamily();
    const _styles = {
        "vflex": {
            display: 'flex',
            flexDirection: 'column',
        },
        "hflex": {
            display: 'flex',
            flexDirection: 'row',
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
        "max": {
            width: '100%',
            height: '100%',
        },

        "none": {
            display: 'none',
        },

        "hidden": {
            visibility: 'hidden',
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

        "btn_a": {
            padding: 5,
            color: _layers.bg.fg,
            fontFamily: _fontFamily,
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
            width: _layers.panes.left.width,
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
            borderLeft: `1px solid ${_layers.bg.br}`,
            order: 2,
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
            marginBottom: 5,
        },

        one_item: {
            backgroundColor: _layers.l1.bg,
            color: _layers.l1.fg,
        },

        task_selected: {
            backgroundColor: _layers.i_sel.bg,
        },

        task_drop: {
            transform: "translateX(15px)",
        },

        one_nav: {
            backgroundColor: _layers.l1.bg,
            color: _layers.l1.fg,
            margin: "0 3px 5px 3px",
            cursor: "pointer",
            padding: 3,
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
        pane: {
            position: 'relative',
        },
        paneBody: {
            margin: 3,          
        },
        loadingIndicator: {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 150,
            fontSize: '3em',
            textAlign: 'center',
            opacity: 0.2,
        },
        float_pane: {
            position: 'absolute',
            width: '100%',
            height: '100%',
            left: 0,
            top: 0,
            flexDirection: 'row',
            alignItems: 'stretch',
            display: 'flex',
        },
        float_space: {
            backgroundColor: _layers.bg.bg,
            opacity: 0.2,
        },

    };
    makeCommon(styles);
    for (var key in _styles) {
        styles[key] = _styles[key];
    };
    console.log('Styles total:', styles);
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
