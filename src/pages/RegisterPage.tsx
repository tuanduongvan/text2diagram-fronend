import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterSchemaType } from '@/validations';
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
import { Eye, EyeOff } from 'lucide-react';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuthContext();
  const form = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const emailValue = form.watch('email');
  const passwordValue = form.watch('password');
  const confirmValue = form.watch('confirmPassword');
  const isDisabled =
    !emailValue ||
    !passwordValue ||
    !confirmValue ||
    form.formState.isSubmitting;

  const onSubmit = async (data: RegisterSchemaType) => {
    try {
      await registerUser(data);
      toast.success(
        'Registration successful! Please check your email for confirmation',
        { duration: 3000 }
      );
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      const error = err as AuthError;
      switch (error.code) {
        case 'auth/email-already-in-use':
          handleError(new CustomError('Email already exists', 400));
          break;
        case 'auth/invalid-email':
          handleError(new CustomError('Email is not valid', 400));
          break;
        case 'auth/invalid-password':
          handleError(new CustomError('Password is not valid', 400));
          break;
        default:
          handleError(new CustomError(error.message, error.code));
          break;
      }
    }
  };

  return (
    <div className="flex min-h-screen gap-2 md:gap-6 items-center justify-center bg-gray-100 dark:bg-[#1F1F1F] p-4">
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

      <Card className="w-full max-w-md bg-white dark:bg-black">
        <CardHeader className="flex flex-col items-center">
          <Link to="../" className="flex flex-row items-center">
            <Logo />
          </Link>
          <Separator />
          <CardTitle className="h3-bold md:h2-bold pt-1 sm:pt-4">
            Create a new account
          </CardTitle>
          <CardContent className="text-semibold small-medium md:base-regular mt-2 text-center">
            To use Tex2Dia, please enter your details
          </CardContent>
        </CardHeader>

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

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800 dark:text-white">
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Confirm your password"
                          type={showConfirm ? 'text' : 'password'}
                          {...field}
                          className="pr-10 bg-white dark:bg-[#1F1F1F] text-gray-800 dark:text-white"
                        />
                        {field.value && (
                          <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute inset-y-0 right-3 flex items-center"
                          >
                            {showConfirm ? (
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

              <Button
                type="submit"
                disabled={isDisabled}
                className={`w-full ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {form.formState.isSubmitting ? (
                  <>
                    Submitting <LoadingSpinner className="h-4 w-4" />
                  </>
                ) : (
                  'Register'
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-800 dark:text-white">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-500 hover:underline">
                Login
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
    </div>
  );
}
