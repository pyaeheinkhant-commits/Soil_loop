const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Exercise the real TypeScript store with isolated browser storage per test.
function app() {
  const modules = new Map();
  const values = new Map();
  let failWrites = false;
  const localStorage = { getItem: (k) => values.get(k) ?? null, setItem: (k, v) => { if (failWrites) throw new Error('quota'); values.set(k, v); }, removeItem: (k) => values.delete(k) };
  const window = { dispatchEvent() {}, addEventListener() {}, removeEventListener() {} };
  function load(name) {
    const file = path.resolve(__dirname, '../src/lib', `${name}.ts`);
    if (modules.has(file)) return modules.get(file).exports;
    const loadedModule = { exports: {} };
    modules.set(file, loadedModule);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const context = vm.createContext({ module: loadedModule, exports: loadedModule.exports, require: (p) => load(p.replace('./', '')), localStorage, window, structuredClone, Event, Date, URL, console });
    vm.runInContext(code, context, { filename: file });
    return loadedModule.exports;
  }
  return { store: load('store'), metrics: load('metrics'), ops: load('operations'), values, fail: () => { failWrites = true; } };
}

function collection(overrides = {}) {
  return { block_id: 'BLK-B', bin_id: 'BIN-B-01', collector_id: 'USR-002', collection_datetime: '2026-10-23T10:00:00Z', weight_kg: 18, accepted_weight_kg: 18, weight_method: 'calibrated_scale', contamination_status: 'clean', contamination_notes: '', destination: 'Kebun Komuniti A', batch_id: 'BATCH-013', status: 'completed', ...overrides };
}

test('partial acceptance adds only accepted kg to diversion and batch input', () => {
  const { store, metrics } = app();
  store.addCollection(collection({ accepted_weight_kg: 12, contamination_status: 'minor', contamination_notes: 'Removed contaminated material.' }));
  assert.equal(metrics.divertedKg(store.loadState(), 'BLK-B'), 30);
  assert.equal(store.loadState().batches.find(b => b.batch_id === 'BATCH-013').input_weight_kg, 28);
});
test('rejected and missed pickups do not enter diversion or a batch', () => {
  const { store, metrics } = app();
  store.addCollection(collection({ contamination_status: 'rejected', accepted_weight_kg: 0, batch_id: null, destination: 'General waste', contamination_notes: 'Oil mixed in.' }));
  store.addCollection(collection({ status: 'missed', weight_kg: 0, accepted_weight_kg: 0, batch_id: null, contamination_notes: 'Bin inaccessible.' }));
  assert.equal(metrics.divertedKg(store.loadState()), 76);
  assert.equal(store.loadState().batches[1].input_weight_kg, 16);
});
test('invalid, negative, excessive and untraceable weights are rejected', () => {
  const { store } = app();
  for (const patch of [{ weight_kg: -1 }, { weight_kg: NaN }, { accepted_weight_kg: 19 }, { batch_id: null }, { batch_id: 'BATCH-012' }, { destination: 'Other partner' }, { status: 'delayed' }]) {
    assert.throws(() => store.addCollection(collection(patch)));
  }
  assert.equal(store.loadState().collections.length, 5);
});
test('new batch starts empty and accepts a traceable collection', () => {
  const { store } = app();
  const b = store.createBatch({ compost_site: 'Kebun Komuniti A', composting_method: 'Hot composting', start_date: '2026-10-23', expected_ready_date: '2026-12-23' });
  assert.equal(b.input_weight_kg, 0);
  store.addCollection(collection({ batch_id: b.batch_id }));
  assert.equal(store.loadState().batches.at(-1).input_weight_kg, 18);
  assert.ok(store.loadState().batches.at(-1).source_block_ids.includes('BLK-B'));
});
test('ready status requires quality, output, input and actual ready date', () => {
  const { store } = app();
  assert.throws(() => store.updateBatch('BATCH-013', { batch_status: 'ready', output_compost_kg: 4 }));
  store.updateBatch('BATCH-013', { batch_status: 'ready', quality_status: 'passed', quality_notes: 'Mature, no odour or contamination.', output_compost_kg: 4, actual_ready_date: '2026-12-13' });
  assert.equal(store.loadState().batches[1].batch_status, 'ready');
});
test('garden use cannot exceed stock or use unfinished compost', () => {
  const { store } = app();
  const input = { garden_id: 'GARDEN-001', batch_id: 'BATCH-012', compost_used_kg: 6, usage_date: '2026-10-23', garden_area: 'Bed 5', update_notes: 'Added compost.', photo_url: '' };
  assert.throws(() => store.addCompostUse(input));
  assert.throws(() => store.addCompostUse({ ...input, batch_id: 'BATCH-013', compost_used_kg: 1 }));
  store.addCompostUse({ ...input, compost_used_kg: 5 });
  assert.throws(() => store.addCompostUse({ ...input, compost_used_kg: 1 }));
  assert.throws(() => store.updateBatch('BATCH-012', { output_compost_kg: 10 }));
  assert.throws(() => store.updateBatch('BATCH-012', { quality_status: 'failed' }));
});
test('full and closed bins block check-in, repeat click is rejected', () => {
  const { store } = app();
  store.updateBinStatus('BIN-B-01', 'full');
  assert.throws(() => store.addCheckin('USR-001', 'BLK-B', 'BIN-B-01'));
  store.updateBinStatus('BIN-B-01', 'closed');
  assert.throws(() => store.addCheckin('USR-001', 'BLK-B', 'BIN-B-01'));
  store.updateBinStatus('BIN-B-01', 'available');
  store.addCheckin('USR-001', 'BLK-B', 'BIN-B-01');
  assert.throws(() => store.addCheckin('USR-001', 'BLK-B', 'BIN-B-01'));
});
test('storage failure preserves the last successfully saved state', () => {
  const { store, fail } = app();
  store.loadState(); fail();
  assert.throws(() => store.addCollection(collection()), /Could not save/);
  assert.equal(store.loadState().collections.length, 5);
});
test('older browser data gains a request list without losing collections', () => {
  const a = app(); const old = structuredClone(a.store.loadState()); delete old.compost_requests;
  const b = app(); b.values.set('soilloop-demo-v1', JSON.stringify(old));
  assert.equal(b.store.loadState().compost_requests.length, 0);
  assert.equal(b.store.loadState().collections.length, 5);
});
test('media is optional, validates URLs, and requires credits and video text', () => {
  const { store, ops } = app();
  assert.equal(ops.validMediaUrl('javascript:alert(1)'), false);
  assert.equal(ops.validMediaUrl('//unknown.example/x'), false);
  assert.equal(ops.validMediaUrl('/media/garden.mp4'), true);
  const input = { garden_id: 'GARDEN-001', batch_id: 'BATCH-012', compost_used_kg: 1, usage_date: '2026-10-23', garden_area: 'Bed 5', update_notes: 'Mint planted.', photo_url: '', video_url: '/media/garden.mp4' };
  assert.throws(() => store.addCompostUse(input));
  store.addCompostUse({ ...input, media_credit: 'Garden team', video_description: 'A gardener applies compost around mint.' });
  assert.equal(store.loadState().compost_uses.at(-1).video_url, '/media/garden.mp4');
});
test('garden demand links to actual use instead of being fulfilled by a click', () => {
  const { store } = app();
  store.requestCompost({ garden_id: 'GARDEN-001', requested_kg: 3, needed_by: '2026-10-25', purpose: 'Herb beds' });
  const request = store.loadState().compost_requests[0];
  store.addCompostUse({ garden_id: 'GARDEN-001', batch_id: 'BATCH-012', request_id: request.request_id, compost_used_kg: 3, usage_date: '2026-10-23', garden_area: 'Bed 5', update_notes: 'Applied to herbs.', photo_url: '' });
  assert.equal(store.loadState().compost_uses.at(-1).request_id, request.request_id);
});
test('Malaysia datetime is independent of system timezone', () => {
  const { ops } = app();
  assert.equal(ops.malaysiaDateTime(new Date('2026-10-22T18:30:00Z')), '2026-10-23T02:30');
});
