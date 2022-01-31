import { FETCH_PROFITRATE_SUCCESS} from "../constants"
export const userActions = {
    setProfitRate,
};

function setProfitRate(rate) {
    return dispatch => {
        dispatch({ type: FETCH_PROFITRATE_SUCCESS, rate });
    };

}


