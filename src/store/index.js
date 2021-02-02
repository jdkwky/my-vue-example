import Vuex from 'vuex';
import Vue from 'vue';

Vue.use(Vuex);

import moduleA from './moduleA'

const state = {
    stateName: 'global',
};

const getters = {};

const mutations = {};

const actions = {};

const modules = {
    moduleA
};

const store = new Vuex.Store({
    actions,
    getters,
    mutations,
    modules,
    state
});

export default store;
