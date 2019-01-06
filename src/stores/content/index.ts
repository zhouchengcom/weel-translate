import Vue from 'vue';
import Vuex, { MutationTree, ActionTree, ModuleTree, GetterTree } from 'vuex';
import storage from '../modules/storage';
import preference, { register as preferenceRegister } from './modules/preference';
import translation, { register as translationRegister } from './modules/translation';
import { update, clear } from '@/stores/mutations';
import { presetInvoker } from '@/functions';
import debug from '@/functions/debug';

Vue.use(Vuex);

let Port: RuntimePort;

const state: State = {
  notify: null,

  text: null,
  lastText: null,
  rect: {
    offset: { x: 0, y: 0 },
    size: { height: 0, width: 0 },
    position: { top: 0, right: 0, bottom: 0, left: 0 },
  },
  initOffset: null,
};

const mutations = Object.assign({
} as MutationTree<State>, { update, clear });

const actions: ActionTree<State, State> = {
  init: ({ state, dispatch, rootState }, { port }) => {
    Port = port;

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

  selection: ({ state, dispatch }, selection: Selection) => {
    const text: string = selection.toString().trim();

    if (!text.length) {
      if (!!state.text) { dispatch('unselect'); }
      return;
    }

    if (state.lastText === text) {
      if (!!state.lastText && !state.text) { dispatch('selected'); }
      return;
    }

    const rect: ClientRect = selection.getRangeAt(0).getBoundingClientRect();

    dispatch('select', [text, rect]);
  },

  select: ({ commit }, [text, rect]) => {
    const {
      x, y,
      height, width,
      top, right, bottom, left,
    } = rect;
    const [offset, size, position] = [
      { x, y },
      { height, width },
      { top, right, bottom, left },
    ];

    commit('update', {
      text, lastText: text,
      rect: { offset, size, position },
    });
    commit('translation/text', text);

    if (!state.initOffset) { commit('update', { initOffset: [x, y] }); }
  },

  selected: ({ commit, state }) => {
    commit('update', { text: state.lastText });
  },

  unselect: ({ commit }) => {
    commit('update', { text: null, initOffset: null });
    commit('translation/update', { result: null });
  },

  notify: ({ commit }, message: string) => {
    commit('update', { notify: message || null });
    setTimeout(() => {
      commit('update', { notify: null });
    }, 3000);
  },
};

const getters: GetterTree<State, State> = {
  locale: (state): Language['code'] => state.storage.ui_language,
  resultLayout: (state): LayoutPreset => {
    const {
      template_layouts: presets,
      template_enabled_sources: sources,
    } = state.storage;
    const id = sources[state.translation.source.id][0];
    return presetInvoker(id, presets)[1] as LayoutPreset;
  },
  hasSelection: (state): boolean => !!state.text,
  rectOffsetCC: (state): [number, number] => {
    const { offset: { x, y }, size: { width, height } } = state.rect;
    return [x + width / 2, y + height / 2];
  },
  rectOffsetTC: (state): [number, number] => {
    const { offset: { x, y }, size: { width } } = state.rect;
    return [x + width / 2, y];
  },
  rectOffsetBC: (state): [number, number] => {
    const { offset: { x, y }, size: { width, height } } = state.rect;
    return [x + width / 2, y + height];
  },
  rectOffsetBR: (state): [number, number] => {
    const { offset: { x, y }, size: { width, height } } = state.rect;
    return [x + width, y + height];
  },
  isRectUp: (state): boolean => {
    const { initOffset, rect: { offset } } = state;
    const [, y]: [number, number] = initOffset || [0, 0];
    return offset.y < y;
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

  text: string | null;
  lastText: string | null;
  rect: {
    offset: { x: number; y: number; };
    size: { height: number; width: number; };
    position: { top: number; right: number; bottom: number; left: number; };
  };
  initOffset: null | [number, number];

  [name: string]: any;
}
