import { prisma } from "@/lib/prisma";

export async function ensureEnterpriseDataForUser(userId: string) {
  // Ensure User and Wallet record exist
  let user = await prisma.user.findUnique({ where: { id: userId }, include: { wallet: true } });
  if (!user) {
    try {
      user = await prisma.user.create({
        data: {
          id: userId,
          email: userId === "usr_client_ca_02" ? "sarah.miller@scaleops.ca" : `${userId}@enterprise.com`,
          name: userId === "usr_client_ca_02" ? "Sarah Miller" : "Enterprise Administrator",
          companyName: userId === "usr_client_ca_02" ? "ScaleOps Technologies Inc (Toronto, Canada)" : "Enterprise Client Org",
          country: "CA",
          role: "USER",
          stripeCustomerId: `cus_${userId}`,
          wallet: {
            create: {
              balance: 8500,
              currency: "CAD",
              lifetimeSpentCents: 50000,
              lifetimeCreditsGranted: 60000,
            },
          },
        },
        include: { wallet: true },
      });
    } catch (e) {
      // User may have been created concurrently
      user = await prisma.user.findUnique({ where: { id: userId }, include: { wallet: true } });
    }
  }

  // Check CRM deals
  const dealCount = await prisma.crmDeal.count({ where: { userId } });
  if (dealCount === 0) {
    await prisma.crmDeal.createMany({
      data: [
        {
          userId,
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
          userId,
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
          userId,
          clientName: "Sophia Al-Maktoum",
          companyName: "Emirates Sovereign Cloud Ltd (Abu Dhabi, UAE)",
          contactEmail: "sophia@emiratescloud.ae",
          dealValueCAD: 72000,
          stage: "PROPOSAL",
          probability: 65,
          aiRiskScore: "LOW",
          notes: "Custom dedicated node deployment with Canadian/UAE cross-border data residency.",
        },
        {
          userId,
          clientName: "Liam O'Connor",
          companyName: "Alpha FinCorp Securities (Toronto, Canada)",
          contactEmail: "liam@alphafincorp.ca",
          dealValueCAD: 28000,
          stage: "QUALIFIED",
          probability: 70,
          aiRiskScore: "LOW",
          notes: "Real-time compliance validation and KYC neural verification cluster.",
        },
      ],
    });
  }

  // Check HR employees
  const empCount = await prisma.hrEmployee.count({ where: { userId } });
  if (empCount === 0) {
    await prisma.hrEmployee.createMany({
      data: [
        {
          userId,
          fullName: "Marcus Vance",
          workEmail: "marcus.vance@flywaycloud.ai",
          department: "Operations",
          jobTitle: "VP of Cloud & Enterprise Architecture",
          employmentType: "FULL_TIME",
          salaryCAD: 155000,
          status: "ACTIVE",
          performanceScore: 4.9,
        },
        {
          userId,
          fullName: "Dr. Vikram Seth",
          workEmail: "vikram.seth@flywaycloud.ai",
          department: "AI Research",
          jobTitle: "Principal AI Scientist",
          employmentType: "FULL_TIME",
          salaryCAD: 180000,
          status: "ACTIVE",
          performanceScore: 5.0,
        },
        {
          userId,
          fullName: "Elena Rostova",
          workEmail: "elena.rostova@flywaycloud.ai",
          department: "Engineering",
          jobTitle: "Senior Distributed Systems Engineer",
          employmentType: "REMOTE",
          salaryCAD: 135000,
          status: "ONBOARDING",
          performanceScore: 4.8,
        },
        {
          userId,
          fullName: "Tariq Mansoor",
          workEmail: "tariq.mansoor@flywaycloud.ai",
          department: "Sales",
          jobTitle: "Enterprise Account Executive (EMEA)",
          employmentType: "FULL_TIME",
          salaryCAD: 120000,
          status: "ACTIVE",
          performanceScore: 4.7,
        },
      ],
    });
  }

  // Check Automations
  const autoCount = await prisma.workflowAutomation.count({ where: { userId } });
  if (autoCount === 0) {
    await prisma.workflowAutomation.createMany({
      data: [
        {
          userId,
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
          userId,
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
          userId,
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
          userId,
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
    });
  }
}
