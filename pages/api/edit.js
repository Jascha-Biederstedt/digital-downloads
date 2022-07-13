import { getSession } from 'next-auth/react';
import nextConnect from 'next-connect';

import middleware from 'middleware/middleware';
import prisma from 'lib/prisma';
import { upload } from 'lib/upload';

const handler = nextConnect();
handler.use(middleware);

handler.post(async (req, res) => {
  const session = await getSession({ req });
  if (!session) return res.status(401).json({ message: 'Not logged in' });
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) return res.status(401).json({ message: 'User not found' });

  //check if current user is not same as product author
  const product = await prisma.product.findUnique({
    where: {
      id: req.body.id[0],
    },
    include: {
      author: true,
    },
  });

  if (product.author.id !== user.id) {
    return res.status(401).json({ message: 'User not owner of product' });
  }

  const { title, description, free, price } = req.body;

  await prisma.product.update({
    data: {
      title: title[0],
      description: description[0],
      free: free[0] === 'true' ? true : false,
      price: price[0] * 100,
    },
    where: {
      id: product.id,
    },
  });

  let image_url = null;
  let product_url = null;

  if (req.files.image) {
    image_url = await upload({
      file: req.files.image[0],
      user_id: user.id,
    });
  }

  if (req.files.product) {
    product_url = await upload({
      file: req.files.product[0],
      user_id: user.id,
    });
  }

  const data = {};

  if (product_url) {
    data.url = product_url;
  }

  if (image_url) {
    data.image = image_url;
  }

  await prisma.product.update({
    where: { id: product.id },
    data,
  });

  res.end();
  return;
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
