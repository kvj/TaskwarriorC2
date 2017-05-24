import React from 'react';
import ReactDOM from 'react-dom';
import 'babel-polyfill';

import {styles, _l} from './styles/main';
import {init as styleInit} from './styles/style';
import {init as stylesInit} from './styles/main';
const {ipcRenderer} = require('electron');

class DesktopMain extends React.Component {

    constructor(props) {
        super(props);

        ipcRenderer.on('init', (evt, css, config) => {
            // console.log('Init CSS:', css, config);
            styleInit(css);
            stylesInit(css);
        });

        ipcRenderer.on('data', (evt, data) => {
            // console.log('Show data:', data);
            this.setState({data,});
        });
        this.state = {};
    }

    mouseHandler(evt) {
        ipcRenderer.send('popup-raise');
    }

    componentDidMount() {
        ipcRenderer.send('popup-opened');
    }

    render() {
        const {data} = this.state;
        let st = [styles.popup, styles.color_completed_bg];
        if (data && data.active) { // Add extra style
            st.push(styles.color_active_bg);
        };
        return (
            <div style={_l(st)} onMouseDown={(evt) => {
                return this.mouseHandler(evt);
            }}>
                <div style={_l(styles.popup_move)}></div>
            </div>
        );
    }
}

export const start = () => {
    const domNode = document.getElementById('app');
    ReactDOM.render(React.createElement(DesktopMain, {}), domNode);
};

