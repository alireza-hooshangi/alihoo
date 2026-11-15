import test from 'node:test';
import assert from 'node:assert/strict';
import { orderProjects, isSafeBioHref } from '../sanity/lib/presentation.ts';

test('explicit order precedes unlisted projects; missing, unpublished and duplicate references do not add items', () => {
  const published = [{_id:'a'}, {_id:'b'}, {_id:'c'}];
  const result = orderProjects(published, [{_ref:'c'}, {_ref:'unpublished'}, {_ref:'c'}, {_ref:'a'}]);
  assert.deepEqual(result.map(p => p._id), ['c', 'a', 'b']);
  assert.deepEqual(published.map(p => p._id), ['a', 'b', 'c']);
});
test('empty order keeps all published projects', () => {
  assert.deepEqual(orderProjects([{_id:'a'}], []), [{_id:'a'}]);
});
test('bio links allow web, email and telephone destinations but reject executable URLs', () => {
  for (const href of ['https://alihoo.me', 'http://example.com', 'mailto:hello@alihoo.me', 'tel:+12345']) assert.equal(isSafeBioHref(href), true);
  for (const href of ['javascript:alert(1)', 'data:text/html,test', '//example.com', '', null]) assert.equal(isSafeBioHref(href), false);
});
