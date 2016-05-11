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

const formatDate = (obj, format, name) => {
    const dt = parseDate(obj[name]);
    if (!dt) { // Invalid
        return '';
    };
    obj[`${name}_date`] = dt;
    if (format == 'iso') { // as is
        return obj[name];
    };
    if (['age', 'relative', 'remaining'].includes(format)) { // relative
        const [val, sfx] = dateRelative(dt);
        const mul = format == 'age'? -1: 1;
        return `${mul*val}${sfx}`;
    };
    return dt.toLocaleDateString(); // Formatted
}

export const formatters = {
    id(obj) {
        return ''+(obj.id || '');
    },
    due(obj, format) {
        return formatDate(obj, format, 'due');
    },
    entry(obj, format) {
        return formatDate(obj, format, 'entry');
    },
    start(obj, format) {
        const val = formatDate(obj, format, 'start');
        if (val && format=='active') { // Star
            return '*';
        };
        return val;
    },
    end(obj, format) {
        return formatDate(obj, format, 'end');
    },
    wait(obj, format) {
        return formatDate(obj, format, 'wait');
    },
    scheduled(obj, format) {
        return formatDate(obj, format, 'scheduled');
    },
    until(obj, format) {
        return formatDate(obj, format, 'until');
    },
    description(obj, format) {
        const ann = obj.annotations || [];
        let desc = obj.description || '';
        obj.description_truncate = ['truncated', 'truncated_count'].includes(format);
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
            if (dt) {
                outp += `${dt.toLocaleDateString()} `;
            };
            outp += line.description;
            return outp;
        });
        if (format == 'oneline') { // Combine to all
            lines.forEach((line) => {
                desc += ` ${line}`;
            });
            return desc;
        };
        obj.description_ann = lines;
        return desc;
    },
    tags(obj, format) {
        const tags = obj.tags || [];
        if (!tags.length) { // Empty
            return '';
        };
        if (format == 'indicator') { // Plus
            return '+';
        };
        if (format == 'count') { // [3]
            return `[${tags.length}]`;
        };
        return tags.join(' ')+' ';
    },
    project(obj, format) {
        const val = obj.project || '';
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
        const val = obj.uuid || '';
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
        const val = obj.urgency || 0;
        if (format == 'integer') {
            return ''+Math.ceil(val);
        }
        return ''+Math.round(10*val)/10;
    },
    recur(obj, format) {
        const val = obj.recur || '';
        if (format == 'indicator' && val) {
            return 'R';
        }
        return val;
    },
    depends(obj, format) {
        const arr = obj.depends || [];
        if (Array.isArray(arr) && arr.length) {
            obj.depends_sort = arr.length;
            return `[${arr.length}]`;
        }
        obj.depends_sort = 0;
        return '';
    },

};

export const sortTasks = (info) => {
    return info.tasks.sort((a, b) => {
        for (let item of info.sort) {
            const mul = item.asc? 1: -1;
            const _a = a[`${item.field}_sort`] || a[item.field];
            const _b = b[`${item.field}_sort`] || b[item.field];
            if (_a === _b) {
                continue; // Next field
            }
            if (_a === undefined) {
                return 1*mul; // _b
            }
            if (_b === undefined) {
                return -1*mul; // _b
            }
            return _a > _b? mul: -1*mul;
        }
        return 0;
    });
};
