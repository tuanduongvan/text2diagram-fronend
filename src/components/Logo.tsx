import { LogoDarkImage, LogoImage } from '@/assets';

export const Logo = () => {
  return (
    <div className="sm:flex items-center gap-x-2">
      <img
        src={LogoImage}
        height="40"
        width="40"
        alt="Logo"
        className="dark:hidden"
      />
      <img
        src={LogoDarkImage}
        height="40"
        width="40"
        alt="Logo"
        className="hidden dark:block"
      />
      <p className="font-bold text-xl text-gray-800 dark:text-white hidden sm:block">
        Tex2Dia
      </p>
    </div>
  );
};
