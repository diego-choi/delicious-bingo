import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import TemplateListPage from './pages/TemplateListPage';
import TemplateDetailPage from './pages/TemplateDetailPage';
import MyBoardsPage from './pages/MyBoardsPage';
import BoardPage from './pages/BoardPage';
import LeaderboardPage from './pages/LeaderboardPage';
import LoginPage from './pages/LoginPage';
import ErrorPage from './pages/ErrorPage';

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
    ],
  },
]);
