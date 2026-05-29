import { Save } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createProject } from '@/services/api';
import { LoadingSpinner } from './Spinner';
import { CustomError, handleError } from '@/utils';
import { toast } from 'sonner';
import { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import { Project } from '@/interfaces';
import { useAuthContext } from '@/contexts';

interface SaveDiagramDialogProps {
  excalidrawAPI: ExcalidrawImperativeAPI | null;
}

export const SaveDiagramDialog = (props: SaveDiagramDialogProps) => {
  const { excalidrawAPI } = props;
  const { user } = useAuthContext();
  const [projectName, setProjectName] = useState('Untitled');
  const [isOpen, setIsOpen] = useState(false);

  const { mutate: saveProject, isPending } = useMutation({
    mutationFn: createProject,
    onSuccess: (data: Project) => {
      toast.success('Project saved successfully!');
      setIsOpen(false);
      setProjectName('');
      setTimeout(() => {
        window.open(`/project/${data.id}`, '_blank');
      }, 1500);
    },
    onError: (error) => {
      handleError({
        message: 'Failed to save project. Please try again.',
        code: 500
      } as CustomError);
      console.log('Save error: ', error);
    }
  });

  const handleSave = () => {
    if (!projectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    if (excalidrawAPI) {
      const data = {
        elements: excalidrawAPI.getSceneElements() ?? [],
        appState: excalidrawAPI.getAppState() ?? {},
        files: excalidrawAPI.getFiles() ?? {}
      };
      saveProject({
        name: projectName,
        data,
        userId: user?.uid
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button">
          <Save />
          <h1 className="hidden md:block">Save diagram</h1>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Save your diagram</DialogTitle>
          <DialogDescription>
            Store this diagram in your project for future access. Click "Save"
            to proceed.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
              className="mt-1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave} disabled={isPending}>
            {isPending ? (
              <>
                Saving
                <LoadingSpinner className="h-4 w-4 ml-2" />
              </>
            ) : (
              <>Save</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
