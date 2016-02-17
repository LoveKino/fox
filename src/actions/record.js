export const START_RECORD = 'START_RECORD';
export const STOP_RECORD = 'STOP_RECORD';

export function start () {
    return {
        type : START_RECORD
    };
}

export function stop () {
    return {
        type : STOP_RECORD
    };
}

export function status () {
    return (dispatch, getState)=> {
        const { record } = getState();
        console.log(record, 'action record');
        return record;
    }
}