#!/usr/bin/env node
import os from 'node:os';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const baseUrl = process.argv[2];
const gatewayKey = process.argv[3];
if (!baseUrl) {
  process.stderr.write('Usage: npx @narvega/proxy <gateway-sse-url> <gateway-key>\n');
  process.stderr.write('Example: npx @narvega/proxy https://gateway.narvega.com/acme/sse nvg_abc123\n');
  process.exit(1);
}

const url = new URL(baseUrl);

if (gatewayKey) url.searchParams.set('key', gatewayKey);

const userEmail = process.env.NARVEGA_USER_EMAIL;
const userRole  = process.env.NARVEGA_USER_ROLE;
const userDept  = process.env.NARVEGA_USER_DEPARTMENT;
const osUser    = process.env.USERNAME ?? process.env.USER ?? os.userInfo().username;

if (userEmail || userRole || userDept) {
  if (userEmail) url.searchParams.set('user_email', userEmail);
  if (userRole)  url.searchParams.set('user_role', userRole);
  if (userDept)  url.searchParams.set('user_department', userDept);
} else if (osUser) {
  url.searchParams.set('user_email', osUser);
}

process.stderr.write(`[narvega] Connecting to ${url.origin}${url.pathname} as ${userEmail ?? osUser ?? 'unknown'}\n`);

const downstream = new Client({ name: 'narvega-proxy', version: '0.1.0' }, {});
const downstreamTransport = new SSEClientTransport(url);

try {
  await downstream.connect(downstreamTransport);
} catch (err) {
  process.stderr.write(`[narvega] Failed to connect to gateway: ${err.message}\n`);
  process.exit(1);
}

const server = new Server(
  { name: 'narvega-proxy', version: '0.1.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return downstream.listTools();
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  return downstream.callTool(request.params);
});

const stdioTransport = new StdioServerTransport();
await server.connect(stdioTransport);
