import Head from 'next/head';
import Link from 'next/link';
import { useSession, getSession } from 'next-auth/react';

import prisma from 'lib/prisma';
import { getProduct, alreadyPurchased } from 'lib/data';

import Heading from 'components/Heading';
import Spinner from 'components/Spinner';

export const getServerSideProps = async context => {
  const session = await getSession(context);

  let product = await getProduct(context.params.id, prisma);
  product = JSON.parse(JSON.stringify(product));

  let purchased = null;
  if (session) {
    purchased = await alreadyPurchased(
      { author: session.user.id, product: context.params.id },
      prisma
    );
  }

  return {
    props: {
      product,
      purchased,
    },
  };
};

const Product = ({ product, purchased }) => {
  const { data: session, status } = useSession();

  const loading = status === 'loading';

  if (loading) return <Spinner />;

  if (!product) {
    return null;
  }

  return (
    <div>
      <Head>
        <title>Digital Downloads</title>
        <meta name='description' content='Digital Downloads Website' />
        <link rel='icon' href='/favicon.ico' />
        <script src='https://js.stripe.com/v3/' async></script>
      </Head>

      <Heading />

      <div className='flex justify-center'>
        <div className='border flex flex-col w-full md:w-2/3 xl:w-1/3 mx-auto px-4 mt-10'>
          <div className='flex justify-between py-10'>
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
              {!session && <p>Login first</p>}
              {session && (
                <>
                  {purchased ? (
                    'Already purchased'
                  ) : (
                    <>
                      {session.user.id !== product.author.id ? (
                        <button
                          className='text-sm border p-2 font-bold uppercase'
                          onClick={async () => {
                            if (product.free) {
                              await fetch('/api/download', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  product_id: product.id,
                                }),
                              });

                              router.push('/dashboard');
                            } else {
                              const res = await fetch('/api/stripe/session', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  amount: product.price,
                                  title: product.title,
                                  product_id: product.id,
                                }),
                              });

                              const data = await res.json();

                              if (data.status === 'error') {
                                alert(data.message);
                                return;
                              }

                              const sessionId = data.sessionId;
                              const stripePublicKey = data.stripePublicKey;

                              const stripe = Stripe(stripePublicKey);
                              const { error } = await stripe.redirectToCheckout(
                                {
                                  sessionId,
                                }
                              );
                            }
                          }}
                        >
                          {product.free ? 'DOWNLOAD' : 'PURCHASE'}
                        </button>
                      ) : (
                        'Your product'
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
          <div className='mb-10'>{product.description}</div>
          <div className='mb-10'>
            Created by
            <Link href={`/profile/${product.author.id}`}>
              <a className='font-bold underline ml-1'>{product.author.name}</a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
