import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FcGoogle } from 'react-icons/fc';
import { Eye, EyeOff } from 'lucide-react';
import { loginSchema, LoginSchemaType } from '@/validations';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts';
import { Logo } from '@/components/Logo';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/Spinner';
import {
  DocumentsDarkImage,
  DocumentsImage,
  ReadingDarkImage,
  ReadingImage
} from '@/assets';
import { AuthError } from 'firebase/auth';
import { CustomError, handleError } from '@/utils';

export function LoginPage() {
  const { login, loginWithGoogle } = useAuthContext();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const emailValue = form.watch('email');
  const passwordValue = form.watch('password');
  const isButtonDisabled =
    !emailValue || !passwordValue || form.formState.isSubmitting;

  const onSubmit = async (data: LoginSchemaType) => {
    try {
      await login(data);
      toast.success('Log in successfully!');
      navigate('/');
    } catch (err) {
      const error = err as AuthError;
      if (error.code === 'auth/invalid-credential') {
        handleError(new CustomError('Email or password is incorrect', 400));
      } else {
        handleError(new CustomError(error.message, error.code));
      }
    }
  };

  const handleLoginGoogle = async () => {
    try {
      await loginWithGoogle();
      toast.success('Login successfully');
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err) {
      const error = err as AuthError;
      handleError(new CustomError(error.message, error.code));
    }
  };

  return (
    <div className="flex min-h-screen gap-2 md:gap-6 items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white dark:bg-black">
        <CardHeader className="flex flex-col items-center">
          <Link to="../" className="flex flex-row items-center">
            <Logo />
          </Link>
          <Separator />
          <CardTitle className="h3-bold md:h2-bold pt-1 sm:pt-4">
            Log in to your account
          </CardTitle>
          <CardContent className="text-light-3 small-medium md:base-regular mt-2 text-center">
            Welcome back! Please enter your details.
          </CardContent>
        </CardHeader>

        <CardContent className="flex flex-col items-center">
          <Button
            onClick={handleLoginGoogle}
            className="w-full flex items-center justify-center space-x-2 bg-white dark:bg-[#1F1F1F] border border-gray-300 dark:border-[#CCCCCC] text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#555555]"
          >
            <FcGoogle size={20} />
            <span>Continue with Google</span>
          </Button>
        </CardContent>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800 dark:text-white">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your email"
                        {...field}
                        className="bg-white dark:bg-[#1F1F1F] text-gray-800 dark:text-white"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800 dark:text-white">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Enter your password"
                          type={showPassword ? 'text' : 'password'}
                          {...field}
                          className="pr-10 bg-white dark:bg-[#1F1F1F] text-gray-800 dark:text-white"
                        />
                        {field.value && (
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-3 flex items-center"
                          >
                            {showPassword ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />

              <div className="flex justify-between items-center">
                <Button
                  type="submit"
                  disabled={isButtonDisabled}
                  className={`w-full ${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      Submitting <LoadingSpinner className="h-4 w-4" />
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </div>
            </form>
          </Form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-800 dark:text-white">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-500 hover:underline">
                Register
              </Link>
            </p>
            <p className="mt-2 text-sm text-gray-800 dark:text-white">
              Forgot your password?{' '}
              <Link
                to="/forgot-password"
                className="text-blue-500 hover:underline"
              >
                Reset it here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col items-center justify-center max-w-5xl">
        <div className="flex items-center">
          <div className="relative hidden md:block w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] md:h-[400px] md:w-[400px]">
            <img
              src={DocumentsImage}
              className="object-contain dark:hidden"
              alt="Documents"
            />
            <img
              src={DocumentsDarkImage}
              className="object-contain hidden dark:block"
              alt="Documents"
            />
          </div>
          <div className="relative h-[400px] w-[400px] hidden xl:block">
            <img
              src={ReadingImage}
              className="object-contain dark:hidden"
              alt="Reading"
            />
            <img
              src={ReadingDarkImage}
              className="object-contain hidden dark:block"
              alt="Reading"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
