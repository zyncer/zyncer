<template>
<!--
  <div :key="txs.id">-->
    <div :key="tx.token" v-if="to4(toPercent(tx.share,toNumber(asset.positions.lpShares))) != 0">
    <!-- {{ stakeinfo }} <br> {{ poolinfo }} <br> {{ reward }} -->
      <h4><b>{{ asset.symbol }}</b> APR: {{ to3(asset.statistic.apr*100) }}% APY: {{ to3(asset.statistic.apy*100) }}%</h4>
      <h6>Stake Position ({{ parseInt(stakeinfo[0].bond_amount)/1000000 }}) | Unclaimed ({{ to4(reward) }} MIR ~ {{ to4(reward* Number(mir.prices.price)) }}ust )</h6>
      <h5>Average Cost ({{ Math.round(tx.masset*10000)/10000 }}{{ asset.symbol }} + {{ to4(tx.ust) }}ust) Price {{ to4(tx.ust/tx.masset) }}ust
        LP {{ to4(tx.share) }} | Pool Share {{ to4(toPercent(tx.share,toNumber(asset.positions.lpShares))) }}
        <br>
        Withdrawal ({{ to4(toPercent(tx.share,toNumber(asset.positions.lpShares))*toNumber(asset.positions.pool)/100) }}{{ asset.symbol }} 
        + {{ to4(toPercent(tx.share,toNumber(asset.positions.lpShares))*toNumber(asset.positions.uusdPool)/100) }}ust )
        Swap Price {{ 
          to3((toPercent(tx.share,toNumber(asset.positions.lpShares))*toNumber(asset.positions.uusdPool)/100) /
          (toPercent(tx.share,toNumber(asset.positions.lpShares))*toNumber(asset.positions.pool)/100))
        }}ust | Oracle Price {{ to3(asset.prices.oraclePrice) }}ust
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
         | Imp Loss (Including Commission)
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
      apy
    }
  }
}
`;
//import { LCDClient } from '@terra-money/terra.js';
import { Mirror } from '@mirror-protocol/mirror.js';

const mirror = new Mirror();

export default {
  name: "Txs",
  //props: ["txs"],
  props: ["tx","waddress","mir"],
  data() {
    return {
      asset: [],
      stakeinfo: [], 
      poolinfo: [],
      reward: 0
    };
  },
  created() {
    this.rewardInfo(this.waddress, this.tx.token)
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
    },
    rewardInfo: async function(address,token) {
        let txt = '';
        const rewardData = await mirror.staking.getRewardInfo(address,token);
        const rewardInfos = rewardData.reward_infos;
        console.log('\n\nR E W A R D DATA:\n');
        console.log(rewardInfos);
        this.stakeinfo = rewardInfos;
        //txt+= rewardInfos;
        
        for (const [key, tokenData] of Object.entries(rewardInfos)) {
            console.log(key);
            const poolData = await mirror.staking.getPoolInfo(tokenData.asset_token);
            //const poolData = await mirror.staking.getPoolInfo(token);
            console.log('\n\nP O O L DATA:\n');
            console.log(poolData); console.log('\n');
            this.poolinfo = poolData;
            //const rewardToClaim = (poolData.reward_index - tokenData.index) * tokenData.bond_amount + tokenData.pending_reward;
            const rewardToClaim = (Number(poolData.reward_index) - Number(tokenData.index)) * Number(tokenData.bond_amount) + Number(tokenData.pending_reward);
            this.reward = rewardToClaim/1000000; 
            //txt+=`Pool: ${tokenData.asset_token}\n`;
            //txt+=`Staked: ${tokenData.bond_amount/1000000}\n` + '\u001b[' + 33 + 'm';
            //txt+=`RewardToClaim: ${rewardToClaim/1000000}\n`+ '\u001b[0m\n\n';
        }

        return txt;
    }
  },
  
  computed: {

  },
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