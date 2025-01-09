import { createVuetify, type ThemeDefinition } from 'vuetify'
import * as directives from 'vuetify/directives'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import { aliases, md } from 'vuetify/iconsets/md'
import 'vuetify/styles'
import '@scss/variables.scss'

const customLightTheme: ThemeDefinition = {
    dark: false,
    colors: {
        background: '#FFFFFF',
        surface: '#FFFFFF',
        primary: '#FCBB14',
        secondary: '#1984FC',
        error: '#B00020',
        info: '#2196F3',
        success: '#4BDC5A',
        warning: '#FCBB14',
    },
}

const customDarkTheme: ThemeDefinition = {
    dark: true,
    colors: {
        background: '#222222',
        surface: '#272727',
        'surface-1': '#2D2D2D',
        'surface-2': '#484848',
        primary: '#FCBB14',
        secondary: '#1984FC',
        tertiary: '#5EFC14',
        'secondary-darken-1': '#018786',
        error: '#FF4141',
        info: '#2196F3',
        success: '#4BDC5A',
        warning: '#FCBB14',
    },
}

export default createVuetify({
    directives,
    theme: {
        defaultTheme: 'customDarkTheme',
        themes: {
            customLightTheme,
            customDarkTheme,
        },
    },
    icons: {
        defaultSet: 'md',
        aliases,
        sets: {
            md,
        },
    },
})
