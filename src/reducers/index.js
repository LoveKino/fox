import { combineReducers } from 'redux';
import counter from './counter';
import record from './record';

const rootReducer = combineReducers({
    counter, record
});

export default rootReducer;
