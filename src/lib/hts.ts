import {
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  AccountId,
  PrivateKey,
} from '@hashgraph/sdk';
import { getClient, getAgentPrivateKey } from './hedera-client';
import type { Deal } from '@/types';

/**
 * Mint a deal confirmation NFT.
 * Creates a fresh NFT token collection (one per deal) and mints serial #1.
 */
export async function mintDealNFT(
  deal: Deal,
  treasuryAgentIndex: number
): Promise<{ tokenId: string; serial: number }> {
  const client = getClient();
  const treasuryKey = getAgentPrivateKey(treasuryAgentIndex);
  const treasuryAccountId = AccountId.fromString(
    process.env.HEDERA_OPERATOR_ID!
  );

  // Metadata stored in the NFT
  const metadata = JSON.stringify({
    market: deal.market,
    buyer: deal.buyerName,
    seller: deal.sellerName,
    price: deal.agreedPrice,
    terms: deal.terms,
    hbarTxId: deal.hbarTxId,
    hcsTopicId: deal.hcsTopicId,
    timestamp: deal.timestamp,
  });

  // 1. Create the token collection
  const createTx = await new TokenCreateTransaction()
    .setTokenName(`${deal.market} Deal NFT`)
    .setTokenSymbol('MDEAL')
    .setTokenType(TokenType.NonFungibleUnique)
    .setSupplyType(TokenSupplyType.Finite)
    .setMaxSupply(1)
    .setTreasuryAccountId(treasuryAccountId)
    .setSupplyKey(treasuryKey.publicKey)
    .setMaxTransactionFee(30)
    .freezeWith(client)
    .sign(treasuryKey);

  const createSubmit = await createTx.execute(client);
  const createReceipt = await createSubmit.getReceipt(client);
  const tokenId = createReceipt.tokenId!.toString();

  // 2. Mint one NFT on that collection
  const mintTx = await new TokenMintTransaction()
    .setTokenId(tokenId)
    .addMetadata(Buffer.from(metadata.slice(0, 100))) // max 100 bytes per NFT metadata
    .setMaxTransactionFee(10)
    .freezeWith(client)
    .sign(treasuryKey);

  const mintSubmit = await mintTx.execute(client);
  const mintReceipt = await mintSubmit.getReceipt(client);
  const serial = mintReceipt.serials[0].toNumber();

  client.close();
  return { tokenId, serial };
}
