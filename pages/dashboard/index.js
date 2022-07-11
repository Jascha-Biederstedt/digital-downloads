import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

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

  return <div></div>;
};

export default Dashboard;
