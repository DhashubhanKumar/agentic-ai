import Hero from "@/components/home/Hero";
import BrandGrid from "@/components/home/BrandGrid";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const brands = await prisma.brand.findMany({
    take: 5,
    orderBy: { name: 'asc' }
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <BrandGrid brands={brands} />
    </div>
  );
}
