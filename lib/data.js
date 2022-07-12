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
