import BaseEvent from './BaseEvent';

function getEventBus(){
    let eventBus = null;
    return ()=>{
        if(eventBus){
            return eventBus
        }
        eventBus = new BaseEvent();
        return eventBus
    }
}

const eventBus = getEventBus()();

export default eventBus;