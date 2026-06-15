import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const RequireAuth = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();

  if (auth.status === 'loading') {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f8f5ef] px-4 text-center text-zinc-700">
        <div className="rounded-3xl border border-black/10 bg-white px-6 py-5 text-sm font-bold shadow-xl shadow-zinc-900/10">
          Opening your account...
        </div>
      </div>
    );
  }

  if (!auth.user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RequireAuth;
