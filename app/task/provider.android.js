import { NativeModules } from 'react-native';

const app = NativeModules.TwModule;

export class TaskProvider {

    constructor(config) {
        this.config = config;
    }

    async init() {
        // console.log('Init:', app);
        const result = await app.init(this.config);
        return result;
    }

    call(args, out, err, options={}) {
        return new Promise((resp, rej) => {
            const cb = (type, result, outs, errs, ...lines) => {
                if (type == 'error') rej(result);
                if (type == 'success') {
                    resp(result);
                    // console.log('Success:', type, result, outs, errs, lines);
                    if (out && outs) { // Copy to out
                        for (var i = 0; i < outs; i++) {
                            out.eat(lines[i]);
                        };
                    };
                    if (err) { // Copy to err
                        for (var i = 0; i < errs; i++) {
                            err.eat(lines[i+outs]);
                        };
                    };
                }
            };
            app.call(args, cb);
        });
    }
}
