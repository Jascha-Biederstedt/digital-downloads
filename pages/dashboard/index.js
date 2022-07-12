import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

import Heading from 'components/Heading';
import Spinner from 'components/Spinner';

const Dashboard = () => {
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
        <Link href={`/dashboard/new`}>
          <a className='text-xl border p-2'>Create a new product</a>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
