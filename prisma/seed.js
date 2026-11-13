const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Full Enterprise Suite (HR, CRM, Admin, Workflows)...");

  // Clean existing data for reproducible state
  await prisma.adminAuditLog.deleteMany();
  await prisma.workflowAutomation.deleteMany();
  await prisma.hrEmployee.deleteMany();
  await prisma.crmDeal.deleteMany();
  await prisma.usageLog.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.user.deleteMany();

  // 1. SuperAdmin
  const admin = await prisma.user.create({
    data: {
      id: "usr_admin_001",
      email: "admin@flywaycloud.ai",
      name: "Marcus Vance (SuperAdmin)",
      companyName: "Flyway Systems HQ",
      country: "US",
      role: "SUPERADMIN",
      stripeCustomerId: "cus_mock_superadmin",
      wallet: {
        create: {
          balance: 999999,
          currency: "USD",
          lifetimeSpentCents: 500000,
          lifetimeCreditsGranted: 1000000,
        },
      },
    },
  });

  // 2. Canadian Enterprise Tenant (Primary user)
  const caClient = await prisma.user.create({
    data: {
      id: "usr_client_ca_02",
      email: "sarah.miller@scaleops.ca",
      name: "Sarah Miller",
      companyName: "ScaleOps Technologies Inc (Toronto, Canada)",
      country: "CA",
      role: "USER",
      stripeCustomerId: "cus_mock_ca_002",
      wallet: {
        create: {
          balance: 8500,
          currency: "CAD",
          lifetimeSpentCents: 50000, // $500 CAD
          lifetimeCreditsGranted: 60000,
          transactions: {
            create: [
              {
                type: "TOPUP",
                status: "SUCCEEDED",
                amountCents: 50000,
                currency: "CAD",
                creditsChange: 60000,
                balanceAfter: 60500,
                stripePaymentIntentId: "pi_3PmockTopUp500CAD002",
                stripeChargeId: "ch_3PmockCharge002",
                orderRef: "FLY-2026-CAD-500-1102",
                description: "Pro Scaling Compute Pack ($500 CAD - 60,000 Credits)",
                metadataJson: JSON.stringify({
                  service_type: "compute_credits_topup",
                  tier_id: "pro_500",
                }),
              },
            ],
          },
          usageLogs: {
            create: [
              {
                serviceName: "Autonomous Candidate Resume Extraction",
                serviceCategory: "HR",
                creditsCost: 50,
                balanceAfter: 8450,
                executionTimeMs: 240,
                payloadSnippet: "Screened 18 candidate resumes for Senior Distributed Systems Architect",
              },
              {
                serviceName: "Automated Enterprise Deal NDA Generation",
                serviceCategory: "CRM",
                creditsCost: 25,
                balanceAfter: 8425,
                executionTimeMs: 180,
                payloadSnippet: "Dispatched automated bilingual MSA contract for $45,000 CAD deal",
              },
            ],
          },
        },
      },
      // CRM Deals
      deals: {
        create: [
          {
            clientName: "Alexandre Chen",
            companyName: "Nexus Capital & Intelligence FZCO (Dubai, UAE)",
            contactEmail: "alex.chen@nexusfinance.ae",
            dealValueCAD: 45000,
            stage: "NEGOTIATION",
            probability: 85,
            aiRiskScore: "LOW",
            notes: "High-ticket multi-agent LLM cluster top-up pipeline. Reverse-charge tax verified.",
          },
          {
            clientName: "David Sterling",
            companyName: "Sterling Global Logistics Corp (Montreal, Canada)",
            contactEmail: "david@sterlinglogistics.ca",
            dealValueCAD: 18500,
            stage: "CLOSED_WON",
            probability: 100,
            aiRiskScore: "LOW",
            notes: "Document intelligence contract live. 150 credits deducted per BOL extraction.",
          },
          {
            clientName: "Sophia Al-Maktoum",
            companyName: "Emirates Sovereign Cloud Ltd (Abu Dhabi, UAE)",
            contactEmail: "sophia@emiratescloud.ae",
            dealValueCAD: 72000,
            stage: "PROPOSAL",
            probability: 65,
            aiRiskScore: "LOW",
            notes: "Custom dedicated node deployment with Canadian/UAE cross-border data residency.",
          },
        ],
      },
      // HR Employees & Staff
      employees: {
        create: [
          {
            fullName: "Sarah Miller",
            workEmail: "sarah.miller@scaleops.ca",
            department: "Operations",
            jobTitle: "VP of Cloud & Operations",
            employmentType: "FULL_TIME",
            salaryCAD: 145000,
            status: "ACTIVE",
            performanceScore: 4.9,
          },
          {
            fullName: "Dr. Vikram Seth",
            workEmail: "vikram.seth@scaleops.ca",
            department: "AI Research",
            jobTitle: "Principal AI Scientist",
            employmentType: "FULL_TIME",
            salaryCAD: 175000,
            status: "ACTIVE",
            performanceScore: 5.0,
          },
          {
            fullName: "Elena Rostova",
            workEmail: "elena.rostova@scaleops.ca",
            department: "Engineering",
            jobTitle: "Senior Full-Stack Architect",
            employmentType: "REMOTE",
            salaryCAD: 130000,
            status: "ONBOARDING",
            performanceScore: 4.7,
          },
          {
            fullName: "Tariq Mansoor",
            workEmail: "tariq.mansoor@scaleops.ca",
            department: "Sales",
            jobTitle: "Enterprise Account Executive",
            employmentType: "FULL_TIME",
            salaryCAD: 115000,
            status: "ACTIVE",
            performanceScore: 4.8,
          },
        ],
      },
      // Automated Workflow Pipelines
      automations: {
        create: [
          {
            name: "Automated Inbound Lead Qualification & CRM Sync",
            category: "CRM",
            triggerEvent: "On Webhook Inbound Lead Submission",
            actionPlan: "Parses corporate domain, calculates risk score, and drafts custom SLA proposal",
            creditCost: 25,
            status: "ACTIVE",
            runCount: 64,
            lastRunAt: new Date(),
          },
          {
            name: "Autonomous Candidate Resume Extraction & Skill Score",
            category: "HR",
            triggerEvent: "On New PDF Application Upload",
            actionPlan: "Extracts technical competencies, benchmarks salary, schedules technical interview",
            creditCost: 50,
            status: "ACTIVE",
            runCount: 142,
            lastRunAt: new Date(),
          },
          {
            name: "Monthly PIPEDA & DIFC Tax Compliance Audit",
            category: "ADMINISTRATION",
            triggerEvent: "1st of Every Month at 00:00 UTC",
            actionPlan: "Audits cross-border ledger transactions, generates GST/HST & VAT reverse-charge reports",
            creditCost: 75,
            status: "ACTIVE",
            runCount: 8,
            lastRunAt: new Date(),
          },
          {
            name: "Low-Balance Auto-Topup & Fraud Monitor",
            category: "BILLING",
            triggerEvent: "When Wallet Balance < 100 Credits",
            actionPlan: "Triggers pre-authorized $250 CAD Stripe top-up with off-session zero-OTP guarantee",
            creditCost: 10,
            status: "ACTIVE",
            runCount: 19,
            lastRunAt: new Date(),
          },
        ],
      },
      // Admin Audit Logs
      auditLogs: {
        create: [
          {
            eventType: "COMPLIANCE_CHECK",
            severity: "INFO",
            description: "Automated Canadian PIPEDA & UAE ADGM data sovereignty audit passed with 100% compliance.",
          },
          {
            eventType: "CONTRACT_SIGNING",
            severity: "INFO",
            description: "Master Services Agreement (MSA 2026.4.1) electronically countersigned by Authorized Officer.",
          },
        ],
      },
    },
  });

  console.log("Full Enterprise Suite seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
