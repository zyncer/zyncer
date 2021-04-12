<template>
  <div>
    <!--
    <txs v-for="txs in txs" :key="txs.id" :txs="txs"></txs>
    -->
    <wallet-address @eventUpd="updAddress"></wallet-address>
<!--
    <h3>{{ test }}<br>{{
    parseInt(test.substr(test.indexOf(',')+1,test.indexOf('terra')-test.indexOf(',')-1))/100000
    }}
    </h3>
-->
    <txs v-for="tx in sumliquidation" :key="tx.token" :tx="tx"></txs> 

<!--
    <h3 v-for="tx in sumliquidation" :key="tx.token"> {{ asset.symbol }} {{ tx.token }} Cost {{ tx.masset }} + {{ tx.ust }}</h3>

-->


    <portfolio-item v-for="asset in assets" :key="asset.symbol" :asset="asset"></portfolio-item>
    <!--<h3 v-for="liq in sumliquidation" :key="liq.id">{{ liq.id }}</h3>-->
    <!-- <h3>{{ assets }}</h3> -->
    <!--<h3>{{ sumliquidation }}</h3>-->
    
 
  </div>
</template>

<script>
import PortfolioItem from './PortfolioItem.vue';
import WalletAdress from './WalletAddress.vue';
import gql from "graphql-tag";
import Txs from './Txs.vue';

const GET_ASSETS = gql`
query{ 
  assets{
    symbol
    name
    prices{
      price,
      oraclePrice
    }
  }
}
`;

const GET_TXS = gql`
query Address($waddress: String!) 
{
  txs(account: $waddress, limit: 3000){
    id
    type
    data
    token
    fee
    tags
  }
}
`;


export default {
  components: { PortfolioItem, Txs , 'wallet-address': WalletAdress},
  name: "Portfolio",
  component: { 'portfolio-item': PortfolioItem, 'txs': Txs },
  data() {
    return {
      assets: [],
      txs: [],
      test: "3143112557uusd, 6165013terra1jsxngqasf2zynj5kyh0tgq9mj3zksa5gk35j4k",
      waddress: ""
    };
  },
  computed: {
      sumliquidation: function(){
        //return this.txs.filter(tx => tx.type === "PROVIDE_LIQUIDITY").reduce((acc, tx) => acc + parseInt(tx.data.share)/1000000,0)
        /*
        return this.txs.filter(tx => tx.type === "PROVIDE_LIQUIDITY").reduce((acc, tx) => {
          const key = tx.token;
          if(!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(tx.data.share);
          return acc
        }
        ,{})*/
      let sumsArray = {}
      //let sums = {}
      this.txs.filter(tx => tx.type === "PROVIDE_LIQUIDITY" || tx.type === "WITHDRAW_LIQUIDITY").sort((a,b) => {
        if (a.type === "PROVIDE_LIQUIDITY" && b.type === "WITHDRAW_LIQUIDITY") return -1;
        if (a.type === "WITHDRAW_LIQUIDITY" && b.type === "PROVIDE_LIQUIDITY") return 1;
        return 0;
      }).forEach(item =>{
        //sums = sumsArray[item.token]
        //if(sums){
        if(sumsArray[item.token]){
          if(item.type === "PROVIDE_LIQUIDITY"){
            sumsArray[item.token].share += parseInt(item.data.share)/1000000;
            sumsArray[item.token].masset += parseInt(item.data.assets.substr(0, item.data.assets.indexOf('terra')))/1000000
            sumsArray[item.token].ust += parseInt(item.data.assets.substr(item.data.assets.indexOf(',')+1, item.data.assets.indexOf('uusd')-1-item.data.assets.indexOf(',')))/1000000
          }
          else{
            sumsArray[item.token].share -= parseInt(item.data.withdrawnShare)/1000000;
            sumsArray[item.token].masset -= parseInt(item.data.refundAssets.substr(item.data.refundAssets.indexOf(',')+1,item.data.refundAssets.indexOf('terra')-item.data.refundAssets.indexOf(',')-1))/1000000;
            sumsArray[item.token].ust -= parseInt(item.data.refundAssets.substr(0, item.data.refundAssets.indexOf('uusd')))/1000000;
            //if(sumsArray[item.token].share === 0){
              //sumsArray.splice(item.token,1);
            //}
          }
          //sums.share += parseInt(item.data.share)/1000000

        } else {
          sumsArray[item.token] = { token: item.token, share: parseInt(item.data.share)/1000000 , masset: parseInt(item.data.assets.substr(0, item.data.assets.indexOf('terra')))/1000000 
          , ust: parseInt(item.data.assets.substr(item.data.assets.indexOf(',')+1, item.data.assets.indexOf('uusd')-1-item.data.assets.indexOf(',')))/1000000}
          //sumsArray[item.token].share = parseInt(item.data.share)/1000000 
        }
      })
      
      const objectArray = Object.values(sumsArray);
      //const objectArray2 = Object.entries(objectArray);

     // return sumsArray;
     return objectArray;

        //.map(tx => tx.data.share)
        //.reduce((acc,tx) => acc + parseInt(tx.data.share)/1000000,0)
      }
  },
  methods: {
    updAddress(value) {
      this.waddress = value;
    }
  },
  apollo: {
    assets: {
      query: GET_ASSETS
    },
    txs: {
      query: GET_TXS,
      variables(){
        return {
            //token: this.txs.token
            waddress: this.waddress
        }
      }
    }
  }
};


</script>

