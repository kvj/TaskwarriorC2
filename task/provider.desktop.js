const spawn = require('child_process').spawn;

export class TaskProvider {

    constructor(config) {
        this.config = config;
    }

    init() {
        return true;
    }

    call(args, out, err) {
        // Return promise
        return new Promise((resp, rej) => {
            const task = spawn(this.config.task || 'task', args);
            task.stdout.on('data', (data) => {
                if (out) { // Write
                    out.eat(data);
                };
            });
            task.stderr.on('data', (data) => {
                if (err) { // Write
                    err.eat(data);
                };
            });
            task.on('close', (code) => {
                resp(code);
            });
            task.on('err', (err) => {
                rej(err);
            });
        });
    }
}

