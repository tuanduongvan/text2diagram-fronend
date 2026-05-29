import { useState } from 'react';
import { Camera, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AvatarImage } from '@/assets';

type AvatarPreviewProps = {
  avatar?: string;
  name?: string;
  isEditing: boolean;
  handleUploadAvatar: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function AvatarPreview({
  avatar,
  isEditing,
  name,
  handleUploadAvatar
}: AvatarPreviewProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-start space-y-6">
      <div className="group relative" onClick={() => setIsPreviewOpen(true)}>
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="w-70 h-70 rounded-lg object-cover border border-gray-300
                       transition-opacity duration-300 group-hover:opacity-70 cursor-pointer"
          />
        ) : (
          <img
            src={AvatarImage}
            alt={name}
            className="w-70 h-70 rounded-lg object-cover border border-gray-300
                     transition-opacity duration-300"
          />
        )}
      </div>

      {isEditing && (
        <>
          <Button
            variant="default"
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => document.getElementById('avatar-upload')?.click()}
          >
            <Camera className="size-5" />
            <span className="text-sm font-medium">Change Avatar</span>
          </Button>
          <Input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleUploadAvatar}
            className="hidden"
          />
        </>
      )}

      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setIsPreviewOpen(false)}
        >
          <Button
            variant="ghost"
            className="absolute top-4 right-4 text-white"
            onClick={(e) => {
              e.stopPropagation();
              setIsPreviewOpen(false);
            }}
          >
            <X />
          </Button>

          {avatar && (
            <img
              src={avatar}
              alt={name}
              className="max-w-[90%] max-h-[90%] object-contain rounded-lg shadow-lg"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default AvatarPreview;
