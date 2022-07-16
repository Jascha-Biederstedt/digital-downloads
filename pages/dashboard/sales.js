import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession, getSession } from 'next-auth/react';

import prisma from 'lib/prisma';
import { getSales } from 'lib/data';

import Heading from 'components/Heading';
import Spinner from 'components/Spinner';

export const getServerSideProps = async context => {
  const session = await getSession(context);
  if (!session) return { props: {} };

  let sales = await getSales({ author: session.user.id }, prisma);
  sales = JSON.parse(JSON.stringify(sales));

  return {
    props: {
      sales,
    },
  };
};

const Sales = ({ sales }) => {
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

      <h1 className='flex justify-center mt-20 text-xl mb-10'>Sales</h1>
      <h3 className='flex justify-center mt-20 text-xl mb-10'>
        Total earned $
        {sales.reduce((accumulator, sale) => {
          return accumulator + parseFloat(sale.amount);
        }, 0) / 100}
      </h3>

      {sales.length > 0 && (
        <div className='flex flex-col w-full'>
          {sales.map((sale, index) => (
            <div
              className='border flex justify-between w-full md:w-2/3 xl:w-1/3 mx-auto px-4 my-2 py-5 '
              key={index}
            >
              {sale.product.image && (
                <img
                  src={sale.product.image}
                  className='w-14 h-14 flex-initial'
                />
              )}
              <div className='flex-1 ml-3'>
                <p>{sale.product.title}</p>
                {parseInt(sale.amount) === 0 ? (
                  <span className='bg-white text-black px-1 uppercase font-bold'>
                    free
                  </span>
                ) : (
                  <p>${sale.amount / 100}</p>
                )}
              </div>
              <div className=''>
                <p className='text-sm p-2 font-bold'>
                  {sale.author.name}
                  <br />
                  {sale.author.email}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sales;
