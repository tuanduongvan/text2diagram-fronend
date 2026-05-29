import { Button } from '@/components/ui/button';
import { ModeToggle } from './ModeToggle';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UserItem } from './UserItem';
import { Logo } from './Logo';
import { useAuthContext } from '@/contexts';

export default function Header() {
  const { pathname } = useLocation();
  const { user, isAuth } = useAuthContext();
  const navigate = useNavigate();

  const authButtonLink = pathname === '/login' ? '/register' : '/login';
  const authButtonText = pathname === '/login' ? 'Register' : 'Log in';

  const handleNavigateToPrompt = () => {
    navigate('/login', { state: { to: '/prompt' } });
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-[#e5e8e8] dark:bg-[#2A2A2A] dark:text-white shadow-md transition-colors">
      <div className="flex items-center gap-2">
        <Link to="/">
          <Logo />
        </Link>
      </div>
      <div className="flex-1" />
      <div className="flex gap-1 md:gap-4">
        {!isAuth ? (
          <>
            <Button variant="default" onClick={handleNavigateToPrompt}>
              Try Tex2Dia
            </Button>
            <Link to={authButtonLink}>
              <Button variant="outline">{authButtonText}</Button>
            </Link>
          </>
        ) : (
          <>
            <Button variant="default" onClick={() => navigate('/prompt')}>
              Enter Tex2Dia
            </Button>
            <UserItem
              email={user?.email || ''}
              name={user?.displayName || 'User'}
            />
          </>
        )}
        <ModeToggle />
      </div>
    </header>
  );
}
