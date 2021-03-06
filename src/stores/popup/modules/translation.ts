import { MutationTree, ActionTree, Module, GetterTree } from 'vuex';
import { State as RootState } from '../index';
import {
  namespaced,
  register as commonRegister,
  State as CommonState,
  state as commonState,
  mutations as commonMutations,
  actions as commonActions,
  webActions,
  ipcActions,
  getters as commonGetters,
} from '@/stores/modules/translation';
import {
  presetLanguagesFilter,
  presetLanguagesModifier,
} from '@/functions';
import { moduleHelper } from '@/stores';
import languages from '@/assets/languages.json';

export const register: configPairs<State> = {
  ...commonRegister,

  translation_hotkey: 'hotkey',
};

const state: State = {
  ...commonState,

  hotkey: 'enter',
};

const mutations: MutationTree<State> = {
  ...commonMutations,
};

const actions: ActionTree<State, RootState> = {
  ...(TARGET_BROWSER === 'web' ? webActions : ipcActions),
  ...commonActions,

  init: () => {/** */},
};

const getters: GetterTree<State, RootState> = {
  ...commonGetters,

  languages: (state, getters) => {
    const { preset } = getters;
    if (!preset) { return []; }

    let out: Language[];
    if (!!preset.languages) {
      out = preset.languages;
    } else {
      out = languages;
    }

    out = presetLanguagesFilter(out, preset.include, preset.exclude)[1] as Language[];
    out = presetLanguagesModifier(out, preset.modify)[1] as Language[];

    return out;
  },
};

export const translation: Module<State, RootState> = {
  namespaced, state, actions, mutations, getters,
};

export default moduleHelper(translation, register);

type C = DefaultConfig;
interface State extends CommonState {
  hotkey: C['translation_hotkey'];
}
