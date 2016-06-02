var ev = require('EventEmitter');

export class EventEmitter extends ev {

    on(...args) {
        return this.addListener.apply(this, args);
    }

    removeListener(event, handler) {
        if (super.removeListener) {
            return super.removeListener(event, handler);
        }
        const subscriptions = this._subscriber.getSubscriptionsForType(event);
        if (subscriptions) {
            for (let i = 0, l = subscriptions.length; i < l; i++) {
                const subscription = subscriptions[i];
                if (subscription && subscription.listener === handler) subscription.remove();
            }
        }
    }
}
