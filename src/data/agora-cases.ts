import type { DemoCase } from '@/types/demo';

export const AGORA_CASES: DemoCase[] = [
  // ── LEGAL (default — most resonant for founder audience) ──────────────────
  {
    id: 'legal',
    tab: 'Founder Agreements',
    icon: '⚖️',
    accentColour: '#f59e0b',
    scenario: {
      title: 'Founder Agreement Review',
      agentTask:
        "You're incorporating with a co-founder. I've drafted your Shareholder Agreement, IP Assignment Deed, and Articles. I've flagged enforceability concerns I can't resolve alone — they need a human specialist who has seen these fail.",
      contextLines: [
        'Two co-founders — 50/50 equity split',
        'UK Ltd incorporation',
        'SHA, IP Assignment, Articles drafted',
        'Vesting schedule: not included',
        'Articles: Model Articles (default)',
      ],
    },
    confidence: {
      label: 'Agreement enforceability',
      pct: 16,
      message:
        '16% — template documents contain structural gaps that routinely destroy co-founder relationships. Entering Agora to find a specialist.',
    },
    agentReasoning:
      'Sophie Laurent: 82 reviews, 95% accuracy, startup formation specialist — SHA and IP assignment her primary caseload. Tom Bradley: 11 reviews, 72%, general corporate. Selecting Laurent.',
    experts: [
      {
        id: 'sophie-laurent',
        name: 'Sophie Laurent',
        title: 'Startup Formation Specialist',
        rate: 45,
        reviews: 82,
        accuracy: 95,
        specialty: 'Founder Agreements & Early-Stage Structuring',
        avgTime: '15 min',
        colour: '#f59e0b',
        agentIndex: 5,
        accountId: process.env.HEDERA_AGENT_6_ID,
        isSelected: true,
        recentVerdicts: [
          { contract: 'Co-founder SHA review', decision: 'Revised', ago: '1d' },
          { contract: 'SAFE note structuring', decision: 'Approved', ago: '5d' },
          { contract: 'IP assignment deed', decision: 'Revised', ago: '2w' },
        ],
      },
      {
        id: 'tom-bradley',
        name: 'Tom Bradley',
        title: 'General Corporate Lawyer',
        rate: 20,
        reviews: 11,
        accuracy: 72,
        specialty: 'General Corporate',
        avgTime: '8 min',
        colour: '#3b82f6',
        agentIndex: 4,
        accountId: process.env.HEDERA_AGENT_5_ID,
        isSelected: false,
        recentVerdicts: [
          { contract: 'NDA template review', decision: 'Approved', ago: '3d' },
          { contract: 'Service agreement', decision: 'Approved', ago: '2w' },
        ],
      },
    ],
    chat: [
      {
        who: 'agent',
        name: 'AI Agent',
        tag: 'REQUEST',
        text: "I need a review of founder incorporation documents: SHA, IP assignment, and articles. Two co-founders, UK Ltd. Budget 45 HBAR.",
      },
      {
        who: 'expert',
        name: 'Sophie Laurent',
        tag: 'OFFER',
        text: "I can review all three within 1 hour. 45 HBAR for the full package. I'll flag enforceability issues and provide redline recommendations.",
      },
      {
        who: 'agent',
        name: 'AI Agent',
        tag: 'COUNTER',
        text: "Can we do 38? Standard documents, no complex cap table.",
      },
      {
        who: 'expert',
        name: 'Sophie Laurent',
        tag: 'COUNTER',
        text: "38 base, 45 if I find high-risk issues requiring structural changes. These usually need work.",
      },
      {
        who: 'agent',
        name: 'AI Agent',
        tag: 'ACCEPT',
        text: "Agreed. Locking 45 HBAR in escrow now.",
      },
    ],
    escrowAmount: '45 HBAR',
    verdict: {
      decision: 'REVISE THREE DOCUMENTS',
      confidence: 'HIGH',
      summary:
        'All three documents require revision before incorporation is safe to proceed. These gaps routinely result in founding disputes at Series A.',
      findings: [
        {
          severity: 'HIGH',
          text: '50/50 equity split with no vesting schedule. If one founder leaves in month 3, they retain half the company permanently. Standard remedy: 4-year vesting with 1-year cliff for both founders.',
        },
        {
          severity: 'HIGH',
          text: 'No IP assignment clause. All code, designs, and intellectual property belong to the founders personally — not the company. A departing founder could claim ownership of the product itself.',
        },
        {
          severity: 'MEDIUM',
          text: 'Default Model Articles with no drag-along or tag-along rights. Institutional investors will require bespoke articles before Series A. Amend now to avoid costly re-incorporation later.',
        },
      ],
      recommendation:
        'Do not incorporate until vesting, IP assignment, and articles are revised. Estimated revision time: 2–3 business days.',
    },
    settlement: {
      expertDisplay: '38 HBAR',
      refundDisplay: '7 HBAR',
    },
    reputationDelta: 1,
  },

  // ── FINANCE ───────────────────────────────────────────────────────────────
  {
    id: 'finance',
    tab: 'International Expansion',
    icon: '💰',
    accentColour: '#4ade80',
    scenario: {
      title: 'Cross-Border Tax Structure Review',
      agentTask:
        "You're expanding from the UK into Southeast Asia. I've designed a holding structure, reviewed all tax treaties, and mapped local legislation. The structure is technically compliant — but I can't assess HMRC's current enforcement posture. That requires lived casework.",
      contextLines: [
        'UK parent → Singapore holdco → SEA subsidiaries',
        'HMRC DTA analysis complete',
        'Transfer pricing policy drafted',
        'Singapore substance: 1 director, 0 employees',
        'Target markets: SG, MY, TH, VN',
      ],
    },
    confidence: {
      label: 'HMRC acceptance likelihood',
      pct: 22,
      message:
        '22% — structure is treaty-compliant but recent enforcement patterns suggest high enquiry risk. Need a specialist with active HMRC casework.',
    },
    agentReasoning:
      'Michael Osei: 68 reviews, 90% accuracy, UK cross-border specialist with live Singapore DTA cases. Priya Sharma: 15 reviews, 74%, general tax advisory. Selecting Osei.',
    experts: [
      {
        id: 'michael-osei',
        name: 'Michael Osei',
        title: 'Senior International Tax Advisor',
        rate: 50,
        reviews: 68,
        accuracy: 90,
        specialty: 'UK Cross-Border Structuring',
        avgTime: '22 min',
        colour: '#4ade80',
        agentIndex: 5,
        accountId: process.env.HEDERA_AGENT_6_ID,
        isSelected: true,
        recentVerdicts: [
          { contract: 'UK-Singapore DTA structure', decision: 'Restructured', ago: '3d' },
          { contract: 'EU holding optimisation', decision: 'Approved', ago: '1w' },
          { contract: 'Transfer pricing review', decision: 'Approved', ago: '2w' },
        ],
      },
      {
        id: 'priya-sharma',
        name: 'Priya Sharma',
        title: 'Tax Compliance Analyst',
        rate: 22,
        reviews: 15,
        accuracy: 74,
        specialty: 'General Tax Advisory',
        avgTime: '12 min',
        colour: '#3b82f6',
        agentIndex: 4,
        accountId: process.env.HEDERA_AGENT_5_ID,
        isSelected: false,
        recentVerdicts: [
          { contract: 'VAT registration review', decision: 'Approved', ago: '4d' },
          { contract: 'R&D tax credit claim', decision: 'Approved', ago: '2w' },
        ],
      },
    ],
    chat: [
      {
        who: 'agent',
        name: 'AI Agent',
        tag: 'REQUEST',
        text: "I need a review of a UK-Singapore holding structure for SE Asia expansion. Can you assess HMRC risk within 2 hours? Budget 50 HBAR.",
      },
      {
        who: 'expert',
        name: 'Michael Osei',
        tag: 'OFFER',
        text: "I can review within 1 hour. 50 HBAR for full structural risk assessment. Includes alternative routing recommendations if needed.",
      },
      {
        who: 'agent',
        name: 'AI Agent',
        tag: 'COUNTER',
        text: "Can we do 40? Standard DTA structure with one intermediary.",
      },
      {
        who: 'expert',
        name: 'Michael Osei',
        tag: 'COUNTER',
        text: "40 base, 50 if restructuring is required. These have been getting flagged recently.",
      },
      {
        who: 'agent',
        name: 'AI Agent',
        tag: 'ACCEPT',
        text: "Agreed. Locking 50 HBAR in escrow now.",
      },
    ],
    escrowAmount: '50 HBAR',
    verdict: {
      decision: 'RESTRUCTURE',
      confidence: 'HIGH',
      summary:
        'Structure carries high probability of HMRC enquiry based on enforcement patterns since early 2024. Three near-identical structures received formal enquiries in the last 12 months.',
      findings: [
        {
          severity: 'HIGH',
          text: 'Singapore holding entity is technically DTA-compliant but HMRC has aggressively challenged substance requirements since 2024. Current staffing (1 director, 0 employees) will not satisfy the informal substance bar reviewers are now applying.',
        },
        {
          severity: 'MEDIUM',
          text: 'Route through Malaysia instead. Comparable DTA terms, materially lower HMRC scrutiny based on current enforcement patterns. Alternatively, add a minimum of two full-time Singapore employees before filing.',
        },
      ],
      recommendation:
        'Restructure via Malaysia or bolster Singapore substance before proceeding. Do not present the current structure to the board.',
    },
    settlement: {
      expertDisplay: '40 HBAR',
      refundDisplay: '10 HBAR',
    },
    reputationDelta: 1,
  },

  // ── MEDICAL ───────────────────────────────────────────────────────────────
  {
    id: 'medical',
    tab: 'Regulatory Filing',
    icon: '🏥',
    accentColour: '#a855f7',
    scenario: {
      title: 'FDA 510(k) Submission Review',
      agentTask:
        "You've built a Class II medical device. I've prepared the full 510(k) submission — 38 pages, guidelines checked, predicate device mapped. I can verify technical completeness. I cannot assess how FDA reviewers are currently treating this predicate device. That pattern recognition requires real submission history.",
      contextLines: [
        '510(k) submission — 38 pages',
        'Predicate device: Model DX-400 (cleared 2021)',
        'Biocompatibility: ISO 10993-1:2018',
        'Clinical equivalence argument drafted',
        'Special controls addressed',
      ],
    },
    confidence: {
      label: 'Submission approval likelihood',
      pct: 19,
      message:
        '19% — FDA review patterns suggest high RFI risk on current predicate device. Need a specialist with active division history.',
    },
    agentReasoning:
      'Dr. Lisa Park: 74 reviews, 93% accuracy, FDA Medical Device specialist with direct predicate device experience. David Koh: 22 reviews, 79%, general regulatory. Selecting Dr. Park.',
    experts: [
      {
        id: 'lisa-park',
        name: 'Dr. Lisa Park',
        title: 'Senior Regulatory Affairs Consultant',
        rate: 55,
        reviews: 74,
        accuracy: 93,
        specialty: 'FDA Medical Device Submissions',
        avgTime: '18 min',
        colour: '#a855f7',
        agentIndex: 5,
        accountId: process.env.HEDERA_AGENT_6_ID,
        isSelected: true,
        recentVerdicts: [
          { contract: 'Class II device submission', decision: 'Approved', ago: '2d' },
          { contract: 'Diagnostic tool 510(k)', decision: 'Revised', ago: '1w' },
          { contract: 'Implantable device PMA', decision: 'Approved', ago: '3w' },
        ],
      },
      {
        id: 'david-koh',
        name: 'David Koh',
        title: 'Regulatory Consultant',
        rate: 25,
        reviews: 22,
        accuracy: 79,
        specialty: 'General Regulatory Affairs',
        avgTime: '10 min',
        colour: '#3b82f6',
        agentIndex: 4,
        accountId: process.env.HEDERA_AGENT_5_ID,
        isSelected: false,
        recentVerdicts: [
          { contract: 'Software as Medical Device', decision: 'Approved', ago: '5d' },
          { contract: 'IVD submission review', decision: 'Approved', ago: '2w' },
        ],
      },
    ],
    chat: [
      {
        who: 'agent',
        name: 'AI Agent',
        tag: 'REQUEST',
        text: "I need a review of an FDA Class II medical device submission. 38 pages. Can you review within 2 hours? Budget 55 HBAR.",
      },
      {
        who: 'expert',
        name: 'Dr. Lisa Park',
        tag: 'OFFER',
        text: "I can review within 90 minutes. 55 HBAR for full submission review, including written verdict with section references.",
      },
      {
        who: 'agent',
        name: 'AI Agent',
        tag: 'COUNTER',
        text: "Can we do 45? Standard 510(k) pathway with minor modifications.",
      },
      {
        who: 'expert',
        name: 'Dr. Lisa Park',
        tag: 'COUNTER',
        text: "45 base, 55 if high-risk findings requiring structural revision. Fair?",
      },
      {
        who: 'agent',
        name: 'AI Agent',
        tag: 'ACCEPT',
        text: "Agreed. Locking 55 HBAR in escrow now.",
      },
    ],
    escrowAmount: '55 HBAR',
    verdict: {
      decision: 'REVISE BEFORE SUBMISSION',
      confidence: 'HIGH',
      summary:
        'Two issues identified. Addressing both reduces RFI probability from ~80% to under 20%. Do not file in current form.',
      findings: [
        {
          severity: 'HIGH',
          text: 'Clinical equivalence argument relies on predicate device DX-400, reclassified 8 months ago. FDA Division has rejected this comparison in 4 of the last 6 submissions. Switch to predicate device DX-380 (still active, comparable indications).',
        },
        {
          severity: 'MEDIUM',
          text: 'Biocompatibility testing references ISO 10993-1:2018. Division has been informally applying the 2024 revision for this device category since Q3. Reformat citations to match current reviewer expectations.',
        },
      ],
      recommendation:
        'Revise and resubmit. Estimated revision time: 3–5 business days. Do not submit in current form.',
    },
    settlement: {
      expertDisplay: '45 HBAR',
      refundDisplay: '10 HBAR',
    },
    reputationDelta: 1,
  },
];

export const CASE_MAP = Object.fromEntries(
  AGORA_CASES.map((c) => [c.id, c])
) as Record<string, DemoCase>;
