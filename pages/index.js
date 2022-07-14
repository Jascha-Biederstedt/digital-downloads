import Head from 'next/head';
import Link from 'next/link';

import prisma from 'lib/prisma';
import { getProducts } from 'lib/data';

import Heading from 'components/Heading';

export const getServerSideProps = async context => {
  let products = await getProducts({ take: 3 }, prisma);
  products = JSON.parse(JSON.stringify(products));

  return {
    props: {
      products,
    },
  };
};

const Home = ({ products }) => {
  return (
    <div>
      <Head>
        <title>Digital Downloads</title>
        <meta name='description' content='Digital Downloads Website' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Heading />

      <h1 className='flex justify-center mt-20 text-xl'>
        Explore the most popular products
      </h1>

      <div className='flex justify-center mt-10'>
        <div className='flex flex-col w-full '>
          {products &&
            products.map((product, index) => (
              <div
                className='border flex justify-between w-full md:w-2/3 xl:w-1/3 mx-auto px-4 my-2 py-5 '
                key={index}
              >
                {product.image && (
                  <img src={product.image} className='w-14 h-14 flex-initial' />
                )}
                <div className='flex-1 ml-3'>
                  <p>{product.title}</p>
                  {product.free ? (
                    <span className='bg-white text-black px-1 uppercase font-bold'>
                      free
                    </span>
                  ) : (
                    <p>${product.price / 100}</p>
                  )}
                </div>
                <div className=''>
                  <Link href={`/product/${product.id}`}>
                    <a className='text-sm border p-2 font-bold uppercase ml-2'>
                      View
                    </a>
                  </Link>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
