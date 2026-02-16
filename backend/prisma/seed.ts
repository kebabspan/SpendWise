import { PrismaClient } from '@prisma/client';

async function main() {
  console.log('--- SEEDELÉS INDÍTÁSA ---');

  // Itt adjuk meg explicit módon a URL-t, így a Prisma nem fog panaszkodni
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  try {
    const user = await prisma.user.findFirst();

    if (!user) {
      console.log('Hiba: Nem találtam felhasználót! Hozz létre egyet a Prisma Studio-ban (http://localhost:5555).');
      return;
    }

    console.log(`Felhasználó megtalálva: ${user.email}`);

    const categories = [
      { name: 'Élelmiszer', type: 'EXPENSE' },
      { name: 'Lakbér', type: 'EXPENSE' },
      { name: 'Fizetés', type: 'INCOME' },
      { name: 'Szórakozás', type: 'EXPENSE' },
      { name: 'Rezsi', type: 'EXPENSE' },
      { name: 'Utazás', type: 'EXPENSE' }
    ];

    for (const cat of categories) {
      await prisma.category.upsert({
        where: {
          userId_name_type: { 
            userId: user.id,
            name: cat.name,
            type: cat.type as any
          },
        },
        update: {},
        create: {
          name: cat.name,
          type: cat.type as any,
          userId: user.id,
        },
      });
    }

    console.log('--- SEEDELÉS SIKERESEN BEFEJEZŐDÖTT ---');
  } catch (error) {
    console.error('Hiba a seedelés során:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();