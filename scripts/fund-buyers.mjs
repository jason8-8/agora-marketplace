/**
 * Fund the 3 buyer accounts so they can pay for their deals.
 * Speakers buyer needs 400 HBAR, Talent 200 HBAR, Sponsors 50 HBAR.
 * Operator currently has ~68 HBAR, so we keep deal amounts small but real.
 */
import { Client, AccountId, PrivateKey, TransferTransaction, Hbar, AccountBalanceQuery } from '@hashgraph/sdk';

const OPERATOR_ID  = '0.0.8596384';
const OPERATOR_KEY = '0xc98ea32318b3fe553a6b156849b35088f8cecfeebcd15b237dbeb25bb9e7cb4e';

// Buyer accounts — fund each with 20 HBAR (enough for demo deals)
const BUYERS = [
  { id: '0.0.8598872', name: 'Speakers Buyer',  amount: 20 },
  { id: '0.0.8598875', name: 'Talent Buyer',    amount: 20 },
  { id: '0.0.8598880', name: 'Sponsors Buyer',  amount: 20 },
];

async function main() {
  const client = Client.forTestnet();
  client.setOperator(AccountId.fromString(OPERATOR_ID), PrivateKey.fromStringECDSA(OPERATOR_KEY));

  const bal = await new AccountBalanceQuery().setAccountId(AccountId.fromString(OPERATOR_ID)).execute(client);
  console.log(`Operator balance: ${bal.hbars}`);

  for (const b of BUYERS) {
    process.stdout.write(`Sending ${b.amount} HBAR → ${b.id} (${b.name})... `);
    const tx = await new TransferTransaction()
      .addHbarTransfer(AccountId.fromString(OPERATOR_ID), new Hbar(-b.amount))
      .addHbarTransfer(AccountId.fromString(b.id), new Hbar(b.amount))
      .execute(client);
    await tx.getReceipt(client);
    console.log('✅');
  }

  client.close();
  console.log('\nDone. Each buyer now has 25 HBAR (5 initial + 20 funded).');
  console.log('Deal amounts set to: 15 HBAR (Speakers), 15 HBAR (Talent), 10 HBAR (Sponsors)');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
