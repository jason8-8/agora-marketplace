/**
 * Hedera Account Setup Script — Safe Version
 * ─────────────────────────────────────────────────────────────
 * 1. Generates all 6 keypairs and WRITES them to disk FIRST
 *    (so keys are never lost even if something fails)
 * 2. Creates accounts on-chain with 5 HBAR initial balance
 * 3. Requests free testnet HBAR from Hashio faucet for buyers
 * 4. Prints complete .env.local content
 * ─────────────────────────────────────────────────────────────
 */

const OPERATOR_ID  = '0.0.8596384';
const OPERATOR_KEY = '0xc98ea32318b3fe553a6b156849b35088f8cecfeebcd15b237dbeb25bb9e7cb4e';

import {
  Client,
  AccountId,
  PrivateKey,
  AccountCreateTransaction,
  Hbar,
  AccountBalanceQuery,
} from '@hashgraph/sdk';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEYS_FILE = join(__dirname, '.generated-keys.json');

const AGENT_DEFS = [
  { name: 'Speakers – Buyer  (TechConf Organiser)',  fund: 5, role: 'buyer'  },
  { name: 'Speakers – Seller (Dr. Sarah Chen)',       fund: 5, role: 'seller' },
  { name: 'Talent   – Buyer  (BlockStart Ltd)',       fund: 5, role: 'buyer'  },
  { name: 'Talent   – Seller (Alex Developer)',       fund: 5, role: 'seller' },
  { name: 'Sponsors – Buyer  (Durham Ent. Society)',  fund: 5, role: 'buyer'  },
  { name: 'Sponsors – Seller (CryptoVentures Fund)',  fund: 5, role: 'seller' },
];

async function faucetRequest(accountId) {
  try {
    const res = await fetch('https://faucet.hashio.io/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId }),
    });
    const json = await res.json();
    return json.status === 'SUCCESS' || res.ok;
  } catch {
    return false;
  }
}

async function main() {
  console.log('\n🔵  Connecting to Hedera Testnet...');
  const client = Client.forTestnet();
  const operatorKey = PrivateKey.fromStringECDSA(OPERATOR_KEY);
  client.setOperator(AccountId.fromString(OPERATOR_ID), operatorKey);

  const balance = await new AccountBalanceQuery()
    .setAccountId(AccountId.fromString(OPERATOR_ID))
    .execute(client);
  console.log(`✅  Operator balance: ${balance.hbars.toString()}`);
  console.log(`    Creating 6 accounts × 5 HBAR = ~30 HBAR needed\n`);

  // ── STEP 1: Generate all keys and save to disk IMMEDIATELY ────
  let keys;
  if (existsSync(KEYS_FILE)) {
    console.log('📂  Found existing keys file — reusing generated keys...');
    keys = JSON.parse(readFileSync(KEYS_FILE, 'utf8'));
  } else {
    console.log('🔑  Generating 6 ED25519 keypairs...');
    keys = AGENT_DEFS.map((agent) => {
      const pk = PrivateKey.generateED25519();
      return {
        name: agent.name,
        role: agent.role,
        privateKey: pk.toStringDer(),
        publicKey: pk.publicKey.toStringDer(),
        accountId: null,
      };
    });
    writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2));
    console.log(`✅  Keys saved to scripts/.generated-keys.json\n`);
  }

  // ── STEP 2: Create accounts on-chain ─────────────────────────
  for (let i = 0; i < AGENT_DEFS.length; i++) {
    if (keys[i].accountId) {
      console.log(`[${i + 1}/6] ${AGENT_DEFS[i].name} — already created: ${keys[i].accountId}`);
      continue;
    }

    process.stdout.write(`[${i + 1}/6] Creating ${AGENT_DEFS[i].name}... `);
    try {
      const pk = PrivateKey.fromStringDer(keys[i].privateKey);
      const tx = await new AccountCreateTransaction()
        .setKey(pk.publicKey)
        .setInitialBalance(new Hbar(AGENT_DEFS[i].fund))
        .setAccountMemo(AGENT_DEFS[i].name.trim())
        .execute(client);

      const receipt = await tx.getReceipt(client);
      keys[i].accountId = receipt.accountId.toString();
      writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2)); // save after EACH creation
      console.log(`✅  ${keys[i].accountId}`);
    } catch (err) {
      console.log(`\n❌  Failed: ${err.message}`);
      console.log(`    Remaining accounts will be skipped. Fix the issue and re-run — progress is saved.\n`);
      client.close();
      process.exit(1);
    }
  }

  client.close();

  // ── STEP 3: Fund buyer accounts from faucet ───────────────────
  console.log('\n💧  Requesting testnet HBAR from Hashio faucet for buyer accounts...');
  const buyers = keys.filter((k) => k.role === 'buyer');
  for (const buyer of buyers) {
    process.stdout.write(`    ${buyer.accountId} (${buyer.name.split('–')[0].trim()})... `);
    const ok = await faucetRequest(buyer.accountId);
    console.log(ok ? '✅  1000 HBAR requested' : '⚠️  Faucet request failed (try manually at portal.hedera.com/faucet)');
    await new Promise((r) => setTimeout(r, 1500)); // small delay between requests
  }

  // ── STEP 4: Print complete .env.local ─────────────────────────
  console.log('\n\n' + '═'.repeat(62));
  console.log('  COPY EVERYTHING BELOW INTO YOUR .env.local FILE');
  console.log('═'.repeat(62) + '\n');

  console.log(`HEDERA_OPERATOR_ID=${OPERATOR_ID}`);
  console.log(`HEDERA_OPERATOR_KEY=${OPERATOR_KEY}`);
  console.log('');

  keys.forEach((k, i) => {
    console.log(`# Agent ${i + 1} — ${k.name}`);
    console.log(`HEDERA_AGENT_${i + 1}_ID=${k.accountId}`);
    console.log(`HEDERA_AGENT_${i + 1}_KEY=${k.privateKey}`);
    console.log('');
  });

  console.log(`HEDERA_NETWORK=testnet`);
  console.log(`ANTHROPIC_API_KEY=`);
  console.log(`NEXT_PUBLIC_HASHSCAN_URL=https://hashscan.io/testnet`);

  console.log('\n' + '═'.repeat(62));
  console.log('  ✅  Done! Paste above into .env.local');
  console.log('  Then add your ANTHROPIC_API_KEY.');
  console.log('═'.repeat(62) + '\n');
}

main().catch((err) => {
  console.error('\n❌  Error:', err.message ?? err);
  process.exit(1);
});
