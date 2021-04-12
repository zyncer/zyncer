<template>
<!--
  <div :key="txs.id">-->
    <div :key="tx.token">
      <h4>{{ asset.symbol }} </h4><h5> Cost ({{ Math.round(tx.masset*10000)/10000 }}{{ asset.symbol }} + {{ tx.ust }}ust) Price {{ to4(tx.ust/tx.masset) }}ust
        LP {{ to4(tx.share) }} | Pool Share {{ to3(toPercent(tx.share,toNumber(asset.positions.lpShares))) }}
        <br>
        Withdrawal ({{ to4(toPercent(tx.share,toNumber(asset.positions.lpShares))*toNumber(asset.positions.pool)/100) }}{{ asset.symbol }} 
        + {{ to4(toPercent(tx.share,toNumber(asset.positions.lpShares))*toNumber(asset.positions.uusdPool)/100) }}ust )
        Swap Price {{ 
          to4((toPercent(tx.share,toNumber(asset.positions.lpShares))*toNumber(asset.positions.uusdPool)/100) /
          (toPercent(tx.share,toNumber(asset.positions.lpShares))*toNumber(asset.positions.pool)/100))
        }}ust
        | Unrealized <b>{{ to4(percentChange(toPercent(tx.share,toNumber(asset.positions.lpShares))*toNumber(asset.positions.uusdPool)/100,tx.ust)) }}% </b>
        <br>
        Cost Value {{
          to4(tx.ust*2)
        }}ust
        | HODL Value {{ 
          to4(tx.ust + (tx.masset*(toPercent(tx.share,toNumber(asset.positions.lpShares))*toNumber(asset.positions.uusdPool)/100) /
          (toPercent(tx.share,toNumber(asset.positions.lpShares))*toNumber(asset.positions.pool)/100)) )

        }}ust
        | LP Value
        {{
           to4((toPercent(tx.share,toNumber(asset.positions.lpShares))*toNumber(asset.positions.uusdPool)/100)*2)
         }}ust
         | Imp Loss
         {{
           to4(percentChange(to4((toPercent(tx.share,toNumber(asset.positions.lpShares))*toNumber(asset.positions.uusdPool)/100)*2),
           to4(tx.ust + (tx.masset*(toPercent(tx.share,toNumber(asset.positions.lpShares))*toNumber(asset.positions.uusdPool)/100) /
          (toPercent(tx.share,toNumber(asset.positions.lpShares))*toNumber(asset.positions.pool)/100)) )  ))
         }}%
      </h5>
      <hr>
    <!--
    <h3 v-if="txs.type == 'PROVIDE_LIQUIDITY'">{{ txs.type }} {{ parseInt(txs.data.share)/1000000 }} {{ asset.symbol }} 
      {{ parseInt(txs.data.assets.substr(0, txs.data.assets.indexOf('terra')))/1000000 }}
      {{ parseInt(txs.data.assets.substr(txs.data.assets.indexOf(',')+1, txs.data.assets.indexOf('uusd')-1-txs.data.assets.indexOf(',')))/1000000 }}
      </h3>
  -->

  </div>

</template>

<script>
import gql from "graphql-tag";
const GET_ASSET = gql`
query TokenStr($token: String!) { 
  asset(token: $token)
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
    }
  }
}
`;

export default {
  name: "Txs",
  //props: ["txs"],
  props: ["tx"],
  data() {
    return {
      asset: []
    };
  },
  methods:{
    toNumber: function(num){
      return parseInt(num)/1000000;
    },
    toPercent: function(num1,num2){
      return num1/num2*100;
    },
    to3: function(num){
      return Math.round(num*1000)/1000;
    },
    to4: function(num){
      return Math.round(num*10000)/10000;
    },
    percentChange(newnum,orignum){
      return (newnum*2-orignum*2)/(orignum*2)*100;
    },
    marketPrice(pool,uusd){
      return (parseInt(uusd)/1000000)/(parseInt(pool)/1000000)
    }
  },
  /*
  computed: {
    token: function(){
      return this.txs.token
    }
  },*/
  apollo: {
    asset: {
      query: GET_ASSET,
      variables(){
        return {
            //token: this.txs.token
            token: this.tx.token
        }
      }
     }
    }
};
</script>