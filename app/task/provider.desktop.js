const spawn = require('child_process').spawn;
const readline = require('readline');
const {ipcRenderer} = require('electron');

export class TaskProvider {

    constructor(config) {
        this.config = config;
        this.timerIDs = {};
    }

    init() {
        ipcRenderer.on('state', (evt, state) => {
            this.config.onState(state);
        });
        return true;
    }

    configurePanes(conf) {
        conf._modes = {
            "dock": true,
            "float": true,
            "hidden": true,
        };
        conf._default = 'dock';
        return conf;
    }

    call(args, out, err, options={}) {
        // Return promise
        const yesno = /^(.+)\s\((\S+)\)\s*$/;
        return new Promise((resp, rej) => {
            const handleQuestion = async (question, choices) => {
                const answer = await this.config.onQuestion(question, choices);
                if (answer === undefined) {
                    task.kill();
                    return;
                }
                task.stdin.write(`${answer[0]}\n`);
            }
            const stream2out = (stream, outp, has_question) => {
                stream.setEncoding('utf8');
                let head = '';
                stream.on('data', (line) => {
                    const eat_all = line && line[line.length-1] == '\n';
                    const lines = (head+line).split('\n');
                    head = '';
                    lines.forEach((l, idx) => {
                        const last = idx == lines.length-1;
                        if (!last || eat_all) { // Eat
                            outp && outp.eat(l);
                            return;
                        };
                        if (has_question) {
                            const m = l.match(yesno);
                            // console.log('Question:', m, options, l);
                            if (m) {
                                options.flush && options.flush();
                                handleQuestion(m[1], m[2].split('/'));
                                return;
                            }
                        }
                        head = l; // Save as head
                    });
                });
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
            // console.log('Run:', arr, args);
            const task = spawn(this.config.task || 'task', arr);
            stream2out(task.stdout, out, true);
            stream2out(task.stderr, err, false);
            task.on('close', (code) => {
                if (options.slow) {
                    setTimeout(() => {
                        resp(code);
                    }, 10);
                } else {
                    resp(code);
                }
            });
            task.on('err', (err) => {
                rej(err);
            });
        }).then((code) => {
            return code;
        }, (err) => {
            console.log('Error:', err);
        });
    }

    schedule(seconds, type, interval) {
        // console.log('Schedule:', seconds, type);
        if (this.timerIDs[type]) { // Clear first
            const clrFn = interval? clearInterval: clearTimeout;
            clrFn(this.timerIDs[type]);
            delete this.timerIDs[type];
        };
        if (seconds > 0) { // Schedule
            const setFn = interval? setInterval: setTimeout;
            this.timerIDs[type] = setFn(() => {
                this.config.onTimer(type);
            }, seconds * 1000);
        };
    }
}
