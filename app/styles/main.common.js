import {layers, fontFamily, layersStyle} from './style';

export const makeCommon = (style) => {
    const [_layers, _colorDefs] = layers();
    const _fontFamily = fontFamily();
    const _layersStyle = layersStyle(_layers, _fontFamily);
    const _colorsStyle = layersStyle(_colorDefs, _fontFamily);
    const _styles = {
        "wflex": {
            flexWrap: 'wrap',
        },
        "hbar": {
            alignItems: "center",
        },
        "eflex": {
            justifyContent: "flex-end",
        },
        right_pane: {
            width: _layers.panes.right.width,
            backgroundColor: _layers.bg.bg,
        },
        left_pane: {
            width: _layers.panes.left.width,
            backgroundColor: _layers.bg.bg,
        },
        paneTitle: {
            marginLeft: 5,
        }
    };
    for (var key in _layersStyle) {
        style[key] = _layersStyle[key];
    };
    for (var key in _styles) {
        style[key] = _styles[key];
    };
    for (var key in _colorsStyle) {
        style[`color_${key}`] = _colorsStyle[key];
    };
    return style;
}
