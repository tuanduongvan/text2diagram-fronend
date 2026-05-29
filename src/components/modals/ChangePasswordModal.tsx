import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { toast } from 'sonner';
import { useChangePassword } from '@/hooks/use-change-password';
import { Eye, EyeOff } from 'lucide-react';
import { changePasswordSchema, ChangePasswordSchemaType } from '@/validations';
import { cn } from '@/lib/utils';

export const ChangePasswordModal = () => {
  const changePassword = useChangePassword();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<ChangePasswordSchemaType>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    },
    mode: 'onChange'
  });

  useEffect(() => {
    if (changePassword.isOpen) {
      form.reset();
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    }
  }, [changePassword.isOpen, form]);

  const onSubmit = (data: ChangePasswordSchemaType) => {
    console.log('Updating password with:', data);
    toast.success('Update new password successfully');
    changePassword.onClose();
  };

  return (
    <Dialog open={changePassword.isOpen} onOpenChange={changePassword.onClose}>
      <DialogContent className="z-100000">
        <DialogHeader className="border-b pb-3">
          <h2 className="text-lg font-medium">Change Password</h2>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 space-y-4"
          >
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <div className="flex items-center border border-input rounded-md px-2 mt-1 bg-background">
                      <input
                        type={showCurrent ? 'text' : 'password'}
                        placeholder="Enter current password"
                        {...field}
                        className={cn(
                          'flex-1 h-10 border-0 bg-transparent p-2 text-sm',
                          'focus:outline-none focus:ring-0'
                        )}
                      />
                      {field.value && (
                        <button
                          type="button"
                          onClick={() => setShowCurrent((prev) => !prev)}
                          className="p-2 text-sm text-foreground hover:text-primary"
                        >
                          {showCurrent ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="flex items-center border border-input rounded-md px-2 mt-1 bg-background">
                      <input
                        type={showNew ? 'text' : 'password'}
                        placeholder="Enter new password"
                        {...field}
                        className={cn(
                          'flex-1 h-10 border-0 bg-transparent p-2 text-sm',
                          'focus:outline-none focus:ring-0'
                        )}
                      />
                      {field.value && (
                        <button
                          type="button"
                          onClick={() => setShowNew((prev) => !prev)}
                          className="p-2 text-sm text-foreground hover:text-primary"
                        >
                          {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmNewPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <div className="flex items-center border border-input rounded-md px-2 mt-1 bg-background">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        {...field}
                        className={cn(
                          'flex-1 h-10 border-0 bg-transparent p-2 text-sm',
                          'focus:outline-none focus:ring-0'
                        )}
                      />
                      {field.value && (
                        <button
                          type="button"
                          onClick={() => setShowConfirm((prev) => !prev)}
                          className="p-2 text-sm text-foreground hover:text-primary"
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
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={changePassword.onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !form.formState.isValid || form.formState.isSubmitting
                }
              >
                Save
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
