import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from 'firebase/auth';
import { auth } from '../firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AvatarPreview from '@/components/AvatarPreview';
import { useChangePassword } from '@/hooks/use-change-password';
import { ChangePasswordModal } from '@/components/modals/ChangePasswordModal';
import { cn } from '@/lib/utils';
import { AvatarImage } from '@/assets';

export function ProfilePage() {
  const { user, isAuth, logout } = useAuthContext();
  const navigate = useNavigate();

  const [avatar, setAvatar] = useState<string>(user?.photoURL || '');
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState<string>(user?.displayName || '');

  const isGoogleUser = user?.providerData.some(
    (p) => p.providerId === 'google.com'
  );

  const email = user?.email || '';

  const changePassword = useChangePassword();

  useEffect(() => {
    if (!isAuth) {
      navigate('/login');
    }
  }, [isAuth, navigate]);

  useEffect(() => {
    setName(user?.displayName || '');
    setAvatar(user?.photoURL || AvatarImage);
  }, [user]);

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = URL.createObjectURL(file);
      if (auth.currentUser)
        await updateProfile(auth.currentUser, { photoURL: url });
      setAvatar(url);
    } catch (error) {
      console.error('Error uploading avatar:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      if (auth.currentUser && name !== user?.displayName) {
        await updateProfile(auth.currentUser, { displayName: name });
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="pb-10">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <Label className="block font-semibold mb-1">Email</Label>
              <Input
                type="text"
                value={email}
                disabled
                className="bg-[#F0F0F0] dark:bg-[#2A2A2A] dark:text-zinc-500 text-zinc-500"
              />
              {isGoogleUser && (
                <div className="mt-1 text-xs text-zinc-500">
                  Signed in with Google — email cannot be changed
                </div>
              )}
            </div>

            <div className="mb-4">
              <Label className="block font-semibold mb-1">
                Name (optional)
              </Label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isEditing}
                className={cn(
                  isEditing
                    ? 'bg-[#F8F8F8] dark:bg-[#131313] dark:text-zinc-100 text-[#333333]'
                    : 'bg-[#F0F0F0] dark:bg-[#2A2A2A] dark:text-zinc-500 text-zinc-500'
                )}
              />
            </div>

            <div className="mb-4">
              <Label className="block font-semibold mb-1">Password</Label>
              <Input
                type="password"
                value={isGoogleUser ? '' : '*********'}
                disabled
                className="bg-[#F0F0F0] dark:bg-[#2A2A2A] dark:text-zinc-500 text-zinc-500"
              />
              {isEditing && !isGoogleUser && (
                <div className="mt-1 float-right">
                  <Button
                    variant="link"
                    onClick={() => changePassword.onOpen()}
                    className="px-0"
                  >
                    Change Password
                  </Button>
                </div>
              )}
              {isGoogleUser && (
                <div className="mt-1 text-xs text-zinc-500">
                  Password managed by Google
                </div>
              )}
            </div>
          </div>

          <AvatarPreview
            avatar={avatar}
            isEditing={isEditing}
            handleUploadAvatar={handleUploadAvatar}
          />
        </div>

        <div className="mt-[1rem] flex gap-6 justify-center">
          {!isEditing ? (
            <Button variant="default" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2 justify-center">
              <Button variant="default" size="lg" onClick={handleSaveProfile}>
                Save
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          )}
          <Button variant="destructive" size="lg" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>
      <ChangePasswordModal />
    </div>
  );
}
