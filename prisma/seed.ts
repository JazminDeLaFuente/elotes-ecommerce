import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    name: "Elote Clasico",
    price: 45,
    stock: 20,
    description: "Elote entero con mayonesa, queso fresco y chile en polvo.",
    image: "🌽",
  },
  {
    name: "Esquite Especial",
    price: 55,
    stock: 18,
    description: "Vaso de granos de elote con mantequilla, crema, queso y limon.",
    image: "🥣",
  },
  {
    name: "Elote Flamin",
    price: 65,
    stock: 14,
    description: "Elote preparado con queso, mayonesa y topping crujiente picante.",
    image: "🔥",
  },
  {
    name: "Maruchan con Elote",
    price: 80,
    stock: 10,
    description: "Combinacion antojable de maruchan preparada con elote y salsas.",
    image: "🍜",
  },
  {
    name: "Tostitos Locos",
    price: 75,
    stock: 12,
    description: "Botana con cueritos, pepino, cacahuates, elote y salsas caseras.",
    image: "🧂",
  },
  {
    name: "Nachos con Queso",
    price: 70,
    stock: 15,
    description: "Nachos con queso caliente, jalapeno y opcion de elote preparado.",
    image: "🧀",
  },
];

async function main() {
  await prisma.product.deleteMany();

  await prisma.product.createMany({
    data: products,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
