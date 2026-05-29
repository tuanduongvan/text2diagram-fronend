import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useChangeName } from '@/hooks/use-change-name';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProject } from '@/services/api';
import { LoadingSpinner } from '@/components/Spinner';
import { CustomError, handleError } from '@/utils';

export const ChangeNameProjectModal = () => {
  const changeName = useChangeName();
  const [isTouched, setIsTouched] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: updateProjectName, isPending } = useMutation({
    mutationFn: updateProject,
    onSuccess: () => {
      toast.success('Project name updated successfully!', {
        duration: 1500
      });
      changeName.onClose();
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error) => {
      handleError({
        message: 'Failed to update project name. Please try again.',
        code: 500
      } as CustomError);
      console.error('Error updating project name:', error);
    }
  });

  const isNameEmpty = useMemo(() => {
    return !changeName.projectName.trim();
  }, [changeName.projectName]);

  const handleUpdateName = () => {
    if (isNameEmpty) {
      return;
    }

    if (changeName.projectId) {
      updateProjectName({
        id: changeName.projectId,
        name: changeName.projectName
      });
    }
  };

  return (
    <Dialog open={changeName.isOpen} onOpenChange={changeName.onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <h2 className="text-lg font-medium">Change Project Name</h2>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="project-name">Project Name</Label>
          <Input
            id="project-name"
            value={changeName.projectName}
            onChange={(e) => {
              changeName.setProjectName(e.target.value);
              setIsTouched(true);
            }}
            placeholder="Enter new project name"
            className="mt-1"
            disabled={isPending}
          />
          {isTouched && isNameEmpty && (
            <p className="mt-2 text-sm text-red-600">
              Project name cannot be empty
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button
            onClick={handleUpdateName}
            disabled={isPending || isNameEmpty}
          >
            {isPending ? (
              <>
                Updating
                <LoadingSpinner className="h-4 w-4 ml-2" />
              </>
            ) : (
              'Update'
            )}
          </Button>
          <Button
            onClick={changeName.onClose}
            variant="secondary"
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
