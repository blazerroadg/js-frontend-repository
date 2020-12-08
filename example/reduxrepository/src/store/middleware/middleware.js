
export const crashReporter = store => next => action => {
    try {
        return next(action)
    } catch (err) {
        console.error('Caught an exception!', err)
        throw err
    }
}

export const thunk = store => next => action => {
    if (typeof action === 'function') {
        action(store.dispatch, store.getState)
        return;
    }
    next(action)
}


export const vanillaPromise = store => next => action => {
    if (typeof action.then !== 'function') {
        return next(action)
    }
    return Promise.resolve(action);
}


export const readyStatePromise = store => next => action => {
    if (!action.promise) {
        return next(action)
    }


    function makeAction(ready, data) {
        const newAction = Object.assign({}, action, { ready }, data)
        delete newAction.promise
        return newAction
    }

    next(makeAction(false))
    return action.promise.then(
        result => next(makeAction(true, { result })),
        error => next(makeAction(true, { error }))
    )
}