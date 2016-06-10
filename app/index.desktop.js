import React from 'react';
import ReactDOM from 'react-dom';
import 'babel-polyfill';

import {styles, _l} from './styles/main';
import {TaskController} from './task/controller';
import {AppPane} from './ui/top';
import {smooth} from './tool/ui';

class DesktopMain extends React.Component {

    render() {
        console.log('Desktop:', this.props);
        return (
            <AppPane controller={this.props.controller} />
        );
    }
}

export const start = () => {
    const domNode = document.getElementById('app');
    const controller = new TaskController();
    smooth(async () => {
        if (await controller.init({})) { // OK
            ReactDOM.render(React.createElement(DesktopMain, {controller}), domNode);
        };
    });
};
