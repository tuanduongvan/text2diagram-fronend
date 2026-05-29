import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toaster, toast } from 'sonner';
import { useProject } from '@/hooks/use-project';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProject } from '@/services/api';
import { LoadingSpinner } from '@/components/Spinner';
import { CustomError, handleError } from '@/utils';
import { useAuthContext } from '@/contexts';

export const CreateProjectModal = () => {
  const project = useProject();
  const { user } = useAuthContext();
  const [projectName, setProjectName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { mutate: createNewProject, isPending } = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      toast.success('Project created successfully!', {
        duration: 1500
      });
      setProjectName('');
      setError('');
      project.onClose();
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error) => {
      handleError({
        message: 'Failed to create project. Please try again.',
        code: 500
      } as CustomError);
      console.error('Error creating project:', error);
    }
  });

  useEffect(() => {
    if (project.isOpen) {
      setProjectName('Untitled');
      setError('');
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 0);
    }
  }, [project.isOpen]);

  const handleCancel = () => {
    setProjectName('');
    setError('');
    project.onClose();
  };

  const handleCreate = () => {
    if (!projectName.trim()) {
      setError('Project must have a name.');
      return;
    }

    // if (!selectedThumbnail) {
    //   setError('Please select a thumbnail.');
    //   return;
    // }

    createNewProject({
      name: projectName,
      userId: user?.uid,
      data: {
        elements: [],
        appState: {},
        files: {}
      },
      thumbnail: ''
    });
  };

  const canSave = projectName.trim().length > 0;

  return (
    <>
      <Toaster position="top-center" />

      <Dialog open={project.isOpen} onOpenChange={project.onClose}>
        <DialogContent className="z-100000">
          <DialogHeader className="border-b pb-3">
            <h2 className="text-lg font-medium">Create new project</h2>
          </DialogHeader>

          <div className="py-4">
            <Label
              htmlFor="project-name"
              className="block text-sm font-medium text-gray-700"
            >
              Project Name
            </Label>
            <Input
              id="project-name"
              ref={inputRef}
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
              className="mt-1 block w-full"
              disabled={isPending}
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button
              onClick={handleCreate}
              variant="default"
              disabled={isPending || !canSave}
            >
              {isPending ? (
                <>
                  Creating
                  <LoadingSpinner className="h-4 w-4 ml-2" />
                </>
              ) : (
                'Create'
              )}
            </Button>
            <Button
              onClick={handleCancel}
              variant="secondary"
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
