<template>
  <div>
    <!--
    <txs v-for="txs in txs" :key="txs.id" :txs="txs"></txs>
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
query{
  txs(account: "terra1gyr4rdgy8gceavlsvwjg0sp055wr0jgrr4dvgj"){
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
  components: { PortfolioItem, Txs },
  name: "Portfolio",
  component: { 'portfolio-item': PortfolioItem, 'txs': Txs },
  data() {
    return {
      assets: [],
      txs: []
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
      this.txs.filter(tx => tx.type === "PROVIDE_LIQUIDITY").forEach(item =>{
        //sums = sumsArray[item.token]
        //if(sums){
        if(sumsArray[item.token]){
          //sums.share += parseInt(item.data.share)/1000000
          sumsArray[item.token].share += parseInt(item.data.share)/1000000;
          sumsArray[item.token].masset += parseInt(item.data.assets.substr(0, item.data.assets.indexOf('terra')))/1000000
          sumsArray[item.token].ust += parseInt(item.data.assets.substr(item.data.assets.indexOf(',')+1, item.data.assets.indexOf('uusd')-1-item.data.assets.indexOf(',')))/1000000
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
  apollo: {
    assets: {
      query: GET_ASSETS
    },
    txs: {
      query: GET_TXS
    }
  }
};


</script>

