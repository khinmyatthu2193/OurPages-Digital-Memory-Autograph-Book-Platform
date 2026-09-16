import PagePlaceholder from '../components/PagePlaceholder.jsx';
import { useAuth } from '../auth/auth-context.js';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  return (
    <PagePlaceholder eyebrow="Private owner area" title="Dashboard">
      Signed in as {user.email}.{' '}
      <button className="underline" type="button" onClick={() => logout()}>
        Log out
      </button>
    </PagePlaceholder>
  );
}
