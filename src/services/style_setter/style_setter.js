import { hex2rgb } from '../color_convert/color_convert.js'
import { generatePreset } from '../theme_data/theme_data.service.js'
import { init } from '../theme_data/theme_data_3.service.js'
import { convertTheme2To3 } from '../theme_data/theme2_to_theme3.js'
import { getCssRules } from '../theme_data/css_utils.js'
import { defaultState } from '../../modules/config.js'

export const applyTheme = (input) => {
  const { version, theme: inputTheme } = input
  let extraRules
  let fonts
  if (version === 2) {
    const t0 = performance.now()
    const { rules, theme } = generatePreset(inputTheme)
    fonts = rules.fonts
    const t1 = performance.now()
    console.log('Themes 2 initialization took ' + (t1 - t0) + 'ms')
    extraRules = convertTheme2To3(theme)
  } else {
    console.log(input)
    extraRules = convertTheme2To3(input)
  }

  const t1 = performance.now()
  const themes3 = init(extraRules)
  const t2 = performance.now()
  console.log('Themes 3 initialization took ' + (t2 - t1) + 'ms')
  const head = document.head
  const body = document.body
  body.classList.add('hidden')

  const styleEl = document.createElement('style')
  head.appendChild(styleEl)
  const styleSheet = styleEl.sheet

  styleSheet.toString()
  styleSheet.insertRule(`:root { ${fonts} }`, 'index-max')
  getCssRules(themes3.eager, themes3.staticVars).forEach(rule => {
    // Hack to support multiple selectors on same component
    if (rule.match(/::-webkit-scrollbar-button/)) {
      const parts = rule.split(/[{}]/g)
      const newRule = [
        parts[0],
        ', ',
        parts[0].replace(/button/, 'thumb'),
        ' {',
        parts[1],
        '}'
      ].join('')
      styleSheet.insertRule(newRule, 'index-max')
    } else {
      styleSheet.insertRule(rule, 'index-max')
    }
  })
  body.classList.remove('hidden')
  themes3.lazy.then(lazyRules => {
    getCssRules(lazyRules, themes3.staticVars).forEach(rule => {
      styleSheet.insertRule(rule, 'index-max')
    })
    const t3 = performance.now()
    console.log('Themes 3 finalization took ' + (t3 - t2) + 'ms')
  })
}

const configColumns = ({ sidebarColumnWidth, contentColumnWidth, notifsColumnWidth, emojiReactionsScale }) =>
  ({ sidebarColumnWidth, contentColumnWidth, notifsColumnWidth, emojiReactionsScale })

const defaultConfigColumns = configColumns(defaultState)

export const applyConfig = (config) => {
  const columns = configColumns(config)

  if (columns === defaultConfigColumns) {
    return
  }

  const head = document.head
  const body = document.body
  body.classList.add('hidden')

  const rules = Object
    .entries(columns)
    .filter(([k, v]) => v)
    .map(([k, v]) => `--${k}: ${v}`).join(';')

  const styleEl = document.createElement('style')
  head.appendChild(styleEl)
  const styleSheet = styleEl.sheet

  styleSheet.toString()
  styleSheet.insertRule(`:root { ${rules} }`, 'index-max')
  body.classList.remove('hidden')
}

export const getThemes = () => {
  const cache = 'no-store'

  return window.fetch('/static/styles.json', { cache })
    .then((data) => data.json())
    .then((themes) => {
      return Object.entries(themes).map(([k, v]) => {
        let promise = null
        if (typeof v === 'object') {
          promise = Promise.resolve(v)
        } else if (typeof v === 'string') {
          promise = window.fetch(v, { cache })
            .then((data) => data.json())
            .catch((e) => {
              console.error(e)
              return null
            })
        }
        return [k, promise]
      })
    })
    .then((promises) => {
      return promises
        .reduce((acc, [k, v]) => {
          acc[k] = v
          return acc
        }, {})
    })
}

export const getPreset = (val) => {
  return getThemes()
    .then((themes) => themes[val] ? themes[val] : themes['pleroma-dark'])
    .then((theme) => {
      const isV1 = Array.isArray(theme)
      const data = isV1 ? {} : theme.theme

      if (isV1) {
        const bg = hex2rgb(theme[1])
        const fg = hex2rgb(theme[2])
        const text = hex2rgb(theme[3])
        const link = hex2rgb(theme[4])

        const cRed = hex2rgb(theme[5] || '#FF0000')
        const cGreen = hex2rgb(theme[6] || '#00FF00')
        const cBlue = hex2rgb(theme[7] || '#0000FF')
        const cOrange = hex2rgb(theme[8] || '#E3FF00')

        data.colors = { bg, fg, text, link, cRed, cBlue, cGreen, cOrange }
      }

      return { theme: data, source: theme.source, version: isV1 ? 1 : 2 }
    })
}

export const setPreset = (val) => getPreset(val).then(data => applyTheme(data))
