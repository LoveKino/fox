import { START_RECORD, STOP_RECORD } from '../actions/counter';

export default function record (state = 0, action = null) {
    switch (action.type) {
        case START_RECORD:
            return state + 1;
        case STOP_RECORD:
            return state - 1;
        default:
            return state;
    }
}