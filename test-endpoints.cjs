const assert = require('node:assert/strict');
const BuiltWith = require('./src');
const calls = [];
global.fetch = async (url) => { calls.push(new URL(url)); return { json: async () => ({ next_page: 2, more_results: true }), text: async () => '{"Results":[],"NextOffset":"END"}' }; };
(async () => {
  const client = BuiltWith('test-key');
  await client.domain('example.com');
  await client.lists('Shopify');
  const page = await client.relationships('example.com', { page: 2, ip: true });
  await client.mcpRegistry({ search: 'payments' });
  await client.mcpRegistryV2({ category: 'developer-tools' });
  assert.deepEqual(calls.map(url => url.pathname), ['/v26/api.json', '/lists13/api.json', '/rv5/api.json', '/mcp2/api.json', '/mcp2/api.json']);
  assert.equal(calls[2].searchParams.get('PAGE'), '2');
  assert.equal(calls[2].searchParams.get('IP'), 'yes');
  assert.equal(page.next_page, 2);
  await assert.rejects(client.relationships('example.com', { page: 0 }), /positive integer/);
  await assert.rejects(client.relationships(['example.com', 'builtwith.com']), /multi-domain/);
  console.log('Endpoint and relationship paging checks passed');
})().catch(err => { console.error(err); process.exitCode = 1; });
