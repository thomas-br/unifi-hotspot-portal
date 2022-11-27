import { configureStore } from "@reduxjs/toolkit"
import accessRequestSlice from "./accessRequestSlice"

export const store = configureStore({
    reducer: {
        accessRequest: accessRequestSlice
    },
})
