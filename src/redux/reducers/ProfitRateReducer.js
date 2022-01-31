// import {data} from "../fake-datas/AdminData"
import { FETCH_PROFITRATE_SUCCESS } from "../constants"
const initialState = {
    profit_rate: 1,
}

export default function ProfitRateReducer(state = initialState, action) {
    switch (action.type) {
        case FETCH_PROFITRATE_SUCCESS:
            return {
                ...state,
                profit_rate: action.rate
            }
        default:
            return state;
    }
}
