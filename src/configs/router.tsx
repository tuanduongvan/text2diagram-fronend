import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../layouts';
import {
  ResetPasswordPage,
  ErrorBoundaryPage,
  ForgotPasswordPage,
  LandingPage,
  LoginPage,
  NotAllowToAccessAuthPageAfterLogin,
  ProfilePage,
  PromptingPage,
  ProtectedRoute,
  RegisterPage,
  WorkspacePage,
  DrawPage,
  PrivacyPolicyPage,
  TermsAndConditionsPage
} from '../pages';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorBoundaryPage />,
    children: [
      {
        path: '',
        element: <LandingPage />
      },
      {
        path: 'privacypolicy',
        element: <PrivacyPolicyPage />
      },
      {
        path: 'termsandconditions',
        element: <TermsAndConditionsPage />
      },
      {
        path: '',
        element: <ProtectedRoute />,
        children: [
          {
            path: 'profile',
            element: <ProfilePage />
          },
          {
            path: 'prompt',
            element: <PromptingPage />
          },
          {
            path: 'project/:id',
            element: <DrawPage />
          },
          {
            path: 'workspace',
            element: <WorkspacePage />
          }
        ]
      },
      {
        path: '',
        element: <NotAllowToAccessAuthPageAfterLogin />,
        children: [
          {
            path: 'register',
            element: <RegisterPage />
          },
          {
            path: 'login',
            element: <LoginPage />
          },
          {
            path: 'forgot-password',
            element: <ForgotPasswordPage />
          }
        ]
      },
      {
        path: 'change-password',
        element: <ResetPasswordPage />
      }
    ]
  }
]);
