import {
    NativeModules,
    InteractionManager,
    AppState,
    NetInfo,
} from 'react-native';

const app = NativeModules.TwModule;

export class TaskProvider {

    constructor(config) {
        this.config = config;
    }

    async init() {
        // console.log('Init:', app);
        const result = await app.init(this.config);
        AppState.addEventListener('change', (state) => {
            this.config.onState(state);
        });
        NetInfo.addEventListener('change', (state) => {
            // console.log('Network state:', state);
            this.config.onState(state == 'NONE'? 'offline': 'online', state.toLowerCase());
        });
        return result;
    }

    configurePanes(conf) {
        conf._modes = {
            "dock": true,
            "float": true,
            "hidden": true,
        };
        conf._default = 'dock';
        // TODO: only do that for phones
        conf._default = 'hidden';
        conf._modes.dock = false;
        return conf;
    }

    call(args, out, err, options={}) {
        return new Promise((resp, rej) => {
            const cb = (type, result, outs, errs, ...lines) => {
                if (type == 'error') rej(result);
                if (type == 'success') {
                    resp(result);
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
            let arr = [];
            for (let s of args) {
                if (!s) continue;
                if (s[0] == '(' && s[s.length-1] == ')') {
                    arr.push(s);
                    continue;
                }
                arr.push.apply(arr, s.split(' '));
            }
            app.call(arr, options, cb);
        });
    }

    schedule(seconds, type, interval, conf) {
        // No callback
        return app.scheduleSync(seconds, conf);
    }
}
