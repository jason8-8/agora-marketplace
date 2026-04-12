export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { AccountBalanceQuery, AccountId } from '@hashgraph/sdk';
import { getClient } from '@/lib/hedera-client';

export async function GET() {
  try {
    const client = getClient();
    const balance = await new AccountBalanceQuery()
      .setAccountId(AccountId.fromString(process.env.HEDERA_OPERATOR_ID!))
      .execute(client);
    client.close();
    return NextResponse.json({
      status: 'ok',
      network: process.env.HEDERA_NETWORK ?? 'testnet',
      operatorId: process.env.HEDERA_OPERATOR_ID,
      operatorBalance: balance.hbars.toString(),
    });
  } catch (e) {
    return NextResponse.json(
      { status: 'error', message: String(e) },
      { status: 500 }
    );
  }
}
