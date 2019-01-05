import Vue from 'vue';
import Vuex, { MutationTree, ActionTree, ModuleTree, GetterTree } from 'vuex';
import storage from '../modules/storage';
import preference, { register as preferenceRegister } from './modules/preference';
import translation, { register as translationRegister } from './modules/translation';
import { update, clear } from '@/stores/mutations';
import { presetInvoker } from '@/functions';
import debug from '@/functions/debug';
import browser from '@/apis/browser';

Vue.use(Vuex);

let Port: RuntimePort;

const state: State = {
  notify: null,
};

const mutations = Object.assign({
} as MutationTree<State>, { update, clear });

const actions: ActionTree<State, State> = {
  init: ({ state, dispatch, rootState }, { port }) => {
    // initial a port for connecting other end
    // useless in "web" mode
    Port = port;

    dispatch('preference/init');
    dispatch('translation/init');
    dispatch('storage/init', { page: 'popup', keys: [
      'template_layouts',
      'template_enabled_sources',
      ...Object.keys(preferenceRegister),
      ...Object.keys(translationRegister),
    ]});
  },

  ipc: async ({ dispatch }, { type, payload, port = true }) => {
    let response: IpcResponse;
    if (port) {
      // response = await ipcAction(Port, { type, payload }) as IpcResponse;
      const { name } = Port;
      Port.postMessage({ name, type, payload } as IpcAction);

      let i: number = 0;
      response = await new Promise((resolve, reject) => {
        const listener = ({ name, type, error, payload }: IpcAction) => {
          if (error !== null) { reject(error); }
          resolve({ name, type, payload });
          debug.log(i++);
          // Port.onMessage.removeListener(listener);
        };
        Port.onMessage.addListener(listener);
      });
    } else {
      response = await browser.runtime.sendMessage({ type, payload });
    }

    const { error, payload: data } = response;

    if (error !== null) {
      dispatch('notify', error);
    }

    return data;
  },

  notify: ({ commit }, message: string) => {
    commit('update', { notify: message || null });
  },
};

const getters: GetterTree<State, State> = {
  locale: (state): Language['code'] => state.storage.ui_language,
  resultLayout: (state): LayoutPreset => {
    const {
      template_layouts: layouts,
      template_enabled_sources: sourcesTemplate,
    } = state.storage;
    const id = (sourcesTemplate[state.translation.source.id] || [])[0];
    return presetInvoker(id, layouts)[1] as LayoutPreset;
  },
};

const modules: ModuleTree<State> = {
  storage, preference, translation,
};

const store = new Vuex.Store<State>({
  state, actions, mutations, getters, modules,
});

store.subscribe((mutation) => {
  if (mutation.type === 'storage/update') {
    store.dispatch('preference/fetch');
    store.dispatch('translation/fetch');
  }
});

export default store;

export interface State {
  notify: null | string;

  [name: string]: any;
}
