import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';

import {TaskController} from './app/task/controller';
import {AppPane} from './app/ui/top';
import {smooth} from './app/tool/ui';

class taskwc2 extends Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    async componentDidMount() {
        return smooth(async () => {
            const controller = new TaskController();
            if (await controller.init({})) { // OK
                console.log('Ready to show UI');
                this.setState({controller});
            }
        });
    }

    render() {
        const {controller} = this.state;
        if (controller) { // Render UI
            return (<AppPane controller={controller} />);
        };
        return (
            <View style={styles.container}>
                <Image style={styles.logo} source={{uri: 'ic_logo'}} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 72,
    height: 72,
  },
});

AppRegistry.registerComponent('taskwc2', () => taskwc2);
