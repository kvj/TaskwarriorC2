import React from 'react';
import ReactDOM from 'react-dom';
import 'babel-polyfill';

import {styles, _l} from './styles/main';
import {smooth} from './tool/ui';

class DesktopMain extends React.Component {

    render() {
        console.log('Popup:', this.props);
        return (
            <div>Ready...</div>
        );
    }
}

export const start = () => {
    const domNode = document.getElementById('app');
    const controller = new TaskController();
    smooth(async () => {
        if (await controller.init({})) { // OK
            ReactDOM.render(React.createElement(DesktopMain, {controller}), domNode);
        } else {
            window.alert("'task' binary is not available. Exiting");
            window.close();
        }
    });
};

