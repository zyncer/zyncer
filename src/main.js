import Vue from 'vue';
import App from './App.vue';
//import { createProvider } from './vue-apollo';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

import { LCDClient } from '@terra-money/terra.js';
import { Mirror } from '@mirror-protocol/mirror.js';

import VueApollo from 'vue-apollo';

Vue.config.productionTip = false

const mirror = new Mirror();

const httpLink = new HttpLink({
  uri: 'https://graph.mirror.finance/graphql'
});

const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  connectToDevTools: true
});

Vue.use(VueApollo);

const apolloProvider = new VueApollo({
  defaultClient: apolloClient
});

new Vue({
  el: '#app',
  apolloProvider,
  mirror,
  render: h => h(App)
});
