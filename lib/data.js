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
