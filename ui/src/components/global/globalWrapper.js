import React from "react"
import { Provider } from "react-redux"
import { store } from "../../state/store"
import { MantineProvider } from '@mantine/core'
import "./global.css"

const globalWrapper = ({ element }) => {
    console.log("wrapped", element)
    return (
        <MantineProvider withGlobalStyles withNormalizeCSS>
            <Provider store={store}>
                {element}
            </Provider>
        </MantineProvider>
    )
}

export default globalWrapper
