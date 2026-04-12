/**
 * Drains HBAR from all agent accounts back to the operator.
 * Run with: node scripts/drain-to-operator.mjs
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Client, AccountId, PrivateKey, TransferTransaction, Hbar } = require('@hashgraph/sdk');
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env.local');
const env = {};
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const OPERATOR_ID = env.HEDERA_OPERATOR_ID;
const OPERATOR_KEY = env.HEDERA_OPERATOR_KEY;

const AGENTS = [
  { id: env.HEDERA_AGENT_1_ID, key: env.HEDERA_AGENT_1_KEY, name: 'Agent 1' },
  { id: env.HEDERA_AGENT_2_ID, key: env.HEDERA_AGENT_2_KEY, name: 'Agent 2' },
  { id: env.HEDERA_AGENT_3_ID, key: env.HEDERA_AGENT_3_KEY, name: 'Agent 3' },
  { id: env.HEDERA_AGENT_4_ID, key: env.HEDERA_AGENT_4_KEY, name: 'Agent 4' },
  { id: env.HEDERA_AGENT_5_ID, key: env.HEDERA_AGENT_5_KEY, name: 'Agent 5' },
  { id: env.HEDERA_AGENT_6_ID, key: env.HEDERA_AGENT_6_KEY, name: 'Agent 6' },
];

// Keep a tiny buffer so the account stays alive (min 0.001 HBAR to cover fees)
const KEEP_HBAR = 0.05;

function parseKey(k) {
  if (k.startsWith('0x') || (k.length === 64 && /^[0-9a-fA-F]+$/.test(k))) {
    return PrivateKey.fromStringECDSA(k);
  }
  return PrivateKey.fromStringDer(k);
}

async function getBalance(accountId) {
  const res = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}`);
  const data = await res.json();
  return data.balance.balance; // tinybars
}

for (const agent of AGENTS) {
  if (!agent.id || !agent.key) { console.log(`${agent.name}: missing env vars, skipping`); continue; }

  const tinybars = await getBalance(agent.id);
  const hbar = tinybars / 1e8;
  const sendHbar = hbar - KEEP_HBAR;

  if (sendHbar < 0.01) {
    console.log(`${agent.name} (${agent.id}): ${hbar.toFixed(4)} HBAR — too low, skipping`);
    continue;
  }

  console.log(`${agent.name} (${agent.id}): ${hbar.toFixed(4)} HBAR → sending ${sendHbar.toFixed(4)} to operator...`);

  try {
    const agentKey = parseKey(agent.key);
    // Agent signs as operator of its own client
    const client = Client.forTestnet();
    client.setOperator(AccountId.fromString(agent.id), agentKey);

    const tx = await new TransferTransaction()
      .addHbarTransfer(AccountId.fromString(agent.id), new Hbar(-sendHbar))
      .addHbarTransfer(AccountId.fromString(OPERATOR_ID), new Hbar(sendHbar))
      .execute(client);

    const receipt = await tx.getReceipt(client);
    client.close();
    console.log(`  ✓ txId: ${tx.transactionId.toString()}  status: ${receipt.status}`);
  } catch (e) {
    console.error(`  ✗ failed: ${e.message}`);
  }
}

console.log('\nDone. New operator balance:');
const finalBal = await getBalance(OPERATOR_ID);
console.log(`  ${OPERATOR_ID}: ${(finalBal / 1e8).toFixed(4)} HBAR`);
