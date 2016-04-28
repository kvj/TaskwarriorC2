import React from 'react';
import ReactDOM from 'react-dom';

import {styles} from './styles/main';
import {TaskController} from './task/controller'

class DesktopMain extends React.Component {

    render() {
        return (
            <div style={styles.vflex}>Hi Desktop!</div>
        );
    }
}

export const start = () => {
    const domNode = document.getElementById('app');
    ReactDOM.render(React.createElement(DesktopMain, null), domNode);
    const controller = new TaskController();
    if (controller.init({})) { // OK
        controller.version().then((out) => {
            console.log('Version:', out);
        })
    };
};
