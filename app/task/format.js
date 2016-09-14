import {colors} from '../styles/style';
import {styles} from '../styles/main';


export const parseDate = (s) => {
    if (!s || s.length != 16) {
        return undefined;
    }
    const msec = Date.UTC(s.substr(0, 4), parseInt(s.substr(4, 2))-1, s.substr(6, 2), s.substr(9, 2), s.substr(11, 2), s.substr(13, 2));
    return new Date(msec);
}

const dateRelative = (dt, now=new Date()) => {
    const sec = Math.round((dt.getTime() - now.getTime()) / 1000);
    const mul = sec > 0? 1: -1;
    const asec = Math.abs(sec);
    if (asec < 60) { // Seconds
        return [sec, 's'];
    };
    if (asec < 60*60) { // Minutes
        return [mul*Math.round(asec/60), 'm'];
    };
    if (asec < 60*60*24) { // Within day
        return [mul*Math.ceil(asec/60/60), 'h'];
    };
    const days = Math.ceil(asec/60/60/24);
    if (days < 10) { // Days
        return [mul*days, 'd'];
    };
    if (days < 30) { // Months
        return [mul*Math.ceil(days/7), 'w'];
    };
    if (days < 360) { // Years
        return [mul*Math.ceil(days/30), 'mo'];
    };
    return [mul*Math.ceil(days/36)/10, 'y'];
};

export const isoDate = (dt) => {
    const pad = (number) => {
        if (number < 10) {
            return '0'+number;
        }
        return number;
    };
    return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}`;
};

const formatDate = (obj, format, name, editable) => {
    const dt = parseDate(obj[name]);
    if (!dt) { // Invalid
        if (editable) 
            obj[`${name}_edit`] = `${name}:`;
        return '';
    };
    obj[`${name}_date`] = dt;
    obj[`${name}_title`] = dt.toLocaleString();
    if (editable) {
        const dt_iso = isoDate(dt);
        obj[`${name}_edit`] = `${name}:${dt_iso}`;
    }
    if (format == 'iso') { // as is
        return obj[name];
    };
    if (['age', 'relative', 'remaining'].indexOf(format) != -1) { // relative
        const [val, sfx] = dateRelative(dt);
        const mul = format == 'age'? -1: 1;
        return `${mul*val}${sfx}`;
    };
    return dt.toLocaleDateString(); // Formatted
}

export const formatters = {
    id(obj) {
        // obj.id_ro = true;
        return ''+(obj.id || '');
    },
    due(obj, format) {
        return formatDate(obj, format, 'due', true);
    },
    modified(obj, format) {
        obj.modified_ro = true;
        return formatDate(obj, format, 'modified');
    },
    entry(obj, format) {
        obj.entry_ro = true;
        return formatDate(obj, format, 'entry');
    },
    start(obj, format) {
        obj.start_ro = true;
        const val = formatDate(obj, format, 'start');
        if (val && format=='active') { // Star
            return '*';
        };
        return val;
    },
    end(obj, format) {
        obj.end_ro = true;
        return formatDate(obj, format, 'end');
    },
    wait(obj, format) {
        return formatDate(obj, format, 'wait', true);
    },
    scheduled(obj, format) {
        return formatDate(obj, format, 'scheduled', true);
    },
    until(obj, format) {
        return formatDate(obj, format, 'until', true);
    },
    description(obj, format) {
        const ann = obj.annotations || [];
        let desc = obj.description || '';
        obj.description_truncate = ['truncated', 'truncated_count'].indexOf(format) != -1;
        if (format == 'desc' || format == 'truncated') {
            return desc;
        }
        if (format == 'count' || format == 'truncated_count') {
            if (ann.length) {
                obj.description_count = `[${ann.length}]`;
            }
            return desc;
        }
        const lines = ann.map((line) => {
            const dt = parseDate(line.entry);
            let outp = '';
            outp += line.description;
            return {
                text: outp,
                origin: line.description,
                unique: line.entry,
                date: dt,
                title: dt? dt.toLocaleString(): line.description,
            };
        });
        if (format == 'oneline') { // Combine to all
            lines.forEach((line) => {
                desc += ` ${line.text}`;
            });
            return desc;
        };
        obj.description_ann = lines;
        return desc;
    },
    tags(obj, format) {
        const tags = obj.tags || [];
        obj.tags_title = tags.join(' ');
        obj.tags_edit = '+';
        if (!tags.length) { // Empty
            return '';
        };
        if (format == 'indicator') { // Plus
            return '+';
        };
        if (format == 'count') { // [3]
            return `[${tags.length}]`;
        };
        obj.tags_edit += tags.join(' +');
        return tags.join(' ')+' ';
    },
    project(obj, format) {
        const val = obj.project || '';
        obj.project_edit = `pro:${val}`;
        if (!val) {
            return val;
        };
        const parts = val.split('.');
        if (format == 'parent') { // All except last
            return parts.slice(0, parts.length-1).join('.');
        };
        if (format == 'indented') { //
            return Array(parts.length-1).fill('  ').join('')+parts[parts.length-1];
        };
        return val;
    },
    uuid(obj, format) {
        // obj.uuid_ro = true;
        const val = obj.uuid || '';
        obj.uuid_title = val;
        const minus = val.indexOf('-');
        if (!val || minus == -1) {
            // Not uuid
            return '';
        }
        if (format == 'short') {
            return val.substr(0, minus);
        }
        return val;
    },
    urgency(obj, format) {
        obj.urgency_ro = true;
        const val = obj.urgency || 0;
        if (format == 'integer') {
            return ''+Math.ceil(val);
        }
        return ''+Math.round(10*val)/10;
    },
    recur(obj, format) {
        const val = obj.recur || '';
        obj.recur_title = val;
        obj.recur_edit = `recur:${val}`;
        if (format == 'indicator' && val) {
            return 'R';
        }
        return val;
    },
    depends(obj, format) {
        obj.depends_ro = true;
        const arr = obj.dependsTasks || obj.depends || [];
        if (arr.length) {
            obj.depends_sort = arr.length;
            obj.depends_title = `[${arr.length}]`;
            if (obj.dependsTasks) { // Join IDs
                obj.dependsList = true;
                obj.depends_title = obj.dependsTasks.map((t) => t.id).join(' ');
            };
            if (format == 'count') { //
                return obj.depends_title;
            };
            if (format == 'indicator') {
                return 'D';
            }
            if (obj.dependsTasks) { // Join IDs
                return obj.depends_title;
            };
            return `[${arr.length}]`;
        }
        obj.depends_sort = 0;
        return '';
    },
    uda(obj, format, item, controller) {
        const val = obj[item.field] || '';
        obj[`${item.field}_edit`] = `${item.field}:${val}`;
        if (!val) return '';
        if (format == 'indicator' && val) {
            return '*';
        };
        const type = controller.udas[item.field].type;
        if (type == 'date') { // As date
            return formatDate(obj, format, item.field, true);
        };
        if (type == 'numeric') { // As number
            return ''+Math.round(10*val)/10;
        };
        return val;
    },

};

export const sortTasks = (info, mode) => {
    let tasks = info.tasks.sort((a, b) => {
        for (let item of info.sort) {
            const mul = item.asc? 1: -1;
            const _a = a[`${item.field}_sort`] || a[item.field];
            const _b = b[`${item.field}_sort`] || b[item.field];
            if (_a === _b) {
                continue; // Next field
            }
            if (_a === undefined) {
                return 1; // _b
            }
            if (_b === undefined) {
                return -1; // _b
            }
            return _a > _b? mul: -1*mul;
        }
        return 0;
    });
    if (mode == 'tree') { // Build dependency tree
        let result = [];
        const addAll = (task, level) => {
            task.level = level;
            result.push(task);
            task.sub.forEach((t) => {
                addAll(t, level+1);
            });
        };
        tasks.forEach((task) => {
            task.sub = []; // Put chidren here
        });
        tasks.forEach((task) => {
            if (task.depends) { // Have
                task.depends.findIndex((uuid) => {
                    const t = tasks.find((t) => {
                        return t.uuid == uuid;
                    });
                    if (t) {
                        t.sub.push(task);
                        task.child = true;
                        return true;
                    }
                    return false;
                });
            };
        });
        tasks.forEach((task) => {
            if (!task.child) { // First level task
                addAll(task, 0);
            }
        });
        return result;
    };
    return tasks;
};

const coloring = {
    tagged: (task) => {
        if (task.tags && task.tags.length) { // Not empty
            return ['tagged'];
        };
    },
    recurring: (task) => {
        if (task.recur) return ['recurring'];
    },
    blocked: (task) => {
        if (task.depends && task.depends_title) return ['blocked'];
    },
    due: (task) => {
        if (task.due) return ['due'];
    },
    'due.today': (task) => {
        if (task.due_date) {
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const finish = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1);
            if (task.due_date.getTime() >= start.getTime() && task.due_date.getTime() < finish.getTime()) {
                return ['due.today'];
            };
        }
    },
    scheduled: (task) => {
        if (task.scheduled) return ['scheduled'];
    },
    overdue: (task) => {
        if (task.due_date) {
            const now = new Date();
            const finish = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            if (task.due_date.getTime() < finish.getTime()) {
                return ['overdue'];
            };
        }
    },
    'project.': (task, colors) => {
        const project = task.project || 'none';
        let name = '';
        let cls = [];
        for (let part of project.split('.')) {
            if (name) name += '.';
            name += part;
            if (colors[`project.${name}`]) {
                cls.push(`project.${name}`);
            }
        }
        if (task.project && !cls.length) {
            // Only project present
            return ['project.']
        }
        return cls;
    },
    'tag.': (task, colors) => {
        const tags = task.tags || [];
        if (!tags.length && colors['tag.none']) { // No tags style
            return ['tag.none'];
        };
        let cls = [];
        for (let tag of tags) {
            if (colors[`tag.${tag}`]) {
                cls.push(`tag.${tag}`);
            }
        }
        if (tags.length && !cls.length) {
            // Only tag
            return ['tag.'];
        }
        return cls;
    },
    'uda.': (task, colors, controller) => {
        let cls = [];
        for (let key in controller.udas) {
            const val = task[key];
            if (val && colors[`uda.${key}`]) {
                cls.push(`uda.${key}`);
            }
            if (val && colors[`uda.${key}.${val}`.toLowerCase()]) {
                cls.push(`uda.${key}.${val}`.toLowerCase());
            }
            if (!val && colors[`uda.${key}.none`]) {
                cls.push(`uda.${key}.none`);
            }
        }
        return cls;
    },
    completed: (task) => {
        if (task.status == 'completed') return ['completed'];
    },
    deleted: (task) => {
        if (task.status == 'deleted') return ['deleted'];
    },
    active: (task) => {
        if (task.start) return ['active'];
    },
};

export const calcColorStyles = (task, precedence, controller) => {
    const clrDef = colors();
    let result = [];
    for (let rule of precedence) {
        if (!coloring[rule]) continue;
        const sts = coloring[rule](task, clrDef, controller);
        if (!sts) continue;
        for (let st of sts) {
            if (styles[`color_${st}_bg`]) { // Only background
                result.push(styles[`color_${st}_bg`]);
            };
        }
    }
    return result;
};
