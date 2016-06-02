import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';

import {TaskController} from './app/task/controller';
import {AppPane} from './app/ui/top';

class taskwc2 extends Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    async componentDidMount() {
        const controller = new TaskController();
        if (await controller.init({})) { // OK
            console.log('Ready to show UI');
            this.setState({controller,});
        } else {
            console.log('Not ready');
        }
    }

    render() {
        const {controller} = this.state;
        if (controller) { // Render UI
            return (<AppPane controller={controller} />);
        };
        return (
            <View style={styles.container}>
                <Text style={styles.loading}>
                    Loading...
                </Text>
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
  loading: {
    fontSize: 20,
    textAlign: 'center',
  },
});

AppRegistry.registerComponent('taskwc2', () => taskwc2);
