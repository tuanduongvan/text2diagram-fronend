import { LayoutGrid, List, Plus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useProject } from '@/hooks/use-project';
import { CreateProjectModal } from '@/components/modals/CreateProjectModal';
import { ChangeNameProjectModal } from '@/components/modals/ChangeNameProjectModal';
import { ProjectCard } from '@/components/ProjectCard';
import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Undo2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/Spinner';
import { CustomError, handleError } from '@/utils';
import { useEffect, useState } from 'react';
import { getProjects } from '@/services/api';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ProjectTable } from '@/components/ProjectTable';
import { Table, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function WorkspacePage() {
  const project = useProject();
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    const saved = localStorage.getItem('viewMode');
    return saved === 'list' ? 'list' : 'grid';
  });

  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  const {
    data: projectsData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['projects', currentPage],
    queryFn: () => getProjects({ page: currentPage, pageSize: 10 })
  });

  const totalPages = projectsData?.totalPage || 1;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  useEffect(() => {
    if (error) {
      handleError({
        message: 'Failed to load projects. Please try again.',
        code: 500
      } as CustomError);
      console.error('Error loading projects:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen p-[1rem] md:px-[5rem] md:py-[3rem] xl:px-[8rem] bg-white dark:bg-black text-black dark:text-white">
      <Button className="float-right">
        <Undo2 />
        <Link to="../prompt">Back To My Prompt</Link>
      </Button>
      <h1 className="text-xl font-bold md:text-[2rem] dark:text-white text-black pb-2 md:pb-[1rem]">
        My projects
      </h1>
      <Separator />

      <Tabs
        value={viewMode}
        onValueChange={(value: string) => {
          setViewMode(value === 'list' ? 'list' : 'grid');
        }}
        className="pt-4 space-y-4"
      >
        <div className="flex items-center justify-between">
          <Button onClick={project.onOpen} className="flex items-center">
            <Plus className="w-6 h-6" />
            <span className="hidden sm:block">New project</span>
          </Button>
          <TabsList>
            <TabsTrigger value="grid">
              <List />
              <span className="hidden sm:block">Grid View</span>
            </TabsTrigger>
            <TabsTrigger value="list">
              <LayoutGrid />
              <span className="hidden sm:block">List View</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="grid">
          <div className="grid gap-4 pt-2 md:pt-[2rem] grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
            {isLoading ? (
              <div className="col-span-full flex justify-center items-center py-8">
                <LoadingSpinner className="h-8 w-8" />
              </div>
            ) : projectsData?.data ? (
              projectsData.data.map((project) => (
                <ProjectCard
                  key={project.id}
                  data={project}
                  onClick={() => navigate(`/project/${project.id}`)}
                />
              ))
            ) : null}

            <CreateProjectModal />
            <ChangeNameProjectModal />
            <ConfirmDeleteModal />
          </div>
        </TabsContent>

        <TabsContent value="list">
          <Table className="overflow-x-auto min-w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="hidden sm:table-cell w-20">
                  Image
                </TableHead>
                <TableHead className="w-2/5">Name</TableHead>
                <TableHead className="hidden sm:table-cell w-1/5">
                  Created
                </TableHead>
                <TableHead className="w-1/5">Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
          </Table>
          {isLoading ? (
            <div className="col-span-full flex justify-center items-center py-8">
              <LoadingSpinner className="h-8 w-8" />
            </div>
          ) : projectsData?.data ? (
            projectsData.data.map((project) => (
              <ProjectTable
                key={project.id}
                data={project}
                onClick={() => navigate(`/project/${project.id}`)}
              />
            ))
          ) : null}
          <CreateProjectModal />
          <ChangeNameProjectModal />
          <ConfirmDeleteModal />
        </TabsContent>
      </Tabs>

      {!isLoading && projectsData && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
