import {TaskProvider} from './provider';

class StreamEater {
    eat(line) {
        // Implement me
    }
}

class ToArrayEater extends StreamEater {

    constructor() {
        super();
        this.data = [];
    }

    eat(line) {
        console.log('Array:', line);
        this.data.push(line);
    }
}

class ToStringEater extends ToArrayEater {
    str() {
        return this.data.join('\n').trim();
    }
}

class ErrEater extends StreamEater {
    eat(line) {
        console.log('ERR:', line);
    }
}

const errSimple = new ErrEater();

export class TaskController {

    constructor() {
        this.fixParams = ['rc.confirmation=off', 'rc.color=off', 'rc.verbose=nothing'];
    }

    call(args, out, err) {
        return this.provider.call(this.fixParams.concat(args), out, err);
    }

    init(config) {
        delete this.provider;
        const provider = new TaskProvider(config);
        if (provider.init()) { // OK
            this.provider = provider;
            return true;
        };
        return false;
    }

    version() {
        const out = new ToStringEater();
        return this.provider.call(['--version'], out, errSimple).then((code) => {
            return out.str();
        });
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
        }, errSimple);
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
        }, errSimple);
        return result.sort((a, b) => {
            return b.count - a.count;
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
        }, errSimple);
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
