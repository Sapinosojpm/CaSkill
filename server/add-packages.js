const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.pointPackage.createMany({
    data: [
      {
        name: "Pro Player Bundle",
        description: "Perfect for daily grinders needing a heavy point buffer.",
        pointsAmount: 1500,
        priceCents: 3999,
        currency: "usd",
        sortOrder: 4,
      },
      {
        name: "Elite Stash",
        description: "A premium stockpile for serious competitors and leaderboard climbers.",
        pointsAmount: 3000,
        priceCents: 6999,
        currency: "usd",
        sortOrder: 5,
      },
      {
        name: "Whale Chest",
        description: "The ultimate bankroll for relentless high-stakes matches.",
        pointsAmount: 10000,
        priceCents: 19999,
        currency: "usd",
        sortOrder: 6,
      },
    ],
  });
  console.log("New point packages added successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
