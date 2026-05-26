import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Board from './pages/Board';
import ListView from './pages/ListView';
import CalendarView from './pages/CalendarView';
import Docs from './pages/Docs';
import Snippets from './pages/Snippets';
import AiAssistant from './pages/AiAssistant';
import Billing from './pages/Billing';
import Activity from './pages/Activity';
import { ErrorBoundary } from './components/ErrorBoundary';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Routing Navigation Error</h2>
        <a href="/" style={{ color: 'hsl(var(--primary))' }}>Return to home</a>
      </div>
    ),
    children: [
      {
        index: true,
        element: (
          <ErrorBoundary>
            <Board />
          </ErrorBoundary>
        )
      },
      {
        path: 'list',
        element: (
          <ErrorBoundary>
            <ListView />
          </ErrorBoundary>
        )
      },
      {
        path: 'calendar',
        element: (
          <ErrorBoundary>
            <CalendarView />
          </ErrorBoundary>
        )
      },
      {
        path: 'docs',
        element: (
          <ErrorBoundary>
            <Docs />
          </ErrorBoundary>
        )
      },
      {
        path: 'snippets',
        element: (
          <ErrorBoundary>
            <Snippets />
          </ErrorBoundary>
        )
      },
      {
        path: 'ai',
        element: (
          <ErrorBoundary>
            <AiAssistant />
          </ErrorBoundary>
        )
      },
      {
        path: 'billing',
        element: (
          <ErrorBoundary>
            <Billing />
          </ErrorBoundary>
        )
      },
      {
        path: 'activity',
        element: (
          <ErrorBoundary>
            <Activity />
          </ErrorBoundary>
        )
      }
    ]
  }
]);
export default router;
