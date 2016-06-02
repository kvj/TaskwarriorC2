var ev = require('EventEmitter');

export class EventEmitter extends ev {

    on(...args) {
        return this.addListener.apply(this, args);
    }
}
