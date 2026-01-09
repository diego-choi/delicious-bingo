import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import TemplateListPage from './pages/TemplateListPage';
import TemplateDetailPage from './pages/TemplateDetailPage';
import MyBoardsPage from './pages/MyBoardsPage';
import BoardPage from './pages/BoardPage';
import LeaderboardPage from './pages/LeaderboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ErrorPage from './pages/ErrorPage';

// Admin imports
import AdminGuard from './admin/components/AdminGuard';
import AdminLayout from './admin/components/AdminLayout';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminRestaurants from './admin/pages/AdminRestaurants';
import AdminRestaurantEdit from './admin/pages/AdminRestaurantEdit';
import AdminTemplates from './admin/pages/AdminTemplates';
import AdminTemplateEdit from './admin/pages/AdminTemplateEdit';
import AdminCategories from './admin/pages/AdminCategories';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'templates',
        element: <TemplateListPage />,
      },
      {
        path: 'templates/:id',
        element: <TemplateDetailPage />,
      },
      {
        path: 'boards',
        element: <MyBoardsPage />,
      },
      {
        path: 'boards/:id',
        element: <BoardPage />,
      },
      {
        path: 'leaderboard',
        element: <LeaderboardPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
    ],
  },
  {
    path: '/admin',
    element: (
      <AdminGuard>
        <AdminLayout />
      </AdminGuard>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: 'restaurants',
        element: <AdminRestaurants />,
      },
      {
        path: 'restaurants/new',
        element: <AdminRestaurantEdit />,
      },
      {
        path: 'restaurants/:id',
        element: <AdminRestaurantEdit />,
      },
      {
        path: 'templates',
        element: <AdminTemplates />,
      },
      {
        path: 'templates/new',
        element: <AdminTemplateEdit />,
      },
      {
        path: 'templates/:id',
        element: <AdminTemplateEdit />,
      },
      {
        path: 'categories',
        element: <AdminCategories />,
      },
    ],
  },
]);
