class BaseEvent {

    constructor() {

    }
    static eventInfo = {};

    _on(type, fn, context) {
        if (!type) return;
        if (BaseEvent.eventInfo[type]) {
            BaseEvent.eventInfo[type].push({
                fn: fn,
                context: context
            })
        } else {
            BaseEvent.eventInfo[type] = [{
                fn: fn,
                context: context
            }]
        }
    }

    _emit(type, ...params) {

        if (BaseEvent.eventInfo[type]) {
            BaseEvent.eventInfo[type].forEach(val => {
                const { fn, context } = val;
                fn && fn.call(context, ...params);
            });
        }
    }
    _remove(type) {
        if (BaseEvent.eventInfo[type]) {
            BaseEvent.eventInfo[type].pop();
        }
    }

}

export default BaseEvent;