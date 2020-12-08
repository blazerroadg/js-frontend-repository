import { ReducerServices } from './ReducerServices'


export const appReducer = (state, action) => {
    return ReducerServices.instance().app.reduce(state,action)
}
