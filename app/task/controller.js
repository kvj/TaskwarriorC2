import {TaskProvider} from './provider';
import {formatters, parseDate, sortTasks} from './format';
import {EventEmitter} from '../tool/events';
class StreamEater {
    eat(line) {
        // Implement me
    }

    end() {
    }
}

class ToArrayEater extends StreamEater {

    constructor() {
        super();
        this.data = [];
    }

    eat(line) {
        this.data.push(line);
    }
}

class ToStringEater extends ToArrayEater {
    str() {
        return this.data.join('\n').trim();
    }
}

export class TaskController {

    constructor() {
        this.fixParams = ['rc.confirmation=off', 'rc.color=off', 'rc.verbose=nothing'];
        this.events = new EventEmitter();
    }

    async call(args, out, err) {
        const result = await this.provider.call(this.fixParams.concat(args), out, err);
        if (out && out.end) out.end(result);
        if (err && err.end) err.end(result);
        return result;
    }

    err(message) {
        this.events.emit('notify:error', message);
    }

    streamNotify(evt='notify:error') {
        const stream = new ToStringEater();
        stream.end = () => {
            const message = stream.str();
            if (message) { // Not empty
                this.events.emit(evt, message);
            };
        };
        return stream;
    }

    notifyChange() {
        this.events.emit('change');
    }

    async callStr(args) {
        const out = new ToStringEater();
        const code = await this.call(args, out, this.streamNotify());
        if (code != 0) { // Invalid
            return undefined;
        };
        return out.str();
    }

    init(config={}) {
        delete this.provider;
        config.onQuestion = (text) => {
            return new Promise((resp, rej) => {
                this.events.emit('question', text, resp, rej);
            });
        };
        const provider = new TaskProvider(config);
        if (provider.init()) { // OK
            this.provider = provider;
            return true;
        };
        return false;
    }

    async reportInfo(report) {
        let result = {
            sort: [],
            cols: [],
            filter: '',
        };
        let desc = [];
        const config = await this.config(`report.${report}.`);
        const from = `report.${report}.`.length;
        for (let key in config) {
            const k = key.substr(from); // Cut last part
            if (k == 'sort') {
                for (let s of config[key].split(',')) {
                    let item = {
                        field: s,
                        asc: true,
                    };
                    if (item.field[item.field.length-1] == '/') {
                        // Add blank
                        item.sep = true;
                        item.field = item.field.substr(0, item.field.length-1);
                    };
                    item.asc = item.field[item.field.length-1] == '+';
                    item.field = item.field.substr(0, item.field.length-1);
                    result.sort.push(item);
                };
            };
            if (k == 'columns') {
                for (let s of config[key].split(',')) {
                    let cm = s.indexOf('.');
                    if (cm == -1) {
                        result.cols.push({
                            field: s,
                        });
                    } else {
                        result.cols.push({
                            field: s.substr(0, cm),
                            display: s.substr(cm+1),
                        });
                    }
                }
            }
            if (k == 'labels') {
                desc = config[key].split(',');
            }
            if (k == 'description') {
                result.description = config[key];
            }
            if (k == 'filter') {
                result.filter = config[key];
            }
        }
        if (desc.length == result.cols.length) {
            // Same side -> add label
            for (var i = 0; i < desc.length; i++) {
                result.cols[i].label = desc[i];
            }
        } else { // Failsafe
            for (col of result.cols) {
                col.label = col.field;
            }
        }
        return result;
    }

    async filter(report, filter, info) {
        if (!info) {
            info = await this.reportInfo(report);
        }
        if (!info) {
            this.err('Invalid input');
            return undefined;
        }
        info.tasks = []; // Reset
        let cmd = ['rc.json.array=off', 'export'];
        if (info.filter) {
            cmd.push(info.filter);
        }
        if (filter) {
            cmd.push(filter);
        }
        const code = await this.call(cmd, {
            eat(line) {
                if (!line) {
                    return;
                }
                // Parse and save
                try {
                    let json = JSON.parse(line);
                    info.tasks.push(json);
                    // console.log('Date:', json.entry, parseDate(json.entry));
                } catch (e) {
                    console.log('JSON error:', line);
                }
            }
        }, this.streamNotify());
        if (code != 0) {
            console.log('Failure:', cmd);
            return undefined;
        }
        // Calculate sizes
        info.cols.forEach((item) => {
            item.visible = false;
            if (['status'].includes(item.field)) {
                return;
            }
            const handler = formatters[item.field];
            if (!handler) { // Not supported
                // TODO: console.log('Not supported:', item.field);
                // return;
            };
            // Colled max size
            let max = 0;
            // console.log('Col:', item.field);
            info.tasks.forEach((task) => {
                const val = handler? handler(task, item.display): (task[item.field] || '');
                if (val.length > max) {
                    max = val.length;
                };
                task[`${item.field}_`] = val;
                // console.log('Format:', item.field, val, item.display);
            });
            if (max > 0) { // Visible
                item.visible = true;
                item.width = Math.max(max, item.label.length);
                // console.log('Will display:', item.label, item.width);
            };
        });
        info.tasks = sortTasks(info);
        // console.log('Filter:', info, cmd, code);
        return info;
    }

    async undo() {
        const outp = await this.callStr(['undo'], null, this.streamNotify());
        console.log('Undo:', outp);
        if (outp) { // Success
            this.notifyChange();
        };
        return outp;
    }

    async sync() {
        this.events.emit('sync:start');
        const code = await this.call(['sync'], this.streamNotify('notify:info'), this.streamNotify());
        this.events.emit('sync:finish');
        this.notifyChange();
        return code;
    }

    async done(...uids) {
        const code = await this.call([uids.join(','), 'done'], null, this.streamNotify());
        if (code == 0) { // OK
            this.notifyChange();
        };
        return code;
    }

    async version() {
        const out = new ToStringEater();
        const code = await this.provider.call(['--version'], out, this.streamNotify());
        return out.str();
    }

    async config(prefix) {
        const reg = /^([a-z0-9_\.]+)\s(.+)$/;
        let result = {}; // Hash
        await this.call(['show', prefix], {
            eat(line) {
                if (line) {
                    // Our case
                    const m = line.match(reg);
                    if (m) {
                        result[m[1].trim()] = m[2].trim();
                    }
                }
            }
        }, this.streamNotify());
        return result;
    }

    async tags() {
        const reg = /^(.+)\s(\d+)$/;
        let result = []; // List
        await this.call(['tags'], {
            eat(line) {
                const m = line.match(reg);
                if (m) {
                    result.push({
                        name: m[1].trim(),
                        count: parseInt(m[2], 10),
                    });
                }
            }
        }, this.streamNotify());
        return result.sort((a, b) => {
            return b.count - a.count;
        });
    }

    async reports() {
        const reg = /^(\S+)\s(.+)$/;
        let result = []; // List
        await this.call(['reports'], {
            eat(line) {
                const m = line.match(reg);
                if (m) {
                    result.push({
                        name: m[1].trim(),
                        title: m[2].trim(),
                    });
                }
            }
        }, this.streamNotify());
        return result;
    }

    async projects() {
        const reg = /^(\s*)(.+)\s(\d+)$/;
        let result = []; // List
        await this.call(['projects'], {
            eat(line) {
                const m = line.match(reg);
                if (m) {
                    result.push({
                        name: m[2].trim(),
                        indent: m[1].length,
                        count: parseInt(m[3], 10),
                        children: [],
                    });
                }
            }
        }, this.streamNotify());
        const processOne = (from, arr, indent, prefix) => {
            for (var i = from; i < result.length; i++) {
                let item = result[i];
                if (item.indent == indent) { // Same level
                    item.project = prefix+item.name;
                    arr.push(item);
                }
                if (item.indent > indent) {
                    // children
                    let p = arr[arr.length-1];
                    i = processOne(i, p.children, item.indent, p.project+'.');
                    continue;
                }
                if (item.indent < indent) {
                    // Finish
                    return i-1;
                }
            }
            return result.length;
        };
        let roots = [];
        processOne(0, roots, 0, '');
        return roots;
    }
}
