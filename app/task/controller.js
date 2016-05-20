import {TaskProvider} from './provider';
import {formatters, parseDate, sortTasks} from './format';
import {EventEmitter} from '../tool/events';
import {init as styleInit} from '../styles/style';
import {init as stylesInit} from '../styles/main';
class StreamEater {
    eat(line) {
        // Implement me
    }

    end() {
    }
}

const specialReports = [
    "burndown.daily",
    "burndown.monthly",
    "burndown.weekly",
    "calendar",
    "colors",
    "export",
    "ghistory.annual",
    "ghistory.monthly",
    "history.annual",
    "history.monthly",
    "information",
    "summary",
    "timesheet",
    "projects",
    "tags",
];

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
        this.timers = {};
    }

    async call(args, out, err, options) {
        const result = await this.provider.call(this.fixParams.concat(args), out, err, options);
        if (out && out.end) out.end(result);
        if (err && err.end) err.end(result);
        return result;
    }

    err(message) {
        this.events.emit('notify:error', message);
    }

    info(message) {
        this.events.emit('notify:info', message);
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

    async init(config={}) {
        delete this.provider;
        config.onQuestion = (text) => {
            return new Promise((resp, rej) => {
                this.events.emit('question', text, resp, rej);
            });
        };
        config.onTimer = async (type) => {
            if (type == 'sync') {
                const success = await this.sync();
                if (success) { // Show info
                    this.info('Automatically synchronized')
                };
            };
        };
        const provider = new TaskProvider(config);
        if (!await provider.init()) { // OK
            return false;
        };
        this.provider = provider;
        const css = await this.config('ui.style.', true);
        styleInit(css);
        stylesInit();
        await this.setupSync();
        this.scheduleSync();
        return true;
    }

    async setupSync() {
        const timers = await this.config('ui.sync.', true);
        this.timers = {
            normal: parseInt(timers['periodical'], 10) || 0,
            error: parseInt(timers['error'], 10) || 0,
            commit: parseInt(timers['commit'], 10) || 0,
        };
        console.log('setupSync:', this.timers);
    }

    scheduleSync(type='normal') {
        const timeout = this.timers[type] || this.timers.normal || 0;
        if (timeout > 0 && this.provider) { // Have timeout
            this.provider.schedule(timeout*60, 'sync', true);
        };
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
                            full: s,
                        });
                    } else {
                        result.cols.push({
                            field: s.substr(0, cm),
                            display: s.substr(cm+1),
                            full: s,
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
                task[`${item.full}_`] = val;
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
        const code = await this.call(['undo'], null, this.streamNotify(), {slow: true});
        console.log('Undo:', code);
        if (code == 0) { // Success
            this.notifyChange();
            this.scheduleSync('commit');
        };
        return code;
    }

    async cmd(cmd, input, tasks=[]) {
        let cmds = [];
        const ids = tasks.map((task) => {
            return task.id || task.uuid_ || task.uuid;
        });
        if (ids.length) {
            cmds.push(ids.join(','));
        };
        cmds.push(cmd);
        cmds.push(input);
        console.log('cmd', cmds);
        const code = await this.call(cmds, this.streamNotify('notify:info'), this.streamNotify(), {slow: true});
        if (code === 0) {
            this.notifyChange();
            this.scheduleSync('commit');
            return true;
        };
        return false;
    }

    async cmdRaw(cmd) {
        const out = new ToArrayEater();
        const err = new ToArrayEater();
        const code = await this.provider.call([cmd], out, err, {slow: true});
        let result = [].concat(out.data.map((line) => {
            return {
                type: 'out',
                line: line,
            };
        })).concat(err.data.map((line) => {
            return {
                type: 'error',
                line: line,
            };
        }));
        result.push({
            type: 'info',
            line: `Exit code: ${code}`,
        });
        return {
            lines: result,
        };
    }

    async sync() {
        this.events.emit('sync:start');
        const code = await this.call(['sync'], this.streamNotify('notify:info'), this.streamNotify(), {slow: true});
        this.events.emit('sync:finish');
        if (code == 0) {
            this.notifyChange();
            this.scheduleSync();
        } else {
            this.scheduleSync('error');
        }
        return code == 0;
    }

    async version() {
        const out = new ToStringEater();
        const code = await this.provider.call(['--version'], out, this.streamNotify());
        return out.str();
    }

    async config(prefix, strip_prefix) {
        const reg = /^([a-z0-9_\.]+)\s(.+)$/;
        let result = {}; // Hash
        await this.call(['rc.defaultwidth=1000', 'show', prefix], {
            eat(line) {
                if (line) {
                    // Our case
                    const m = line.match(reg);
                    if (m) {
                        let key = m[1].trim();
                        if (strip_prefix && key.indexOf(prefix) == 0) {
                            // Remove prefix
                            key = key.substr(prefix.length);
                        };
                        result[key] = m[2].trim();
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
                    const report = m[1].trim();
                    result.push({
                        name: report,
                        title: m[2].trim(),
                        special: specialReports.includes(report),
                    });
                }
            }
        }, this.streamNotify());
        return result.filter((item, idx) => {
            return idx < result.length-1;
        });
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
                    if (item.name == '(none)') {
                        item.project='';
                    }
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
