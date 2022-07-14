import { getSession } from 'next-auth/react';

import prisma from 'lib/prisma';

export default async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const session = await getSession({ req });
  if (!session) return res.status(401).json({ message: 'Not logged in' });
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) return res.status(401).json({ message: 'User not found' });
  const product = await prisma.product.findUnique({
    where: {
      id: req.body.product_id,
    },
  });

  if (!product.free) {
    return res.status(401).json({ message: 'Product not free' });
  }

  await prisma.purchase.create({
    data: {
      amount: 0,
      paid: true,
      author: {
        connect: { id: user.id },
      },
      product: {
        connect: { id: req.body.product_id },
      },
    },
  });

  res.end();
};
