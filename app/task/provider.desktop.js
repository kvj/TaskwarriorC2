const spawn = require('child_process').spawn;
const readline = require('readline');

export class TaskProvider {

    constructor(config) {
        this.config = config;
    }

    init() {
        return true;
    }

    call(args, out, err) {
        // Return promise
        const yesno = /^(.+)\s*\(yes\/no\)\s*$/;
        return new Promise((resp, rej) => {
            const handleQuestion = async (question) => {
                const answer = await this.config.onQuestion(question);
                if (answer === undefined) {
                    task.kill();
                    return;
                }
                if (answer === true) {
                    task.stdin.write('y\n');
                }
                if (answer === false) {
                    task.stdin.write('n\n');
                }
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
                            if (m) {
                                handleQuestion(m[1]);
                                return;
                            }
                        }
                        head = l; // Save as head
                    });
                });
            };
            let arr = [];
            for (let s of args) {
                arr.push.apply(arr, s.split(' '));
            }
            const task = spawn(this.config.task || 'task', arr);
            stream2out(task.stdout, out, true);
            stream2out(task.stderr, err, false);
            task.on('close', (code) => {
                resp(code);
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
}
