import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export { }

async function main() {
    console.log('Checking Brands...')
    const brands = await prisma.brand.findMany()
    console.log('Brands:', brands.map(b => b.name))

    console.log('\nChecking "Titan" matches...')
    const titanWatches = await prisma.watch.findMany({
        where: {
            OR: [
                { name: { contains: 'Titan', mode: 'insensitive' } },
                { brand: { name: { contains: 'Titan', mode: 'insensitive' } } }
            ]
        },
        include: { brand: true }
    })
    console.log(`Found ${titanWatches.length} Titan watches.`)
    if (titanWatches.length > 0) {
        console.log('Sample:', titanWatches[0].name)
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
