import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    data: undefined,
    waiting: false
}

export const accessRequestSlice = createSlice({
    name: "accessRequest",
    initialState,
    reducers: {
        setWaiting: (state, _) => {
            state.data = undefined
            state.waiting = true
        },
        setRequest: (state, action) => {
            state.data = action.payload
            state.waiting = false
        },
        update: (state, action) => {
            state.data = action.payload
            state.waiting = false
        },
    },
})

export const { setWaiting, setRequest, update } = accessRequestSlice.actions

export default accessRequestSlice.reducer
