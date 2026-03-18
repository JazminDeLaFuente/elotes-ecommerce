import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type OrderRequestItem = {
  id: string;
  quantity: number;
};

type CheckoutCustomer = {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
};

const GUEST_USER_EMAIL = "invitado@elotesdelafuente.local";

const isValidOrderItem = (item: unknown): item is OrderRequestItem => {
  if (typeof item !== "object" || item === null) {
    return false;
  }

  const candidate = item as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    candidate.id.trim().length > 0 &&
    typeof candidate.quantity === "number" &&
    Number.isInteger(candidate.quantity) &&
    candidate.quantity > 0
  );
};

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: {
        id: "desc",
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(orders);
  } catch {
    return NextResponse.json(
      { error: "No se pudieron cargar los pedidos." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawItems = body?.items;
    const customer = body?.customer as Partial<CheckoutCustomer> | undefined;

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json(
        { error: "No hay productos para procesar la compra." },
        { status: 400 }
      );
    }

    if (
      !customer ||
      typeof customer.name !== "string" ||
      typeof customer.email !== "string" ||
      typeof customer.phone !== "string" ||
      typeof customer.address !== "string"
    ) {
      return NextResponse.json(
        { error: "Faltan datos del cliente para completar la compra." },
        { status: 400 }
      );
    }

    const items = rawItems.filter(isValidOrderItem);
    const customerName = customer.name.trim();
    const customerEmail = customer.email.trim().toLowerCase();
    const customerPhone = customer.phone.trim();
    const deliveryAddress = customer.address.trim();
    const deliveryNotes =
      typeof customer.notes === "string" ? customer.notes.trim() : "";

    if (items.length !== rawItems.length) {
      return NextResponse.json(
        { error: "El carrito contiene datos invalidos." },
        { status: 400 }
      );
    }

    if (!customerName || !customerEmail || !customerPhone || !deliveryAddress) {
      return NextResponse.json(
        { error: "Nombre, correo, telefono y direccion son obligatorios." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(customerEmail)) {
      return NextResponse.json(
        { error: "Ingresa un correo valido." },
        { status: 400 }
      );
    }

    const groupedItems = items.reduce<Map<string, number>>((acc, item) => {
      const currentQuantity = acc.get(item.id) ?? 0;
      acc.set(item.id, currentQuantity + item.quantity);
      return acc;
    }, new Map());

    const productIds = [...groupedItems.keys()];

    const order = await prisma.$transaction(async (tx) => {
      const guestUser = await tx.user.upsert({
        where: {
          email: GUEST_USER_EMAIL,
        },
        update: {},
        create: {
          email: GUEST_USER_EMAIL,
          name: "Cliente invitado",
          password: "guest-checkout",
        },
      });

      const products = await tx.product.findMany({
        where: {
          id: {
            in: productIds,
          },
        },
      });

      if (products.length !== productIds.length) {
        throw new Error("Algunos productos ya no estan disponibles.");
      }

      for (const product of products) {
        const requestedQuantity = groupedItems.get(product.id) ?? 0;

        if (product.stock < requestedQuantity) {
          throw new Error(`No hay suficiente stock para ${product.name}.`);
        }
      }

      for (const product of products) {
        const requestedQuantity = groupedItems.get(product.id) ?? 0;
        const updatedProduct = await tx.product.updateMany({
          where: {
            id: product.id,
            stock: {
              gte: requestedQuantity,
            },
          },
          data: {
            stock: {
              decrement: requestedQuantity,
            },
          },
        });

        if (updatedProduct.count === 0) {
          throw new Error(`El stock de ${product.name} cambio antes de confirmar tu compra.`);
        }
      }

      const total = products.reduce((sum, product) => {
        const requestedQuantity = groupedItems.get(product.id) ?? 0;
        return sum + product.price * requestedQuantity;
      }, 0);

      return tx.order.create({
        data: {
          userId: guestUser.id,
          status: "CONFIRMED",
          total,
          customerName,
          customerEmail,
          customerPhone,
          deliveryAddress,
          deliveryNotes: deliveryNotes || null,
          items: {
            create: products.map((product) => ({
              productId: product.id,
              quantity: groupedItems.get(product.id) ?? 0,
              price: product.price,
            })),
          },
        },
        include: {
          items: true,
        },
      });
    });

    return NextResponse.json(
      {
        message: "Compra registrada correctamente.",
        orderId: order.id,
        total: order.total,
      },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo completar la compra.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
