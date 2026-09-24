// Seeds one demo workspace with three user profiles (MS Sir, DK Rawat, DN Jha)
// and ~130 feedback items so the app is immediately ready.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CHANNELS = ["support_ticket", "app_store", "nps_survey", "sales_call", "community"];
const CUSTOMER_NAMES = [
  "Sarah Jenkins", "Mark Thompson", "Elena Rodriguez", "David Kim", "Priya Sharma",
  "Alex Rivera", "Jessica Taylor", "Michael Chen", "Emily Watson", "Carlos Mendes",
  "Amanda Brooks", "Rachel Morgan", "Tom Williams", "Chloe Bennett", "Brian Foster",
];

const FEEDBACK_BANK: { content: string; sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE"; theme: string }[] = [
  { content: "Onboarding took forever — I couldn't figure out how to invite my team.", sentiment: "NEGATIVE", theme: "Onboarding" },
  { content: "Setup wizard is confusing, took me 3 tries to connect my workspace.", sentiment: "NEGATIVE", theme: "Onboarding" },
  { content: "First-time setup was smooth, had it running in five minutes.", sentiment: "POSITIVE", theme: "Onboarding" },
  { content: "Wish there was a guided tour for new team members.", sentiment: "NEUTRAL", theme: "Onboarding" },
  { content: "The new dashboard is gorgeous and finally fast. Huge improvement.", sentiment: "POSITIVE", theme: "Dashboard & Performance" },
  { content: "Dashboard takes ages to load once we have a few thousand rows.", sentiment: "NEGATIVE", theme: "Dashboard & Performance" },
  { content: "Charts on the dashboard are exactly what our PM team needed.", sentiment: "POSITIVE", theme: "Dashboard & Performance" },
  { content: "App freezes for a few seconds when switching between filters.", sentiment: "NEGATIVE", theme: "Dashboard & Performance" },
  { content: "It does the job, but the mobile experience needs work.", sentiment: "NEUTRAL", theme: "Mobile Experience" },
  { content: "Mobile app crashes every time I try to upload a photo.", sentiment: "NEGATIVE", theme: "Mobile Experience" },
  { content: "Would love a proper mobile app instead of the mobile web view.", sentiment: "NEUTRAL", theme: "Mobile Experience" },
  { content: "Prospect wants SSO before they'll sign — third time this month.", sentiment: "NEGATIVE", theme: "Enterprise & Security" },
  { content: "Asked again about SOC 2 compliance docs, blocking their procurement.", sentiment: "NEUTRAL", theme: "Enterprise & Security" },
  { content: "Security review passed easily, our compliance team was impressed.", sentiment: "POSITIVE", theme: "Enterprise & Security" },
  { content: "Love the new export feature, saved me an hour today.", sentiment: "POSITIVE", theme: "Exports & Integrations" },
  { content: "Billing page keeps timing out when I try to download an invoice.", sentiment: "NEGATIVE", theme: "Billing" },
  { content: "Invoice history is confusing, can't tell which plan I'm on.", sentiment: "NEGATIVE", theme: "Billing" },
  { content: "Upgrading plans was surprisingly painless.", sentiment: "POSITIVE", theme: "Billing" },
  { content: "CSV export doesn't include the custom fields we set up.", sentiment: "NEGATIVE", theme: "Exports & Integrations" },
  { content: "Zapier integration works great, connected it to our CRM in minutes.", sentiment: "POSITIVE", theme: "Exports & Integrations" },
  { content: "Support team resolved my ticket within the hour, really impressed.", sentiment: "POSITIVE", theme: "Customer Support" },
  { content: "Been waiting three days for a reply on a critical bug.", sentiment: "NEGATIVE", theme: "Customer Support" },
  { content: "Support chat is helpful but hard to find on the site.", sentiment: "NEUTRAL", theme: "Customer Support" },
  { content: "Search doesn't return results for partial matches, very frustrating.", sentiment: "NEGATIVE", theme: "Search & Filtering" },
  { content: "Filtering by date range is exactly what I needed, works great.", sentiment: "POSITIVE", theme: "Search & Filtering" },
  { content: "Would be great if search understood typos.", sentiment: "NEUTRAL", theme: "Search & Filtering" },
  { content: "Notifications are too noisy, I get pinged for everything.", sentiment: "NEGATIVE", theme: "Notifications" },
  { content: "Weekly digest email is a nice touch, keeps me in the loop.", sentiment: "POSITIVE", theme: "Notifications" },
  { content: "Can we get Slack notifications instead of email only?", sentiment: "NEUTRAL", theme: "Notifications" },
  { content: "Team permissions are exactly granular enough for our org.", sentiment: "POSITIVE", theme: "Permissions & Roles" },
  { content: "Wish viewers could comment without needing analyst access.", sentiment: "NEUTRAL", theme: "Permissions & Roles" },
  { content: "Accidentally gave a contractor admin rights — the UI made it too easy.", sentiment: "NEGATIVE", theme: "Permissions & Roles" },
];

function randomDateWithinDays(days: number) {
  const now = Date.now();
  const past = now - Math.random() * days * 24 * 60 * 60 * 1000;
  return new Date(past);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log("Seeding demo workspace...");

  const workspace = await prisma.workspace.upsert({
    where: { id: "demo-workspace" },
    update: {},
    create: { id: "demo-workspace", name: "Acme Corp (Demo)" },
  });

  const passwordHash = await bcrypt.hash("Demo1234!", 10);

  // Three distinct accounts requested by user
  const users: { name: string; email: string; role: string }[] = [
    { name: "MS Sir", email: "admin@demo.loop", role: "ADMIN" },
    { name: "DK Rawat", email: "analyst@demo.loop", role: "ANALYST" },
    { name: "DN Jha", email: "viewer@demo.loop", role: "VIEWER" },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role },
      create: { ...u, passwordHash, workspaceId: workspace.id },
    });
  }

  const themeNames = [...new Set(FEEDBACK_BANK.map((f) => f.theme))];
  const themeMap = new Map<string, string>();
  const palette = ["#7C3AED", "#EF4444", "#A855F7", "#B91C1C", "#8B5CF6", "#F43F5E", "#D946EF", "#EAB308"];

  for (let i = 0; i < themeNames.length; i++) {
    const theme = await prisma.theme.upsert({
      where: { workspaceId_name: { workspaceId: workspace.id, name: themeNames[i] } },
      update: {},
      create: { name: themeNames[i], workspaceId: workspace.id, color: palette[i % palette.length] },
    });
    themeMap.set(themeNames[i], theme.id);
  }

  // Clear old feedback
  await prisma.feedback.deleteMany({ where: { workspaceId: workspace.id } });

  const TOTAL_ITEMS = 130;
  for (let i = 0; i < TOTAL_ITEMS; i++) {
    const template = pick(FEEDBACK_BANK);
    const score = template.sentiment === "POSITIVE" ? 0.5 + Math.random() * 0.5
      : template.sentiment === "NEGATIVE" ? -0.5 - Math.random() * 0.5
      : -0.15 + Math.random() * 0.3;

    const feedback = await prisma.feedback.create({
      data: {
        content: template.content,
        channel: pick(CHANNELS),
        customerLabel: pick(CUSTOMER_NAMES),
        sentiment: template.sentiment,
        sentimentScore: Number(score.toFixed(2)),
        featureArea: template.theme,
        status: pick(["NEW", "NEW", "REVIEWED", "ACTIONED"]),
        createdAt: randomDateWithinDays(60),
        workspaceId: workspace.id,
      },
    });

    const themeId = themeMap.get(template.theme)!;
    await prisma.feedbackTheme.create({
      data: { feedbackId: feedback.id, themeId, confidence: Number((0.7 + Math.random() * 0.3).toFixed(2)) },
    });
  }

  console.log(`Seeded workspace "${workspace.name}" with 3 accounts and ${TOTAL_ITEMS} feedback items.`);
  console.log("Accounts (password: Demo1234!):");
  users.forEach((u) => console.log(`  ${u.name.padEnd(12)} (${u.role}) ${u.email}`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
