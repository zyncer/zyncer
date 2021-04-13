<template>
  <tr :key="tx.token" v-if="to4(toPercent(tx.share,toNumber(asset.positions.lpShares))) != 0">
    <!-- {{ stakeinfo }} <br> {{ poolinfo }} <br> {{ reward }} -->
 
      <th scope="row">{{ asset.symbol }} <footer class="blockquote-footer">Apr: {{ to3(asset.statistic.apr*100) }}% </footer></th>
      <td><!--LP-->{{ to3(tx.share) }} <!--Staked LP-->({{ to3(parseInt(stakeinfo[0].bond_amount)/1000000) }})</td>
      <td><!--Withdrawal--> ({{ to4(toPercent(tx.share,toNumber(asset.positions.lpShares))*toNumber(asset.positions.pool)/100) }}{{ asset.symbol }} <br>
        + {{ to4(toPercent(tx.share,toNumber(asset.positions.lpShares))*toNumber(asset.positions.uusdPool)/100) }}ust )</td>
      <td><!--Pool Share--> {{ to4(toPercent(tx.share,toNumber(asset.positions.lpShares))) }}</td>
      <td><!--LP Value or Witdrawal Value-->{{ to3((toPercent(tx.share,toNumber(asset.positions.lpShares))*toNumber(asset.positions.uusdPool)/100)*2) }}ust</td>
      <!--<td>({{ Math.round(tx.masset*10000)/10000 }}{{ asset.symbol }} + {{ to4(tx.ust) }}ust) </td>--><!--Average Cost--> 
      <td><!--Cost Value--> {{ to4(tx.ust*2) }}ust <br><!-- Cost Price--> ({{ to4(tx.ust/tx.masset) }}ust)</td>
      <td><!--Swap Price--> {{ to3((toPercent(tx.share,toNumber(asset.positions.lpShares))*toNumber(asset.positions.uusdPool)/100)/(toPercent(tx.share,toNumber(asset.positions.lpShares))*toNumber(asset.positions.pool)/100))}}ust </td>
      <td v-bind:class="{ 
        'bg-danger': to4(percentChange(toPercent(tx.share,toNumber(asset.positions.lpShares))*toNumber(asset.positions.uusdPool)/100,tx.ust)) < 0,
         'bg-success' : to4(percentChange(toPercent(tx.share,toNumber(asset.positions.lpShares))*toNumber(asset.positions.uusdPool)/100,tx.ust)) >= 0
      }" 
      ><!--Unrealized--> <b>{{ to3(percentChange(toPercent(tx.share,toNumber(asset.positions.lpShares))*toNumber(asset.positions.uusdPool)/100,tx.ust)) }}% </b></td>
      <td v-bind:class="{ 
        'bg-danger': to4(percentChange(to4((toPercent(tx.share,toNumber(asset.positions.lpShares))*toNumber(asset.positions.uusdPool)/100)*2),
           to4(tx.ust + (tx.masset*(toPercent(tx.share,toNumber(asset.positions.lpShares))*toNumber(asset.positions.uusdPool)/100) /
          (toPercent(tx.share,toNumber(asset.positions.lpShares))*toNumber(asset.positions.pool)/100)) )  )) < 0,
         'bg-success' : to4(percentChange(to4((toPercent(tx.share,toNumber(asset.positions.lpShares))*toNumber(asset.positions.uusdPool)/100)*2),
           to4(tx.ust + (tx.masset*(toPercent(tx.share,toNumber(asset.positions.lpShares))*toNumber(asset.positions.uusdPool)/100) /
          (toPercent(tx.share,toNumber(asset.positions.lpShares))*toNumber(asset.positions.pool)/100)) )  )) >= 0
      }"     
      ><!--Imp Loss (Including Commission)-->
        {{
           to3(percentChange(to4((toPercent(tx.share,toNumber(asset.positions.lpShares))*toNumber(asset.positions.uusdPool)/100)*2),
           to4(tx.ust + (tx.masset*(toPercent(tx.share,toNumber(asset.positions.lpShares))*toNumber(asset.positions.uusdPool)/100) /
          (toPercent(tx.share,toNumber(asset.positions.lpShares))*toNumber(asset.positions.pool)/100)) )  ))
        }} %
      </td>
      <td><!--Unclaimed--> {{ to4(reward) }} mir <br> ({{ to4(reward* Number(mir.prices.price)) }} ust )</td>
<!--
      APY: {{ to3(asset.statistic.apy*100) }}%
      Oracle Price {{ to3(asset.prices.oraclePrice) }}ust
      HODL Value {{ 
          to4(tx.ust + (tx.masset*(toPercent(tx.share,toNumber(asset.positions.lpShares))*toNumber(asset.positions.uusdPool)/100) /
          (toPercent(tx.share,toNumber(asset.positions.lpShares))*toNumber(asset.positions.pool)/100)) )
          }}ust
-->
  </tr>
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
    this.rewardInfo(this.waddress, this.tx.token);
  },
  updated() {
    this.$emit('updateTotal', this.reward);
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
        //console.log('\n\nR E W A R D DATA:\n');
        //console.log(rewardInfos);
        this.stakeinfo = rewardInfos;
        //txt+= rewardInfos;
        
        for (const [key, tokenData] of Object.entries(rewardInfos)) {
            console.log(key);
            const poolData = await mirror.staking.getPoolInfo(tokenData.asset_token);
            //const poolData = await mirror.staking.getPoolInfo(token);
            //console.log('\n\nP O O L DATA:\n');
            //console.log(poolData); console.log('\n');
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

<style>
.display-table {
    display: table; 
}
.display-table > div { 
    display: table-row; 
}
.display-table > div > div { 
    display: table-cell;
    padding: 5px;
}
</style>