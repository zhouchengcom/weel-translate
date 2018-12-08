import { MutationTree, ActionTree, Payload, Module } from 'vuex';
import { DefaultConfig } from '@/defaults/config';
import { State as RootState } from '../index';

import { storage as apiStorage } from '@/apis/browser';

const namespaced: boolean = true;

const state: State = {
  name: 'storage',
};

const mutations: MutationTree<State> = {
  updateState: (state, payload: DefaultConfig): void => {
    for (const [name, value] of Object.entries(payload)) {
      state[name] = value;
    }
  },
};

const actions: ActionTree<State, RootState> = {
  query: async (keys?: storageKeys, type?: storageType): Promise<std> => {
    const config = await apiStorage[type || 'local'].get(keys || {});

    return [null, config];
  },

  // TODO: more details
  update: async ({ state, commit }, payload: UpdatePayload): Promise<void | boolean> => {
    const { type, data } = payload;

    if (!Object.keys(data).length) {
      return false;
    }

    await apiStorage[type || 'local'].set(data);

    commit('updateState', data);
  },
};

export const storage: Module<State, RootState> = {
  namespaced, state,
};

interface State {
  name: string;
  [key: string]: any;
}

interface UpdatePayload {
  type?: 'local' | 'sync' | 'managed';
  data: DefaultConfig;
}
