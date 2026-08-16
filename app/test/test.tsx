import { prisma } from "../lib/prisma";

export default async function TestPage() {
  console.log(prisma);

  return <div>Test</div>;
}