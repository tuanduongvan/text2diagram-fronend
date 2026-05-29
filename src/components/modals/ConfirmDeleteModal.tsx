import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useConfirmDelete } from '@/hooks/use-confirm-delete';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteProject } from '@/services/api';
import { LoadingSpinner } from '@/components/Spinner';
import { CustomError, handleError } from '@/utils';
import { toast } from 'sonner';

export const ConfirmDeleteModal = () => {
  const confirmDelete = useConfirmDelete();
  const queryClient = useQueryClient();

  const { mutate: deleteProjectById, isPending } = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      toast.success('Project deleted successfully!', { duration: 1500 });
      confirmDelete.onClose();
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error) => {
      handleError({
        message: 'Failed to delete project. Please try again.',
        code: 500
      } as CustomError);
      console.error('Error deleting project:', error);
    }
  });

  const handleDelete = () => {
    if (confirmDelete.projectId) {
      deleteProjectById(confirmDelete.projectId);
    }
  };

  return (
    <Dialog open={confirmDelete.isOpen} onOpenChange={confirmDelete.onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <h2 className="text-lg font-medium">Delete Project</h2>
        </DialogHeader>
        <div className="py-4">
          <p className="text-gray-600 dark:text-gray-300">
            Are you sure you want to delete this project? This action cannot be
            undone.
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            onClick={handleDelete}
            variant="destructive"
            disabled={isPending}
          >
            {isPending ? (
              <>
                Deleting
                <LoadingSpinner className="h-4 w-4 ml-2" />
              </>
            ) : (
              'Delete'
            )}
          </Button>
          <Button
            onClick={confirmDelete.onClose}
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
