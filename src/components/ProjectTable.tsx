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
import { Table, TableRow, TableBody, TableCell } from '@/components/ui/table';
import { ProjectImage } from '@/assets';

interface ProjectTableProps {
  data: Project;
  onClick?: () => void;
}

type ExcalidrawData = {
  elements?: Readonly<Array<object>>;
  appState?: object;
  files?: object;
};

export function ProjectTable({ data, onClick }: ProjectTableProps) {
  const { id, name, createdAt, updatedAt, data: projectData } = data;
  const changeName = useChangeName();
  const confirmDelete = useConfirmDelete();
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');

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
  const displayName =
    name.length > 20 ? `${name.slice(0, 20).trimEnd()}...` : name;
  const formatFullDate = (iso: Date) => {
    return new Date(iso).toLocaleString();
  };

  const formatShortDate = (iso: Date) => {
    const d = new Date(iso);
    return `${d.toLocaleTimeString()} ${d.getDate()}/${d.getMonth() + 1}/...`;
  };
  return (
    <Table>
      <TableBody>
        <TableRow onClick={onClick} className="cursor-pointer">
          <TableCell className="hidden sm:table-cell w-20">
            <img
              src={thumbnailUrl}
              alt={name}
              className="w-12 h-12 rounded object-cover"
            />
          </TableCell>
          <TableCell className="w-2/5 font-medium">
            <div className="truncate">{displayName}</div>
          </TableCell>
          <TableCell className="hidden sm:table-cell w-1/5">
            <span className="hidden md:inline">
              {formatFullDate(createdAt)}
            </span>
            <span className="inline md:hidden">
              {formatShortDate(createdAt)}
            </span>
          </TableCell>
          <TableCell className="w-1/5">
            <span className="hidden md:inline">
              {updatedAt && formatFullDate(updatedAt)}
            </span>
            <span className="inline md:hidden">
              {updatedAt && formatShortDate(updatedAt)}
            </span>
          </TableCell>
          <TableCell className="text-right" onClick={handleDropdownClick}>
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
                  <Trash2 />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
