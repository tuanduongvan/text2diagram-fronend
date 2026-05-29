import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSettings } from '@/hooks/use-settings';

export function InviteModal() {
  const { isOpen, onClose } = useSettings();

  const [emails, setEmails] = React.useState(['', '']);
  const [enableLink, setEnableLink] = React.useState(false);
  const [inviteLink, setInviteLink] = React.useState(
    'https://name@example.com'
  );

  // Hàm thêm input email
  const handleAddEmail = () => {
    setEmails((prev) => [...prev, '']);
  };

  // Hàm thay đổi nội dung từng email
  const handleChangeEmail = (index: number, value: string) => {
    setEmails((prev) => {
      const newEmails = [...prev];
      newEmails[index] = value;
      return newEmails;
    });
  };

  // Hàm xử lý gửi lời mời
  const handleSendInvitations = () => {
    // Tự thêm logic gửi mail
    console.log('Gửi lời mời tới: ', emails);
  };

  // Hàm copy link vào clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    alert('Link đã được copy!');
  };

  // onOpenChange của Dialog sẽ gọi onClose() khi người dùng bấm tắt
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite to username</DialogTitle>
          <DialogDescription>
            Nhập địa chỉ email để mời bạn bè hoặc đồng nghiệp.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Email Addresses</Label>
            {emails.map((email, idx) => (
              <div key={idx} className="mb-2">
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => handleChangeEmail(idx, e.target.value)}
                />
              </div>
            ))}
            <Button variant="outline" onClick={handleAddEmail}>
              Add one
            </Button>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Label htmlFor="enableLink" className="mr-4">
              Enable invite link and share with your teammates
            </Label>
            <Switch
              id="enableLink"
              checked={enableLink}
              onCheckedChange={setEnableLink}
            />
          </div>

          {enableLink && (
            <div className="mt-2 flex items-center space-x-2">
              <Input
                type="url"
                value={inviteLink}
                onChange={(e) => setInviteLink(e.target.value)}
              />
              <Button variant="outline" onClick={handleCopyLink}>
                Copy
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button onClick={handleSendInvitations}>Send invitations</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
