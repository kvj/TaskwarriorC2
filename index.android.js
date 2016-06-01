import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';

import {TaskController} from './app/task/controller';

class taskwc2 extends Component {

    async componentDidMount() {
        const controller = new TaskController();
        if (await controller.init({})) { // OK
            console.log('Ready to show UI');
        } else {
            console.log('Not ready');
        }
    }

    render() {
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
