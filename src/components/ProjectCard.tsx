import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { EllipsisVertical, FolderPen, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useChangeName } from '@/hooks/use-change-name';
import { useConfirmDelete } from '@/hooks/use-confirm-delete';
import { useEffect, useState } from 'react';
import { exportToCanvas } from '@excalidraw/excalidraw';
import { Project } from '@/interfaces';
import { AppState } from '@excalidraw/excalidraw/types';
import { ProjectImage } from '@/assets';

export interface ProjectCardProps {
  data: Project;
  onClick?: () => void;
}

type ExcalidrawData = {
  elements?: Readonly<Array<object>>;
  appState?: AppState;
  files?: object;
};

export function ProjectCard({ data, onClick }: ProjectCardProps) {
  const { id, name, createdAt, updatedAt, data: projectData } = data;
  const changeName = useChangeName();
  const confirmDelete = useConfirmDelete();
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');

  const customTime = (createdAt: Date, updatedAt: Date) => {
    if (updatedAt) {
      return 'Updated at ' + new Date(updatedAt).toLocaleString();
    }
    return 'Created at ' + new Date(createdAt).toLocaleString();
  };
  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  useEffect(() => {
    const generateThumbnail = async () => {
      const { appState, elements, files } = projectData as ExcalidrawData;
      if (elements && elements.length > 0) {
        try {
          const canvas = await exportToCanvas({
            elements,
            appState,
            files,
            exportPadding: 10
          });

          const dataUrl = canvas.toDataURL('image/png');
          setThumbnailUrl(dataUrl);
        } catch (error) {
          console.error('Error generating thumbnail:', error);
          setThumbnailUrl(ProjectImage);
        }
      } else {
        setThumbnailUrl(ProjectImage);
      }
    };

    generateThumbnail();
  }, [projectData]);

  return (
    <Card
      onClick={onClick}
      className="
          w-full                
          flex flex-col         
          cursor-pointer
          p-1 rounded-lg
          border border-gray-300 dark:border-zinc-700
          hover:bg-zinc-100 dark:hover:bg-[#1A1A1A]
          transition-all
        "
    >
      <CardContent className="flex flex-col p-2 gap-2">
        {thumbnailUrl ? (
          <div className="w-full aspect-[4/3] mb-2">
            <img
              src={thumbnailUrl}
              alt="Project Thumbnail"
              className="w-full h-[200px] rounded-md object-contain"
            />
          </div>
        ) : (
          <div className="w-full aspect-[4/3] mb-2 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <span className="text-zinc-400">Loading…</span>
          </div>
        )}

        <Separator className="bg-[#a7a7a7] dark:bg-[707070]" />

        <div className="flex items-center pt-2 justify-between w-full gap-2">
          <div className="flex-1 text-left min-w-0 flex flex-col">
            <h3
              className="
                font-semibold text-md md:text-xl mb-1
                overflow-hidden whitespace-nowrap truncate
              "
            >
              {name}
            </h3>
            <p
              className="
                text-[10px] text-zinc-600 dark:text-zinc-400
                overflow-hidden whitespace-nowrap truncate
                
              "
            >
              {customTime(createdAt, updatedAt)}
            </p>
          </div>

          <div onClick={handleDropdownClick}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sl">
                  <EllipsisVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="font-semibold z-50">
                <DropdownMenuItem onClick={() => changeName.onOpen(id, name)}>
                  <FolderPen />
                  Change Name
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => confirmDelete.onOpen(id)}>
                  <Trash2 /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
