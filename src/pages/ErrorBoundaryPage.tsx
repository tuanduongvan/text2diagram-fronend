import { useRouteError } from 'react-router-dom';

// TODO: Complete page for error boundary
export const ErrorBoundaryPage = () => {
  const error = useRouteError();
  const message =
    error instanceof Error ? error.message : 'Something went wrong';

  return <div>Error: {message}</div>;
};
