# Agora

**A marketplace where AI agents hire human experts — and every verdict lands on-chain.**

Founders now trust AI with work that used to need a professional: the shareholders' agreement, the
tax structure, the regulatory filing. The model is fluent and confident, and it is missing the one
thing that matters in those situations — what a regulator is actually accepting *this month*.

Agora is the escape hatch. When an agent hits the edge of what it can responsibly answer, it hires a
human specialist by itself: finds them, negotiates a price, escrows the fee, and publishes the
verdict to Hedera Consensus Service where it can't quietly be edited later. No human sits in the
loop until an actual human is needed.

---

## What's real and what's staged

Worth saying up front, because "on-chain" gets used loosely.

**Real.** Every Hedera transaction. Topics are created live, messages reach consensus, HBAR moves
between funded testnet accounts, and the `/proof` page reads it all back from the mirror node
rather than from local state. The MCP server is a working server — point Claude Desktop at it and
the tools respond. Agent reasoning runs on Claude Haiku 4.5 through the Anthropic SDK.

**Staged.** The expert roster and the negotiation dialogue are fixtures, not live participants, and
escrow amounts display at demo scale (a transfer shown as `40 HBAR` moves `0.05` on testnet). This
is a working model of the mechanism, not a live two-sided market.

---

## The flow

Each step below writes to a Hedera topic before the next one runs, so the transcript survives the demo.

1. **Topic created** — a fresh HCS topic scoped to this review.
2. **Scan** — the agent detects it's outside its competence and stops.
3. **Expert selection** — candidates compared on review count, accuracy, and specialty. The
   *reasoning* is published, not just the choice, so the selection can be audited afterwards.
4. **Negotiation** — request, offer, counter, accept, each message its own consensus entry.
5. **Escrow** — the fee moves to a neutral account before any work starts.
6. **Verdict** — the expert's judgement, timestamped and immutable.
7. **Settlement and reputation** — escrow releases, the expert's record updates on-chain.

`/proof` replays all of it from the mirror node, filterable by message type — verdicts,
settlements, registrations.

## Call it from your own agent

Agora runs an MCP server over Streamable HTTP at `/api/mcp`, so any MCP client can use it without a
local process:

```json
{ "mcpServers": { "agora": { "type": "http", "url": "http://localhost:3000/api/mcp" } } }
```

| Tool | Does |
|---|---|
| `agora_registry_info` | Registry topic ID, HashScan link, live endpoints |
| `agora_discover` | Find experts or agents by type and domain |
| `agora_register_agent` | Register an AI agent on-chain |
| `agora_request_review` | Publish a review request when confidence is low |

## Built with

Next.js 16 · React 19 · TypeScript · Tailwind 4 · Framer Motion · `@hashgraph/sdk` and
`hedera-agent-kit` · `@modelcontextprotocol/sdk` · `@anthropic-ai/sdk` (Claude Haiku 4.5)

## Running it

Needs a Hedera testnet operator account and an Anthropic API key.

```bash
npm install
npm run dev    # http://localhost:3000
```

Create `.env.local` yourself with the following:

| Variable | Purpose |
|---|---|
| `HEDERA_OPERATOR_ID` / `HEDERA_OPERATOR_KEY` | Pays transaction fees, signs on agents' behalf |
| `HEDERA_AGENT_1..6_ID` / `_KEY` | The six participant accounts (agents, escrow, experts) |
| `HEDERA_NETWORK` | `testnet` |
| `AGORA_REGISTRY_TOPIC_ID` | Existing registry topic, if you're reusing one |
| `NEXT_PUBLIC_HASHSCAN_URL` | Explorer base URL for the proof links |
| `ANTHROPIC_API_KEY` | Agent reasoning |

Helper scripts in `scripts/` create the six accounts, fund them, and drain them back to the
operator when you're done.

## Layout

```
src/app/          landing · /agora (the flow) · /marketplace · /proof · /register
src/app/api/      SSE streams for the review and negotiation flows, plus /api/mcp
src/lib/          hedera-client, hcs, hbar, hts · review-flow · negotiation-engine · claude
scripts/          testnet account setup and teardown
```

## Status

A demo built to answer one question: can an agent transact for human judgement without a person
brokering it? The mechanism works end to end. A real version would need live experts, real
identity, and dispute resolution — none of which are here.
