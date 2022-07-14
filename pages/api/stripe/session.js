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

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const stripe_session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        name: 'Purchase product ' + req.body.title,
        amount: req.body.amount,
        currency: 'usd',
        quantity: 1,
      },
    ],
    success_url: process.env.BASE_URL + '/dashboard',
    cancel_url: process.env.BASE_URL + '/dashboard',
  });

  await prisma.purchase.create({
    data: {
      amount: req.body.amount,
      sessionId: stripe_session.id,
      author: {
        connect: { id: user.id },
      },
      product: {
        connect: { id: req.body.product_id },
      },
    },
  });

  res.writeHead(200, {
    'Content-Type': 'application/json',
  });

  res.end(
    JSON.stringify({
      status: 'success',
      sessionId: stripe_session.id,
      stripePublicKey: process.env.STRIPE_PUBLIC_KEY,
    })
  );
};
