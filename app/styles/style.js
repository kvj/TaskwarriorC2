let style = {};
let colorDefs = {};

export const init = (css) => {
    style = css || {};
};

export const colors = () => {
    return colorDefs;
}

export const fontFamily = () => {
    return style['font'] || 'Monaco Regular, Monospace';
};

const clr = (name, def) => {
    let val = style[name] || def;
    if (val && val[0] == '$') return `#${val.substr(1)}`;
    return val;
}

export const layersStyle = (obj, font) => {
    let result = {
        font: {
            fontFamily: font,
        },
    };
    for (var i in obj) {
        const l = obj[i] || {};
        if (l.bg) result[`${i}_bg`] = {backgroundColor: l.bg};
        if (l.fg) result[`${i}_fg`] = {color: l.fg};
        if (l.br) result[`${i}_br`] = {borderColor: l.br};
    };
    return result;
};

export const layers = () => {
    let result = {};
    result.bg = {
        bg: clr('bg.bg', '#fff'),
        fg: clr('bg.fg', '#555'),
        br: clr('bg.br', '#eee'),
    };
    result.l1 = {
        bg: clr('l1.bg', '#fafafa'),
        fg: clr('l1.fg', '#444'),
        br: clr('l1.br', '#ddd'),
    };
    result.l2 = {
        bg: clr('l2.bg', '#eee'),
        fg: clr('l2.fg', '#333'),
        br: clr('l2.br', '#ccc'),
    };
    result.i_sel = {
        bg: clr('i_sel.bg', '#b39ddb'),
    }
    result.panes = {
        left: {
            width: style['pane.left.width'] || 180,
        },
        right: {
            width: style['pane.right.width'] || 180,
        },
    };
    colorDefs = {
        'due': {bg: '#fce4ec'},
        'due.today': {bg: '#f8bbd0'},
        'blocked': {bg: '#cfd8dc'},
        'blocking': {bg: '#c8e6c9'},
        'overdue': {bg: '#f48fb1'},
        'recurring': {bg: '#e3f2fd'},
        'scheduled': {bg: '#b3e5fc'},
        'active': {bg: '#ffe0b2'},
        'completed': {bg: '#a5d6a7'},
        'deleted': {bg: '#e57373'},
        'tag.next': {bg: '#fffde7'},
        'tagged': {bg: '#b2dfdb'},
        'uda.priority.h': {bg: '#ce93d8'},
        'uda.priority.m': {bg: '#e1bee7'},
        'uda.priority.l': {bg: '#f3e5f5'},
    };
    for (let key in style) {
        if (key.indexOf('color.') == 0) { // Override
            colorDefs[key.substr(6)] = {bg: clr(key)};
        };
    };
    return [result, colorDefs];
};
