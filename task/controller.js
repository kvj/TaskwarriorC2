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
        this.data.push(line);
    }
}

class ToStringEater extends ToArrayEater {
    str() {
        return this.data.join('\n');
    }
}

class ErrEater extends StreamEater {
    eat(line) {
        console.error(line);
    }
}

const errSimple = new ErrEater();

export class TaskController {

    constructor() {
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
}

