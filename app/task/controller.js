import {TaskProvider} from './provider';
import {formatters, parseDate, sortTasks, calcColorStyles, isoDate} from './format';
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

const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

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
        try {
            const result = await this.provider.call(this.fixParams.concat(args), out, err, options);
            if (out && out.end) out.end(result);
            if (err && err.end) err.end(result);
            return result;
        } catch (e) {
            console.log('Error calling task:', e);
            return -1;
        };
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
        config.onQuestion = (text, choices) => {
            return new Promise((resp, rej) => {
                this.events.emit('question', text, choices, resp, rej);
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
        config.onState = async (state, mode) => {
            // console.log('State change:', state);
            if (state == 'active') { // Refresh everything
                this.notifyChange();
            };
            if (state == 'sync' && mode) { // Sync finish
                this.notifyChange();
            };
            if (state == 'online') { // Sync
                const {auto} = this.timers.extra;
                // console.log('Online config:', online, mode);
                if (auto) {
                    // Only when enabled
                    const success = await this.sync();
                    if (success) { // Show info
                        this.info('Automatically synchronized')
                    };
                };
            };
        };
        const provider = new TaskProvider(config);
        if (!await provider.init()) { // OK
            return false;
        };
        this.provider = provider;
        await this.setupSync();
        this.scheduleSync();
        let conf = await this.config('default.command');
        this.defaultCmd = conf['default.command'] || 'next';
        this.panesConfig = await this.provider.configurePanes(await this.config('ui.pane.', true));
        await this.loadUDAs();
        this.multiline = {};
        conf = await this.config('ui.multiline');
        (conf['ui.multiline'] || '').split(',').map((item) => item.trim()).forEach((item) => {
            if (item) this.multiline[item] = true;
        });
        this.multilineSep = conf['ui.multiline.separator'] || '\\n';
        this.reportExtra = await this.config('ui.report.extra.', true) || {};
        const css = await this.config('ui.style.', true);
        styleInit(css);
        stylesInit(css, this);
        this.calendarConfig = await this.loadCalendar();
        return true;
    }

    providerInfo() {
        return this.provider.info || {};
    }

    fromCalendar() {
        let dt = new Date();
        dt.setDate(1);
        return dt;
    }

    async loadCalendar() {
        const dayNo = (name, def=-1) => {
            const index = dayNames.indexOf(name);
            if (index == -1) return def;
            return index;
        };
        const conf = await this.config('ui.calendar.', true);
        let result = {
            start: dayNo(conf['weekstart'], 0),
            pane: conf['pane'] || 'right',
            command: conf['cmd'] || 'due',
            commandAlt: conf['cmd.alt'] || 'wait',
            filter: conf['filter'] || 'due.after',
            filterAlt: conf['filter.alt'] || 'due.before',
            weekends: [0, 6],
        };
        if (conf['weekends']) {
            result.weekends = [];
            conf['weekends'].split(',').forEach((item) => {
                const num = dayNo(item.trim());
                if (num != -1) result.weekends.push(num);
            });
        }
        return result;
    }

    async loadUDAs() {
        const conf = await this.config('uda.', true);
        this.udas = {};
        for (let key in conf) {
            if (key.lastIndexOf('.type') == key.length-5) {
                this.udas[key.substr(0, key.length-5)] = {
                    type: conf[key],
                };
            }
        }
    }

    async specialList(type) {
        let report = await this.config(`ui.report.${type}`, true);
        if (!report) report = {};
        return report[''] || this.defaultCmd;
    }

    async setupSync() {
        const timers = await this.config('ui.sync.', true);
        this.timers = {
            normal: parseInt(timers['periodical'] || 120, 10) || 0,
            error: parseInt(timers['error'] || 0, 10) || 0,
            commit: parseInt(timers['commit'] || 0, 10) || 0,
            extra: await this.config('ui.sync.extra.', true) || {},
        };
        console.log('setupSync:', this.timers);
    }

    confBool(value) {
        if (value === undefined || value === '') { // Empty
            return undefined;
        };
        if (['on', 'y', 'yes', 'true', 't', '1'].includes(value)) { // True
            return true;
        };
        return false;
    }

    scheduleSync(type='normal') {
        const timeout = this.timers[type] || this.timers.normal || 0;
        if (timeout > 0 && this.provider) { // Have timeout
            this.provider.schedule(timeout*60, 'sync', true, this.timers);
        };
    }

    async reportInfo(report) {
        let result = {
            sort: [],
            cols: [],
            report: report,
            filter: '',
            precedence: [],
        };
        let desc = [];
        const ruleConf = await this.config('rule.precedence.color', true);
        // console.log('ruleConf', ruleConf);
        if (ruleConf['']) { // Have
            result.precedence = ruleConf[''].split(',').reverse();
        };
        const ctxConf = await this.config('context');
        if (ctxConf.context) {
            result.context = ctxConf[`context.${ctxConf.context}`];
        }
        const config = await this.config(`report.${report}.`, true);
        for (let key in config) {
            if (key == 'sort') {
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
            if (key == 'columns') {
                let columnsStr = config[key];
                if (this.reportExtra.columns) columnsStr += `,${this.reportExtra.columns}`;
                for (let s of columnsStr.split(',')) {
                    let cm = s.indexOf('.');
                    if (cm == -1) {
                        result.cols.push({
                            field: s,
                            full: s,
                            display: '',
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
            if (key == 'labels') {
                let labelsStr = config[key];
                if (this.reportExtra.labels) labelsStr += `,${this.reportExtra.labels}`;
                desc = labelsStr.split(',');
            }
            if (key == 'description') {
                result.description = config[key];
            }
            if (key == 'filter') {
                result.filter = config[key];
            }
        }
        if (!result.description) result.description = result.filter;
        result.sort.push({
            field: 'id',
            asc: true,
        }, {
            field: 'description',
            asc: true,
        });
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

    async exp(cmds) {
        let cmd = ['rc.json.array=off'].concat(cmds);
        cmd.push('export');
        let result = [];
        const code = await this.call(cmd, {
            eat(line) {
                if (!line) {
                    return;
                }
                // Parse and save
                try {
                    let json = JSON.parse(line);
                    if (json.depends && !Array.isArray(json.depends)) { // Old style
                        json.depends = json.depends.split(',');
                    };
                    json.unique = json.id || json.uuid;
                    result.push(json);
                } catch (e) {
                    console.log('JSON error:', line);
                }
            }
        }, this.streamNotify());
        if (code != 0) {
            console.log('Failure:', cmd, code);
            return undefined;
        }
        return result;
    }

    async filter(report, filter, info, sortMode='list') {
        if (!info || info.report != report) {
            info = await this.reportInfo(report);
        }
        if (!info) {
            this.err('Invalid input');
            return undefined;
        }
        info.tasks = []; // Reset
        let cmd = [];
        if (info.context) {
            cmd.push(`(${info.context})`)
        }
        if (info.filter) {
            cmd.push(`(${info.filter})`);
        }
        if (filter) {
            cmd.push(filter);
        }
        const expResult = await this.exp(cmd);
        if (!expResult) {
            return undefined;
        };
        info.tasks = expResult;
        let hasDepends = false;
        info.cols.forEach((item) => {
            if (item.field == 'depends') { // Need a list
                hasDepends = true;
            };
        });
        // Calculate sizes
        if (hasDepends) { // Load
            for (var i = 0; i < info.tasks.length; i++) {
                let task = info.tasks[i];
                if (task.depends && task.depends.length) { // Make export call
                    const uuids = task.depends.map((uuid) => `uuid:${uuid}`).join(' or ');
                    const uuidsTasks = await this.exp([uuids]);
                    if (uuidsTasks) { // OK
                        task.dependsTasks = uuidsTasks.filter((t) => t.id > 0);
                    };
                };
            };
        };
        info.cols.forEach((item) => {
            item.visible = false;
            item.multiline = false;
            if ('status' == item.field) {
                return;
            }
            if (this.multiline[item.field]) { // Multi - skip
                item.multiline = true;
                item.visible = true;
            };
            if (item.field == 'depends') { // Need a list
                hasDepends = true;
            };
            let handler = formatters[item.field];
            if (!handler) { // Not supported
                if (this.udas[item.field]) {
                    handler = formatters.uda;
                }
            };
            // Colled max size
            let max = 0;
            // console.log('Col:', item.field);
            info.tasks.forEach((task) => {
                const val = handler? handler(task, item.display, item, this): (task[item.field] || '');
                task[`${item.full}_`] = val;
                if (item.multiline) {
                    let lines = [''];
                    if (val) { // Split
                        lines = val.split(this.multilineSep);
                    };
                    task[`${item.full}_lines`] = lines;
                    return;
                };
                if (val.length > max) {
                    max = val.length;
                };
                // console.log('Format:', item.field, val, item.display);
            });
            if (max > 0 || ['id', 'uuid', 'description'].indexOf(item.field) != -1) { // Visible
                item.visible = true;
                item.width = Math.max(max, item.label.length);
                // console.log('Will display:', item.label, item.width);
            };
        });
        info.tasks = sortTasks(info, sortMode);
        // console.log('Precedence:', info.precedence);
        info.tasks.forEach((task) => {
            task.styles = calcColorStyles(task, info.precedence, this);
        });
        // console.log('Filter:', info, cmd);
        return info;
    }

    async undo() {
        const code = await this.call(['undo'], null, this.streamNotify(), {
            slow: true,
            question: true,
        });
        // console.log('Undo:', code);
        if (code == 0) { // Success
            this.notifyChange();
            this.scheduleSync('commit');
        };
        return code;
    }

    async cmd(cmd, input, tasks=[], silent=false) {
        let cmds = [];
        const ids = tasks.map((task) => {
            return task.id || task.uuid_ || task.uuid;
        });
        if (ids.length) {
            cmds.push(ids.join(','));
        };
        cmds.push(cmd);
        cmds.push(input);
        // console.log('cmd', cmds);
        const code = await this.call(cmds, this.streamNotify('notify:info'), this.streamNotify(), {
            slow: true,
            question: true,
        });
        // console.log('cmd result', cmds, code);
        if (code === 0) {
            if (!silent) {
                this.notifyChange();
                this.scheduleSync('commit');
            };
            return true;
        };
        return false;
    }

    async cmdRaw(cmd, handler) {
        const out = new ToArrayEater();
        const err = new ToArrayEater();
        const stream2result = (stream, type) => {
            return stream.data.map((line) => {
                return {
                    line, type,
                };
            });
        };
        let code;
        try {
            code = await this.provider.call([cmd], out, err, {
                slow: true,
                question: true,
                flush: () => {
                    handler && handler({lines: stream2result(out, 'out')});
                },
            });
        } catch (e) {
            console.log('Error:', e);
            code = -1;
        };
        let result = stream2result(out, 'out').concat(stream2result(err, 'error'));
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
        const code = await this.call(['sync'], null, this.streamNotify(), {
            slow: true,
            question: true,
        });
        this.events.emit('sync:finish');
        if (code == 0) {
            this.notifyChange();
            this.scheduleSync();
        } else {
            this.scheduleSync('error');
        }
        return code == 0;
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

    async tags(expanded) {
        const reg = /^(.+)\s(\d+)$/;
        let result = []; // List
        let added = {};
        if (expanded) { // All unique tags
            await this.call(['_unique', 'tag'], {
                eat(line) {
                    if (line) {
                        const tag = line.split(',')[0];
                        if (added[tag]) return;
                        added[tag] = true;
                        result.push({
                            name: tag,
                        });
                    }
                }
            }, this.streamNotify());
            return result;
        } else {
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
    }

    async setContext(context) {
        const code = await this.cmd('context', context);
        if (code == 0) {
            this.notifyChange();
            return true;
        }
        return false;
    }

    async contexts() {
        const conf = await this.config('context');
        let result = [];
        let current = 'none';
        for (let key in conf) {
            if (key == 'context') {
                current = conf.context;
            } else {
                // Save config
                result.push({
                    name: key.substr(8),
                    context: key.substr(8),
                    filter: conf[key],
                });
            }
        }
        if (!result.length) {
            return undefined;
        }
        result.splice(0, 0, {
            name: '(none)',
            context: 'none',
            filter: 'Context not set',
        });
        result.forEach((item) => {
            item.selected = current == item.context;
        });
        return result;
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
                        special: specialReports.indexOf(report) != -1,
                    });
                }
            }
        }, this.streamNotify());
        return result.filter((item, idx) => {
            return idx < result.length-1;
        });
    }

    async projects(expanded) {
        const reg = /^(\s*)(.+)\s(\d+)$/;
        let result = []; // List
        if (expanded) {
            let added = {};
            await this.call(['_unique', 'project'], {
                eat(line) {
                    const parts = line.split('.');
                    let full = '';
                    parts.forEach((p, idx) => {
                        full += `.${p}`;
                        if (added[full]) return;
                        result.push({
                            name: p,
                            indent: idx*2,
                            children: [],
                        });
                        added[full] = true;
                    });
                }
            }, this.streamNotify());
        } else {
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
        }
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

    async editConfig() {
        if (!this.provider.editConfig) { // Not available
            this.err('Not available on this platform');
            return;
        };
        try {
            await this.provider.editConfig();
        } catch (e) {
            console.log('Error:', e);
            if (e.code == 'no_editor') { // Show message
                return this.err('No editor app associated with plain-text files. Install one');
            };
            this.err('Edit error');
        }
    }

    calendar (from) {
        let dt;
        if (!from) { // First day
            dt = new Date();
        } else {
            dt = new Date(from.getTime());
        }
        dt.setDate(1);
        const m = dt.getMonth();
        const start = this.calendarConfig.start;
        const weekends = this.calendarConfig.weekends;
        if (dt.getDay() < start) {
            dt.setDate(1 + start  - dt.getDay() -7);
        } else {
            dt.setDate(1 + start - dt.getDay());
        }
        let result = []; // weeks
        do {
            let week = []; // days
            for (let i = 0; i < 7; i++) {
                week.push({
                    day: dt.getDate(),
                    date: isoDate(dt),
                    active: dt.getMonth() === m,
                    weekend: weekends.includes(dt.getDay()),
                });
                dt.setDate(dt.getDate()+1); // Next date
            };
            result.push(week);
        } while (dt.getMonth() == m);
        return result;
    }
}
