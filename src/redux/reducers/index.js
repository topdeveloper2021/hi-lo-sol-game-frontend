import { combineReducers } from 'redux';
import ProfitRateReducer from './ProfitRateReducer';

const rootReducer = combineReducers({
    profit_rate_reducer: ProfitRateReducer,
})

export default rootReducer;