import test from 'node:test';
import assert from 'node:assert/strict';
import { pageMetadata } from '../sanity/lib/seo.ts';
const settings = { siteName: 'Alihoo', siteUrl: 'https://example.com', seo: { image: { src: '/default.png', alt: 'Default' } } };
test('project metadata has its own canonical, title and cover fallback', () => {
  const meta = pageMetadata(settings, '/projects/test', 'Test — Alihoo', 'Project description', {}, { src: '/cover.png', alt: 'Cover' });
  assert.equal(meta.alternates.canonical, 'https://example.com/projects/test');
  assert.equal(meta.openGraph.images[0].url, 'https://example.com/cover.png');
  assert.equal(meta.twitter.title, 'Test — Alihoo');
  assert.equal(meta.robots.index, true);
});
test('explicit project SEO takes precedence and noindex is honored', () => {
  const meta = pageMetadata(settings, '/projects/test', 'Default', 'Default', { title: 'Custom', description: 'Custom description', noIndex: true, image: { src: 'https://cdn.example.com/custom.png', alt: 'Custom' } });
  assert.equal(meta.title.absolute, 'Custom');
  assert.equal(meta.description, 'Custom description');
  assert.equal(meta.openGraph.images[0].url, 'https://cdn.example.com/custom.png');
  assert.equal(meta.robots.index, false);
  assert.equal(pageMetadata({ ...settings, seo: { noIndex: true } }, '/', 'Home', '').robots.index, false);
});
