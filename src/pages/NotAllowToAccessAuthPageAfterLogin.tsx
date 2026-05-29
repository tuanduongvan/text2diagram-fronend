import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts';

export const NotAllowToAccessAuthPageAfterLogin = () => {
  const { isAuth } = useAuthContext();
  const location = useLocation();
  const redirectTo = location.state?.to || '/';

  if (isAuth) {
    return <Navigate to={redirectTo} />;
  }

  return <Outlet />;
};
