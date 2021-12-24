/**
 * Method to help writing simple and reused reducer code.
 * @param {Object} constants Object with values to constants to dispatch
 * @param {string} constants.request Request constant
 * @param {string} constants.success Success constant
 * @param {string} constants.failure Failure constant
 * @param {reducerAction} action Action to call, should return a promise
 * @param {?*[]} actionArgs Array of arguments to action
 * @param {?reducerCallback} callback Optional callback to call after data has been retrieved
 */
function simpleReducerHelper(constants, action, actionArgs = [], callback = null){
  const request = () => ({ type: constants.request });
  const success = (data) => ({ type: constants.success, data });
  const failure = (error) => ({ type: constants.failure, error});

  return (dispatch) => {
    dispatch(request());
    action(...actionArgs)
      .then(data => {
        dispatch(success(data));
        if(callback){
          callback(null, data);
        }
      })
      .catch(error => {
        dispatch(failure(error))
        if(callback){
          callback(error);
        }
      })
  }
}

/**
 * @callback reducerAction
 * @returns {Promise} Data returned by the action
 * 
 * @callback reducerCallback
 * @param {*} data Data returned by the action
 */

export {
  simpleReducerHelper
}