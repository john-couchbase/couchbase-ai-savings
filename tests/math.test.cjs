const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
function evaluate(body) {
  const context = vm.createContext({});
  vm.runInContext(script.slice(0, script.indexOf('function badgeText')) + '\n' + script.slice(script.indexOf('function breakEvenRequests'), script.indexOf('function render(){')), context);
  return vm.runInContext(body, context);
}
function close(actual, expected) { assert.ok(Math.abs(actual - expected) < 1e-6, `${actual} != ${expected}`); }
test('tool search only discounts input charges', () => close(evaluate("state.mode='gpu';state.enabled.add('toolSearch');state.shares.toolSearch=100;computeTotal().low"), 3880.8));
test('prompt reductions cannot discount an output-only bill', () => close(evaluate("state.mode='gpu';state.price.in=0;state.enabled=new Set(['agentMemory','retrieval','toolSearch']);computeTotal().high"), 0));
test('token billing uses the supplied input-cost allocation', () => close(evaluate("state.inputSpendShare=25;state.enabled.add('toolSearch');state.shares.toolSearch=100;computeTotal().low"), 29400));
test('caching still avoids input and output charges', () => close(evaluate("state.inputSpendShare=0;state.enabled.add('caching');computeTotal().low"), 16200));
test('combined prompt reductions overlap only within input spend', () => close(evaluate("state.inputSpendShare=50;state.enabled=new Set(['agentMemory','toolSearch']);state.shares.agentMemory=100;state.shares.toolSearch=100;state.rates.agentMemory={low:.5,high:.5};state.rates.toolSearch={low:.5,high:.5};computeTotal().low"), 90000));
test('default all-lever totals preserve output spend except cache hits', () => close(evaluate("state.enabled=new Set(LEVERS.map(l=>l.id));computeTotal().high"), 75738.24657));
test('zero bill produces zero savings', () => close(evaluate("state.monthlySpend=0;state.enabled=new Set(LEVERS.map(l=>l.id));computeTotal().high"), 0));
test('complete reduction renders a readable infinite crossover', () => assert.equal(evaluate("state.mode='gpu';state.price.out=0;state.enabled.add('agentMemory');state.shares.agentMemory=100;state.rates.agentMemory={low:1,high:1};fmtCount(breakEvenRequests()/(1-computeTotal().highFrac))"), 'no finite break-even'));
test('finite default crossover is unchanged', () => close(evaluate('breakEvenRequests()'), 5483295.454545454));

test('reserved fleet billing is independent of active runtime', () => close(evaluate("state.gpu.hours=100;fleetAnnual()"), 115807.2));
test('on-demand fleet billing follows billed hours', () => close(evaluate("state.gpuPricing='ondemand';state.gpu.hourly=10.49;state.gpu.hours=100;fleetAnnual()"), 25176));
test('three-year reservation also bills every committed hour', () => close(evaluate("state.gpuPricing='reserved3';state.gpu.hourly=4.53;state.gpu.hours=0;fleetAnnual()"), 79365.6));
test('zero-priced inference has no finite crossover', () => assert.equal(evaluate("state.price={in:0,out:0};breakEvenRequests()"), Infinity));
test('numeric primitives reject nonfinite and bound extreme input', () => assert.equal(evaluate("Number.isFinite(nz(Infinity)) && nz(1e308)<=1e12"), true));
test('extreme numeric inputs do not overflow savings', () => assert.equal(evaluate("state.monthlySpend=1e308;state.enabled.add('agentMemory');Number.isFinite(computeTotal().high)"), true));

test('custom reduction details preserve decimal precision', () => assert.equal(evaluate("rateLabel({low:.125,high:.127},true)"), '12.5–12.7%'));
