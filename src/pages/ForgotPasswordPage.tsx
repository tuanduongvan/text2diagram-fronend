import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ForgotPasswordSchemaType, forgotPasswordSchema } from '@/validations';
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
import { Link } from 'react-router-dom';
import { useAuthContext } from '@/contexts';
import { Logo } from '@/components/Logo';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/Spinner';
import { ErrorDarkImage, ErrorImage } from '@/assets';

export const ForgotPasswordPage = () => {
  const { forgotPassword } = useAuthContext();
  const form = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = async (data: ForgotPasswordSchemaType) => {
    try {
      await forgotPassword(data.email);
      toast.success('Send to your email successfully!');
    } catch (error) {
      toast.error('Send to your emailunsuccessfully!');
      console.log(error);
    }
  };

  const emailValue = form.watch('email');
  const isDisabled = !emailValue || form.formState.isSubmitting;

  return (
    <div className="flex gap-2 md:gap-6 min-h-screen items-center justify-center p-4">
      <div className="relative hidden md:block w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] md:h-[400px] md:w-[400px]">
        <img
          src="./src/assets/empty.png"
          className="object-contain dark:hidden"
          alt="Empty"
        />
        <img
          src="./src/assets/empty-dark.png"
          className="object-contain hidden dark:block"
          alt="Empty"
        />
      </div>
      <Card className="w-full max-w-md bg-white dark:bg-black">
        <CardHeader className="flex flex-col items-center">
          <Link className="flex flex-row items-center" to="../">
            <Logo />
          </Link>
          <Separator />
          <CardTitle className="h3-bold md:h2-bold pt-1 sm:pt-4">
            Forgot your password?
          </CardTitle>
          <CardContent className="text-light-3 small-medium md:base-regular mt-2">
            Please enter your valid email.
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your email"
                        {...field}
                        className="bg-white text-gray-800"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className={`w-full ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    Submitting <LoadingSpinner className="h-4 w-4" />
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="relative hidden md:block w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] md:h-[400px] md:w-[400px]">
        <img
          src={ErrorImage}
          className="object-contain dark:hidden"
          alt="Error"
        />
        <img
          src={ErrorDarkImage}
          className="object-contain hidden dark:block"
          alt="Error"
        />
      </div>
    </div>
  );
};
