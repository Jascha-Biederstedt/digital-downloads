import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, getSession } from 'next-auth/react';

import prisma from 'lib/prisma';
import { getProducts, getPurchases } from 'lib/data';

import Heading from 'components/Heading';
import Spinner from 'components/Spinner';

export const getServerSideProps = async context => {
  const session = await getSession(context);
  if (!session) return { props: {} };

  let products = await getProducts(
    { author: session.user.id, includePurchases: true },
    prisma
  );
  products = JSON.parse(JSON.stringify(products));

  let purchases = await getPurchases({ author: session.user.id }, prisma);
  purchases = JSON.parse(JSON.stringify(purchases));

  return {
    props: {
      products,
      purchases,
    },
  };
};

const Dashboard = ({ products, purchases }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const loading = status === 'loading';

  if (loading) return <Spinner />;

  if (!session) {
    router.push('/');
  }

  if (session && !session.user.name) {
    router.push('/setup');
  }

  return (
    <div>
      <Head>
        <title>Digital Downloads</title>
        <meta name='description' content='Digital Downloads Website' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Heading />

      <h1 className='flex justify-center mt-20 text-xl'>Dashboard</h1>

      <div className='flex justify-center mt-10'>
        {products.length > 0 && (
          <div className='flex flex-col w-full '>
            <h2 className='text-center text-xl mb-4'>Products</h2>

            {products.map((product, index) => (
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
                  <div className=''>
                    <Link href={`/dashboard/product/${product.id}`}>
                      <a className='text-sm border p-2 font-bold uppercase'>
                        Edit
                      </a>
                    </Link>
                    <Link href={`/product/${product.id}`}>
                      <a className='text-sm border p-2 font-bold uppercase ml-2'>
                        View
                      </a>
                    </Link>
                  </div>
                  {product.purchases && product.purchases.length > 0 && (
                    <p className='mt-3 text-right'>
                      {product.purchases.length} sales
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {purchases.length > 0 && (
          <div className='flex flex-col w-full'>
            <h2 className='text-center text-xl mb-4'>Purchases</h2>
            {purchases.map((purchase, index) => (
              <div
                className='border flex justify-between w-full md:w-2/3 xl:w-1/3 mx-auto px-4 my-2 py-5 '
                key={index}
              >
                {purchase.product.image && (
                  <img
                    src={purchase.product.image}
                    className='w-14 h-14 flex-initial'
                  />
                )}
                <div className='flex-1 ml-3'>
                  <p>{purchase.product.title}</p>
                  {parseInt(purchase.amount) === 0 ? (
                    <span className='bg-white text-black px-1 uppercase font-bold'>
                      free
                    </span>
                  ) : (
                    <p>${purchase.amount / 100}</p>
                  )}
                </div>
                <div className=''>
                  <a
                    href={purchase.product.url}
                    className='text-sm border p-2 font-bold uppercase'
                  >
                    Get files
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
