import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

export default function Footer() {
  return (
    <footer className="w-full border-t p-6 bg-white dark:bg-black text-black dark:text-white">
      <div className="flex items-center w-full p-6 z-50 dark:bg-black">
        <Logo />
        <div className="md:ml-auto w-full justify-between md:justify-end flex items-center gap-x-2 text-muted-foreground">
          <Link to="/privacypolicy">
            <Button variant="ghost" size="sm">
              Privacy Policy
            </Button>
          </Link>
          <Link to="/termsandconditions">
            <Button variant="ghost" size="sm">
              Terms & Conditions
            </Button>
          </Link>
        </div>
      </div>
      <Separator />
      <div className="text-center text-sm mt-6 pt-4 dark:border-gray-700 text-gray-700 dark:text-gray-300">
        © {new Date().getFullYear()} Tex2Dia, Inc.
      </div>
    </footer>
  );
}
