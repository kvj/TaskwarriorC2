import { NativeModules } from 'react-native';

const app = NativeModules.TwModule;

export class TaskProvider {

    constructor(config) {
        this.config = config;
    }

    async init() {
        console.log('Init:', app);
        const result = await app.init(this.config);
        return result;
    }

    call(args, out, err, options={}) {
        console.log('Calling:', args, options);
    }
}
