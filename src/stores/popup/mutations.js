export const increment = state => {
  state.count++
}

export const drawerToggle = state => {
  state.drawerOpened = !state.drawerOpened
}

export const currentLanguages = (state, payload = []) => {
  state.currentLanguages = payload
}