/**
 * Wraps fetch API with http code rejection with json output
 * @param  {...any} vars
 */
export const request = (...vars) => {
  return fetch(...vars)
    .then(response => response.status >= 400 && response.status <= 600 ? Promise.reject(response) : response.json())
};

/**
 * Generic Template for Reducer Action
 * @param {*} param0
 */
export const requestDispatcher = ({ api, config, dispatch, modifier, PENDING, SUCCESS, FAILURE }) => {
  const csrfToken = getCookie('XSRF-TOKEN');

  const headers = new Headers({
    'XSRF-Token': csrfToken,
    'Content-Type': 'application/json',
    ...(config && config.headers ? config.headers : {})
  });

  dispatch({
    type: PENDING
  })

  const requestConfig = config ? {
    ...config,
    headers: headers
  } : config;

  return request(api, requestConfig)
    .then(data => {
      const modifiedData = modifier ? modifier(data) : data;
      dispatch({
        type: SUCCESS,
        data: modifiedData
      })
      return modifiedData;
    })
    .catch(response => {
      // No response indicates a network failure
      if(!response) {
        dispatch({
          type: FAILURE,
          error: 'Network Failed',
          errorState: response ? response.status : null,
          errorStatusText: response ? response.statusText : null
        })
        return Promise.reject(response);
      }

      // Catch if the JSON body is invalid
      return response.json()
        .catch(() => {
          dispatch({
            type: FAILURE,
            error: response.status + ' ' +response.statusText,
            errorState: response ? response.status : null,
            errorStatusText: response ? response.statusText : null
          })

          return Promise.reject({
            message: 'JSON Decoding Failed'
          });
        })
        .then(body => {
          dispatch({
            type: FAILURE,
            error: body.message,
            errorState: response ? response.status : null,
            errorStatusText: response ? response.statusText : null
          })

          return Promise.reject(response);
        });
    });
};


const getCookie = (name) => {
  if (!document.cookie) {
    return null;
  }

  const xsrfCookies = document.cookie.split(';')
    .map(c => c.trim())
    .filter(c => c.startsWith(name + '='));

  if (xsrfCookies.length === 0) {
    return null;
  }
  return decodeURIComponent(xsrfCookies[0].split('=')[1]);
}
