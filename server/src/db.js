const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function getDefaultUser() {
  const email = process.env.DEFAULT_USER_EMAIL || "achyut@example.com";
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Default user not found. Run seed first.");
  return user;
}

module.exports = { prisma, getDefaultUser };
