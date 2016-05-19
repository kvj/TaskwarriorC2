let style = {};

export const init = (css) => {
    style = css || {};
};

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
    return result;
};

