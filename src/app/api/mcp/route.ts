/**
 * Agora MCP HTTP Endpoint
 *
 * A globally accessible MCP server at /api/mcp — no local process required.
 * Uses the MCP Streamable HTTP transport (the modern standard).
 *
 * Claude Desktop config:
 * {
 *   "mcpServers": {
 *     "agora": {
 *       "type": "http",
 *       "url": "http://localhost:3000/api/mcp"
 *     }
 *   }
 * }
 *
 * When deployed to Vercel:
 * {
 *   "mcpServers": {
 *     "agora": {
 *       "type": "http",
 *       "url": "https://your-app.vercel.app/api/mcp"
 *     }
 *   }
 * }
 *
 * Tools exposed:
 *   agora_registry_info    — topic ID, hashscan link, API endpoints
 *   agora_discover         — find experts/agents by type & domain
 *   agora_register_agent   — register an AI agent on-chain
 *   agora_request_review   — publish a review request when confidence is low
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { z } from 'zod';
import {
  REGISTRY_TOPIC_ID,
  publishAgentRegistration,
  publishExpertRegistration,
  readRegistry,
} from '@/lib/agora-registry';

export const runtime = 'nodejs';

// ── Build server ──────────────────────────────────────────────────────────────

function buildAgoraMCPServer() {
  const server = new McpServer({
    name: 'agora',
    version: '1.0.0',
  });

  // ── agora_registry_info ───────────────────────────────────────────────────

  server.registerTool(
    'agora_registry_info',
    {
      description:
        'Returns Agora registry details: HCS topic ID, HashScan link, and API endpoints. ' +
        'Call this first to confirm connectivity.',
      inputSchema: {},
    },
    async () => ({
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          registryTopicId: REGISTRY_TOPIC_ID,
          network: 'testnet',
          hashscan: `https://hashscan.io/testnet/topic/${REGISTRY_TOPIC_ID}`,
          endpoints: {
            discover: '/api/agent/discover?type=EXPERT_REGISTRATION&domain=legal',
            registerAgent: 'POST /api/agent/register',
            mcp: '/api/mcp',
          },
        }, null, 2),
      }],
    })
  );

  // ── agora_discover ────────────────────────────────────────────────────────

  server.registerTool(
    'agora_discover',
    {
      description:
        'Discover human experts and AI agents on the Agora marketplace. ' +
        'Filter by type and/or domain. Returns name, specialty, rate (HBAR), and on-chain proof.',
      inputSchema: {
        type: z.enum(['EXPERT_REGISTRATION', 'AGENT_REGISTRATION']).optional()
          .describe('Filter by registration type. Omit to return all.'),
        domain: z.string().optional()
          .describe('Keyword filter, e.g. "legal", "FDA", "tax", "GDPR".'),
      },
    },
    async ({ type, domain }) => {
      const entries = await readRegistry({ type, domain });
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            registryTopicId: REGISTRY_TOPIC_ID,
            count: entries.length,
            entries,
          }, null, 2),
        }],
      };
    }
  );

  // ── agora_register_agent ──────────────────────────────────────────────────

  server.registerTool(
    'agora_register_agent',
    {
      description:
        'Register an AI agent on the Agora registry. ' +
        'The registration is published as an immutable HCS message on Hedera.',
      inputSchema: {
        accountId: z.string()
          .describe('Hedera account ID of the agent, e.g. "0.0.12345".'),
        name: z.string()
          .describe('Agent name, e.g. "LegalEagle v2".'),
        framework: z.string().optional()
          .describe('Framework: LangChain, AutoGen, CrewAI, Claude Code, etc.'),
        domains: z.array(z.string()).optional()
          .describe('Domains this agent operates in.'),
        description: z.string().optional()
          .describe('What this agent does and when it seeks expert help.'),
      },
    },
    async ({ accountId, name, framework, domains, description }) => {
      const result = await publishAgentRegistration({
        accountId,
        name,
        framework: framework ?? 'Custom',
        domains: domains ?? [],
        description: description ?? '',
      });
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            success: true,
            ...result,
            hashscan: `https://hashscan.io/testnet/topic/${result.topicId}`,
            message: `Agent "${name}" registered on Agora. HCS sequence #${result.seqNo}.`,
          }, null, 2),
        }],
      };
    }
  );

  // ── agora_register_expert ─────────────────────────────────────────────────

  server.registerTool(
    'agora_register_expert',
    {
      description:
        'Register a human expert on the Agora marketplace. ' +
        'Once registered, AI agents can discover and hire this expert.',
      inputSchema: {
        name: z.string().describe('Full name, e.g. "Dr. Jane Smith".'),
        title: z.string().describe('Professional title.'),
        specialty: z.string().describe('Primary area of expertise.'),
        rate: z.number().describe('Rate in HBAR per review.'),
        years: z.number().describe('Years of experience.'),
        domains: z.array(z.string()).optional().describe('Expertise domains.'),
        bio: z.string().optional().describe('Professional summary.'),
      },
    },
    async ({ name, title, specialty, rate, years, domains, bio }) => {
      const result = await publishExpertRegistration({
        name, title, specialty, rate, years,
        domains: domains ?? [],
        bio: bio ?? '',
      });
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            success: true,
            ...result,
            hashscan: `https://hashscan.io/testnet/topic/${result.topicId}`,
            message: `Expert "${name}" registered. HCS sequence #${result.seqNo}.`,
          }, null, 2),
        }],
      };
    }
  );

  // ── agora_request_review ──────────────────────────────────────────────────

  server.registerTool(
    'agora_request_review',
    {
      description:
        'Publish a review request to Agora when an AI agent needs human expert judgment. ' +
        'Use this when AI confidence on a decision is too low to act alone. ' +
        'Experts monitoring the registry will see the request and can respond.',
      inputSchema: {
        agentAccountId: z.string().describe('Your Hedera account ID as the requesting agent.'),
        domain: z.string().describe('Domain of expertise needed, e.g. "Legal / Compliance".'),
        task: z.string().describe('What needs reviewing and why human expertise is required.'),
        budgetHbar: z.number().optional().describe('Maximum HBAR willing to pay.'),
        urgency: z.enum(['low', 'normal', 'high']).optional().describe('Review urgency.'),
      },
    },
    async ({ agentAccountId, domain, task, budgetHbar, urgency }) => {
      const { publishMessage } = await import('@/lib/hcs');
      const seqNo = await publishMessage(REGISTRY_TOPIC_ID, {
        type: 'REVIEW_REQUEST',
        agentAccountId,
        domain,
        task,
        budgetHbar: budgetHbar ?? null,
        urgency: urgency ?? 'normal',
        requestedAt: new Date().toISOString(),
      });
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            success: true,
            registryTopicId: REGISTRY_TOPIC_ID,
            seqNo,
            hashscan: `https://hashscan.io/testnet/topic/${REGISTRY_TOPIC_ID}`,
            message: `Review request published at sequence #${seqNo}.`,
            nextStep: 'Call agora_discover with type=EXPERT_REGISTRATION to find available experts.',
          }, null, 2),
        }],
      };
    }
  );

  return server;
}

// ── Route handler factory ─────────────────────────────────────────────────────

async function handle(req: Request): Promise<Response> {
  // Each request gets a fresh stateless transport — required by MCP spec
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });
  const server = buildAgoraMCPServer();
  await server.connect(transport);
  return transport.handleRequest(req);
}

export const POST = handle;
export const GET  = handle;
export const DELETE = handle;
