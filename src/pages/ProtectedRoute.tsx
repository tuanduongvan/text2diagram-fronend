import { Link, Outlet } from 'react-router-dom';
import { useAuthContext } from '../contexts';
import { Button } from '@/components/ui/button';
import { ErrorDarkImage, ErrorImage } from '@/assets';

export const ProtectedRoute = () => {
  const { isAuth } = useAuthContext();

  if (!isAuth) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-black p-4">
        <div className="relative hidden md:block w-[300px] h-[230px] sm:w-[350px] sm:h-[280px] md:h-[320px] md:w-[400px]">
          <img
            src={ErrorImage}
            alt="Access Denied"
            className="object-contain dark:hidden"
          />
          <img
            src={ErrorDarkImage}
            alt="Access Denied"
            className="object-contain hidden dark:block"
          />
        </div>
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          Oops! You are not logged in.
        </h1>
        <p className="text-gray-700 dark:text-gray-300 mb-6 text-center">
          Please log in to access this page.
        </p>

        <Link to="/login">
          <Button variant="default">Go to Login</Button>
        </Link>
      </div>
    );
  }

  return <Outlet />;
};
