<template>
  <div id="portfolio">
    <wallet-address @eventUpd="updAddress"></wallet-address>
    <h4 class="font-weight-bold alert alert-success" v-if="waddress">Total Unclaimed: {{ to4(totalreward) }} mir
      <footer class="blockquote-footer">{{ to4(totalreward* Number(mir.prices.price)) }} USD ~ {{ to4(totalreward* Number(mir.prices.price)*33) }} THB</footer>
    </h4>
    <table v-if="waddress" class="table table-striped table-bordered table-dark">
      <thead class="thead-light">
        <tr>
          <th scope="col">Symbol</th>
          <th scope="col">LP Balance/Staked</th>
          <th scope="col">Withdrawal Pair</th>
          <th scope="col">Pool Share</th>
          <th scope="col">Withdrawal Value</th>
          <th scope="col">Avg Cost/Price</th>
          <th scope="col">Swap Price</th>
          <th scope="col">Unrealized</th>
          <th scope="col">Imp Loss</th>
          <th scope="col">Unclaimed</th>
        </tr>
      </thead>
      <tbody>
      <txs v-for="tx in sumliquidation" :key="tx.token" :tx="tx" :waddress="waddress" :mir="mir" @updateTotal="updateTotal"></txs> 
      </tbody>
    </table>

   <portfolio-item v-for="asset in assets" :key="asset.symbol" :asset="asset"></portfolio-item>

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
    token
    name
    prices{
      price,
      oraclePrice
    }
    positions{
      lpStaked
    }
  }
}
`;

const GET_TXS = gql`
query Address($waddress: String!) 
{
  txs(account: $waddress, limit: 10000){
    id
    type
    data
    token
    fee
    tags
  }
}
`;

const GET_MIR = gql`
query{ 
  asset(token: "terra15gwkyepfc6xgca5t5zefzwy42uts8l2m4g40k6")
  {
    symbol
    name
    token
    pair
    lpToken
    prices{
      price,
      oraclePrice
    }
    positions{
      pool
      uusdPool
      lpShares
      lpStaked
    }
    statistic{
      apr
      apy
    }
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
      mir: [],
      //test: "3143112557uusd, 6165013terra1jsxngqasf2zynj5kyh0tgq9mj3zksa5gk35j4k",
      waddress: "",
      totalreward: 0
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
      },
      LPStaked: function() {
        let result = 
          { 
          all: this.assets.reduce((acc,item) => acc +  (parseInt(item.positions.lpStaked)/1000000),0),
          my: this.txs.filter(tx => tx.type === "STAKE").map(function(tx) {
             return { token: tx.token, amount: tx.data.amount/1000000, type: tx.data.type } 
             })/*.reduce(function(r, tx) {
               if(r.some(rtx => rtx.token === tx.token)){
                 console.log(r);
                 return r[r.findIndex((rtx)=> rtx.token === tx.token)].amount += tx.amount;
               } else {
                 return { token: tx.token, amount: tx.amount}
               }
             },[]) */
          }
        ;
        return result;
      }
  },
  methods: {
    updAddress(value) {
      if(value != this.waddress)
      {
        this.totalreward = 0;
        this.waddress = value;
      }     
    },
    updateTotal(value) {
      this.totalreward += value;
    },
    to4: function(num){
      return Math.round(num*10000)/10000;
    },
  },
  apollo: {
    assets: {
      query: GET_ASSETS
    },
    mir: {
      query: GET_MIR,
      update: data => data.asset
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
<style>
#portfolio {
  margin-left: 0;
}
thead {
  font-size: 1.1rem;
}
tbody {
  font-size: 1.2rem;
}


</style>
