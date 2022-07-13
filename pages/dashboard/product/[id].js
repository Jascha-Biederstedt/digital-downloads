import { useState } from 'react';

import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession, getSession } from 'next-auth/react';

import prisma from 'lib/prisma';
import { getProduct } from 'lib/data';

import Heading from 'components/Heading';
import Spinner from 'components/Spinner';

export const getServerSideProps = async context => {
  const session = await getSession(context);

  if (!session) return { props: {} };

  let product = await getProduct(context.params.id, prisma);
  product = JSON.parse(JSON.stringify(product));

  if (!product) return { props: {} };

  if (session.user.id !== product.author.id) return { props: {} };

  return {
    props: {
      product,
    },
  };
};

const Product = ({ product }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (!product) {
    return null;
  }

  const [title, setTitle] = useState(product.title);
  const [image, setImage] = useState(null);
  const [newproduct, setNewproduct] = useState(null);
  const [imageUrl, setImageUrl] = useState(product.image);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(product.price / 100);
  const [free, setFree] = useState(product.free);
  const [changedLink, setChangedLink] = useState(false);

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

      <div className='flex justify-center'>
        <form
          className='mt-10'
          onSubmit={async e => {
            e.preventDefault();

            const body = new FormData();
            body.append('id', product.id);
            body.append('image', image);
            body.append('product', newproduct);
            body.append('title', title);
            body.append('free', free);
            body.append('price', price);
            body.append('description', description);

            await fetch('/api/edit', {
              method: 'POST',
              body,
            });

            router.push('/dashboard');
          }}
        >
          <div className='flex-1 mb-5'>
            <div className='flex-1 mb-2'>Product title (required)</div>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className='border p-1 text-black mb-4'
              required
            />
            <div className='relative flex items-start mt-2 mb-3'>
              <div className='flex items-center h-5'>
                <input
                  type='checkbox'
                  checked={free}
                  onChange={e => setFree(!free)}
                />
              </div>
              <div className='ml-3 text-sm'>
                <label>Check if the product is free</label>
              </div>
            </div>
            {!free && (
              <>
                <div className='flex-1 mb-2'>Product price in $ (required)</div>
                <input
                  value={price}
                  pattern='^\d*(\.\d{0,2})?$'
                  onChange={e => setPrice(e.target.value)}
                  className='border p-1 text-black mb-4'
                  required
                />
              </>
            )}
            <div className='flex-1 mb-2'>Description</div>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className='border p-1 text-black '
            />
          </div>

          <div className='text-sm text-gray-200 '>
            <label className='relative font-medium cursor-pointer  my-3 block'>
              <p className=''>Product image {image && '✅'}</p> (800 x 450
              suggested)
              <input
                type='file'
                accept='image/*'
                className='hidden'
                onChange={event => {
                  if (event.target.files && event.target.files[0]) {
                    if (event.target.files[0].size > 3072000) {
                      alert('Maximum size allowed is 3MB');
                      return false;
                    }
                    setImage(event.target.files[0]);
                    setImageUrl(URL.createObjectURL(event.target.files[0]));
                  }
                }}
              />
            </label>
            <img src={imageUrl} className='w-20 h-20' />
          </div>

          <div className='text-sm text-gray-200 '>
            <label className='relative font-medium cursor-pointer  my-3 block'>
              <p className=''>Product {product && 'changed ✅'}</p>
              <input
                type='file'
                className='hidden'
                onChange={event => {
                  if (event.target.files && event.target.files[0]) {
                    if (event.target.files[0].size > 20480000) {
                      alert('Maximum size allowed is 20MB');
                      return false;
                    }
                    setNewproduct(event.target.files[0]);
                    setChangedLink(true);
                  }
                }}
              />
            </label>
            {!changedLink && (
              <a className='underline' href={product.url}>
                Link
              </a>
            )}
          </div>
          <button
            disabled={title && (free || price) ? false : true}
            className={`border px-8 py-2 mt-10 font-bold  ${
              title && (free || price)
                ? ''
                : 'cursor-not-allowed text-gray-800 border-gray-800'
            }`}
          >
            Save changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default Product;
