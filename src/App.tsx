import { Wallet } from 'lucide-react';
import { useAuth } from './lib/AuthContext';
import { AuthScreen } from './components/Auth/AuthScreen';
import { Dashboard } from './Dashboard';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-14 h-14 bg-accent-purple rounded-2xl flex items-center justify-center text-white shadow-xl shadow-accent-purple/30 animate-pulse">
          <Wallet size={28} />
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return <Dashboard key={user.uid} user={user} />;
}
