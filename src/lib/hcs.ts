import {
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicId,
} from '@hashgraph/sdk';
import { getClient } from './hedera-client';

export async function createTopic(memo: string): Promise<string> {
  const client = getClient();
  const tx = await new TopicCreateTransaction()
    .setTopicMemo(memo)
    .setMaxTransactionFee(5)
    .execute(client);
  const receipt = await tx.getReceipt(client);
  const topicId = receipt.topicId!.toString();
  client.close();
  return topicId;
}

export async function publishMessage(
  topicId: string,
  message: object
): Promise<number> {
  const client = getClient();
  const content = JSON.stringify(message);
  // HCS limit is 1024 bytes — truncate content field if needed
  const tx = await new TopicMessageSubmitTransaction()
    .setTopicId(TopicId.fromString(topicId))
    .setMessage(content)
    .execute(client);
  const receipt = await tx.getReceipt(client);
  const seqNo = receipt.topicSequenceNumber?.toNumber() ?? 0;
  client.close();
  return seqNo;
}

export async function readMessages(topicId: string): Promise<object[]> {
  // Use mirror node REST API — simpler and non-streaming, works in API routes
  const url = `https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId}/messages?limit=100&order=asc`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.messages ?? []).map((m: { message: string; sequence_number: number }) => {
    try {
      const decoded = Buffer.from(m.message, 'base64').toString('utf8');
      return { ...JSON.parse(decoded), hcsSeqNo: m.sequence_number };
    } catch {
      return { raw: m.message, hcsSeqNo: m.sequence_number };
    }
  });
}
