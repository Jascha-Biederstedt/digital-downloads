export const getProducts = async (options, prisma) => {
  const data = {
    where: {},
    orderBy: [
      {
        createdAt: 'desc',
      },
    ],
  };

  if (options.author) {
    data.where.author = {
      id: options.author,
    };
  }

  if (options.includePurchases) {
    data.include = {
      purchases: true,
    };
  }

  if (options.take) {
    data.take = options.take;
  }

  const products = await prisma.product.findMany(data);

  return products;
};

export const getProduct = async (id, prisma) => {
  const product = await prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      author: true,
    },
  });

  return product;
};

export const getUser = async (id, prisma) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  return user;
};

export const getPurchases = async (options, prisma) => {
  const data = {
    where: { paid: true },
    orderBy: [
      {
        createdAt: 'desc',
      },
    ],
    include: {
      product: true,
    },
  };

  if (options.author) {
    data.where.author = {
      id: options.author,
    };
  }

  const purchases = await prisma.purchase.findMany(data);

  return purchases;
};

export const alreadyPurchased = async (options, prisma) => {
  const purchases = await prisma.purchase.findMany({
    where: {
      product: {
        id: options.product,
      },
      author: {
        id: options.author,
      },
      paid: true,
    },
    include: {
      author: true,
      product: true,
    },
  });

  if (purchases.length > 0) return true;

  return false;
};

export const getSales = async (options, prisma) => {
  const user = await prisma.user.findUnique({
    where: {
      id: options.author,
    },
    include: { products: true },
  });

  const purchases = await prisma.purchase.findMany({
    where: {
      paid: true,
      productId: {
        in: user.products.map(product => product.id),
      },
    },
    include: {
      product: true,
      author: true,
    },
  });

  return purchases;
};
