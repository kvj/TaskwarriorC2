const spawn = require('child_process').spawn;
const readline = require('readline');
const {ipcRenderer} = require('electron');

const fs = require('fs');

export class TaskProvider {

    constructor(config) {
        this.config = config;
        this.timerIDs = {};
    }

    async readConfig(filename, key) {
        return new Promise((rsp, rej) => {
            let home = process.env.HOME;
            if (home) home += '/';
            fs.readFile(home+filename, {encoding: 'utf8'}, (err, data) => {
                if (err) { // No data
                    console.log('readConfig:', err);
                    // return rej(err);
                    return rsp(undefined);
                };
                let value;
                data.split('\n').forEach((line) => {
                    const eq = line.indexOf('=');
                    if (eq>0 && line.substr(0, eq).trim() == key) { // Found
                        value = line.substr(eq+1).trim();
                    };
                });
                return rsp(value);
            });
        });
    }

    async checkTask() {
        try {
            const code = await this.call(['--version']);
            if (code != 0) {
                console.log('Task is not good', code);
                return false;
            };
        } catch (e) {
            console.log('Task is not available', e);
            return false;
        };
        return true;
    }

    async findBinary() {
        if (await this.checkTask()) {
            return true;
        }
        if (process.platform == 'darwin') { // Try /usr/local/bin/task
            this.config.task = '/usr/local/bin/task';
            if (await this.checkTask()) {
                return true;
            }
        };
        const taskPath = await this.readConfig('.taskrc', 'ui.task');
        if (taskPath) { // Found
            this.config.task = taskPath;
            if (await this.checkTask()) {
                return true;
            }
        };
        return false;
    }

    async init() {
        if (! await this.findBinary()) {
            return false;
        }
        ipcRenderer.on('state', (evt, state) => {
            this.config.onState(state);
        });
        window.addEventListener('online', (e) => {
            // console.log('Changed state:', navigator.onLine);
            if (navigator.onLine) { // Send event
                this.config.onState('online');
            };
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
        const yesno = /^(.+)\s\((\S+)\)\s$/;
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
                if (s[0] == '"' && s[s.length-1] == '"') {
                    arr.push(s.substr(1, s.length-2));
                    continue;
                }
                arr.push.apply(arr, s.split(' '));
            }
            let task;
            task = spawn(this.config.task || 'task', arr);
            stream2out(task.stdout, out, options.question);
            stream2out(task.stderr, err, false);
            task.on('close', (code) => {
                if (options.slow) {
                    setTimeout(() => {
                        resp(code);
                    }, 1);
                } else {
                    resp(code);
                }
            });
            task.on('error', (err) => {
                rej(err);
            });
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
