import Head from 'next/head';

import Heading from 'components/Heading';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Digital Downloads</title>
        <meta name='description' content='Digital Downloads' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Heading />

      <h1 className='flex justify-center mt-20 text-xl'>Welcome!</h1>
    </div>
  );
}
