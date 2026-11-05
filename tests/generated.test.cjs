const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
test('one million seeded scenarios agree with a separate remaining-cost oracle', () => {
  const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
  const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const ctx=vm.createContext({});
  vm.runInContext(script.slice(0,script.indexOf('function badgeText'))+';globalThis.api={state,LEVERS,ARCHETYPES,computeTotal,annualSpend,inputSpendFraction};',ctx);
  const {state,LEVERS,ARCHETYPES,computeTotal,annualSpend,inputSpendFraction}=ctx.api;
  let seed=20261104;
  const random=()=>((seed=(Math.imul(1664525,seed)+1013904223)>>>0)/4294967296);
  const shapes=Object.keys(ARCHETYPES);
  for(let i=0;i<1000000;i++){
    state.mode=i%2?'gpu':'token';state.monthlySpend=random()*1e6;
    state.inputSpendShare=i%100===0?0:i%100===1?100:random()*100;
    state.price={in:random()*20,out:random()*100};
    state.traffic={requests:random()*1e8,inTok:random()*200000,outTok:random()*20000};
    state.archetype=shapes[i%4];state.enabled=new Set();
    for(const l of LEVERS){if(random()>.4)state.enabled.add(l.id);if(l.type==='share'){state.shares[l.id]=random()*100;state.rates[l.id]={low:random(),high:random()};}}
    const actual=computeTotal(), annual=annualSpend(), input=inputSpendFraction(), cache=ARCHETYPES[state.archetype];
    const expected=['low','high'].map(end=>{
      const c=state.enabled.has('caching')?cache.addressable*cache[end==='low'?'hitLow':'hitHigh']:0;
      let inputRemaining=annual*input*(1-c);
      for(const l of LEVERS){if(l.type==='share'&&state.enabled.has(l.id)){const r=state.rates[l.id];const rate=end==='low'?Math.min(r.low,r.high):Math.max(r.low,r.high);inputRemaining*=1-state.shares[l.id]/100*rate;}}
      return annual-inputRemaining-annual*(1-input)*(1-c);
    });
    const tolerance=Math.max(1e-5,annual*1e-12);
    assert.ok(Number.isFinite(actual.low)&&Number.isFinite(actual.high),`finite case ${i}`);
    assert.ok(actual.low>=-tolerance&&actual.low<=actual.high+tolerance&&actual.high<=annual+tolerance,`bounds case ${i}`);
    assert.ok(Math.abs(actual.low-expected[0])<=tolerance&&Math.abs(actual.high-expected[1])<=tolerance,`oracle case ${i}`);
    assert.ok(Math.abs(actual.rows.reduce((sum,row)=>sum+row.low,0)-actual.overlapLow-actual.low)<=tolerance,`breakdown case ${i}`);
  }
});
