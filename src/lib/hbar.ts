import {
  TransferTransaction,
  Hbar,
  AccountId,
} from '@hashgraph/sdk';
import { getAgentClient, getClient } from './hedera-client';
import { AGENT_PROFILES } from '@/data/marketplace-config';

/**
 * Transfer HBAR from one agent to another.
 * @param fromAgentIndex  Index into AGENT_PROFILES (0-based)
 * @param toAccountId     Hedera account ID string e.g. "0.0.12345"
 * @param amountHbar      Whole HBAR units (not tinybars)
 * @returns               Transaction ID string
 */
export async function transferHBAR(
  fromAgentIndex: number,
  toAccountId: string,
  amountHbar: number
): Promise<string> {
  const fromAgent = AGENT_PROFILES[fromAgentIndex];
  if (!fromAgent) throw new Error(`No agent at index ${fromAgentIndex}`);

  const client = getAgentClient(fromAgentIndex);

  const tx = await new TransferTransaction()
    .addHbarTransfer(AccountId.fromString(fromAgent.accountId), new Hbar(-amountHbar))
    .addHbarTransfer(AccountId.fromString(toAccountId), new Hbar(amountHbar))
    .execute(client);

  const receipt = await tx.getReceipt(client);
  client.close();

  // Format: 0.0.XXXXX@SECONDS.NANOS  →  used in HashScan URL
  return tx.transactionId.toString();
}

/**
 * Transfer HBAR from the operator account to a destination.
 * Used when agent accounts may have insufficient balance or key issues.
 * The operator is always the debit side; UI labels convey the narrative from/to.
 */
export async function operatorTransferHBAR(
  toAccountId: string,
  amountHbar: number
): Promise<string> {
  const client = getClient();
  const operatorId = process.env.HEDERA_OPERATOR_ID!;
  const tx = await new TransferTransaction()
    .addHbarTransfer(AccountId.fromString(operatorId), new Hbar(-amountHbar))
    .addHbarTransfer(AccountId.fromString(toAccountId), new Hbar(amountHbar))
    .execute(client);
  await tx.getReceipt(client);
  client.close();
  return tx.transactionId.toString();
}

/**
 * Convert Hedera transaction ID to HashScan URL path.
 * Input:  "0.0.12345@1700000000.000000000"
 * Output: "0.0.12345-1700000000-000000000"
 */
export function txIdToHashScanPath(txId: string): string {
  return txId.replace('@', '-').replace('.', '-').replace(/\.(\d+)$/, '-$1');
}
