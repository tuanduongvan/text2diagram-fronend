import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, ResetPasswordSchemaType } from '@/validations';
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

export const ResetPasswordPage = () => {
  const { changePassword } = useAuthContext();
  const form = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmNewPassword: ''
    }
  });

  const onSubmit = async (data: ResetPasswordSchemaType) => {
    try {
      await changePassword(data.newPassword);
      toast.success('Change password successfully!');
    } catch (error) {
      toast.error('Failed to change password');
      console.log(error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white dark:bg-black">
        <CardHeader className="flex flex-col items-center">
          <Link className="flex flex-row items-center" to="../">
            <Logo />
          </Link>
          <Separator />
          <CardTitle className="h3-bold md:h2-bold pt-1 sm:pt-4">
            Reset your password
          </CardTitle>
          <CardContent className="text-semibold small-medium md:base-regular mt-2 text-center">
            Your account will be reset with your new password
          </CardContent>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800 dark:text-white">
                      New Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter new password"
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
                name="confirmNewPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800 dark:text-white">
                      Confirm New Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm new password"
                        {...field}
                        className="bg-white dark:bg-[#1F1F1F] text-gray-800 dark:text-white"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    Submitting <LoadingSpinner className="h-4 w-4" />
                  </>
                ) : (
                  'Change Password'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
