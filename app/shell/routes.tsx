import type { ComponentType } from 'react';
import type { RouteObject } from 'react-router';
import { FocusLayout, MainLayout } from './layout/layouts';
import { NotFoundPage, RouteErrorPage } from './pages';

/**
 * Route-based code splitting: each screen's code downloads when it is first visited.
 * `pick` chooses the component out of the feature's public API.
 */
function page<M>(load: () => Promise<M>, pick: (module: M) => ComponentType): RouteObject['lazy'] {
  return async () => ({ Component: pick(await load()) });
}

/**
 * Every screen, defined once as data. See docs/refactor-plan.md section 4 for the inventory.
 * The pathless routes with an errorElement keep failures inside the layout, so the
 * navigation is still there to get back out.
 */
export const routes: RouteObject[] = [
  {
    element: <MainLayout />,
    children: [
      {
        errorElement: <RouteErrorPage />,
        children: [
          {
            index: true,
            lazy: page(
              () => import('@app/features/home'),
              (m) => m.HomePage,
            ),
          },
          {
            path: 'stylists',
            lazy: page(
              () => import('@app/features/stylists'),
              (m) => m.StylistsPage,
            ),
          },
          {
            path: 'stylists/:id/about',
            lazy: page(
              () => import('@app/features/stylist-profile'),
              (m) => m.AboutStudioPage,
            ),
          },
          {
            path: 'stylists/:id/photos/:n',
            lazy: page(
              () => import('@app/features/stylist-profile'),
              (m) => m.PhotoViewerPage,
            ),
          },
          {
            // :tab is portfolio, services, or reviews; the page redirects anything else.
            path: 'stylists/:id/:tab?',
            lazy: page(
              () => import('@app/features/stylist-profile'),
              (m) => m.StylistProfilePage,
            ),
          },
          {
            path: 'saved',
            lazy: page(
              () => import('@app/features/saved'),
              (m) => m.SavedPage,
            ),
          },
          {
            path: 'appointments',
            lazy: page(
              () => import('@app/features/appointments'),
              (m) => m.AppointmentsPage,
            ),
          },
          {
            path: 'appointments/:id',
            lazy: page(
              () => import('@app/features/appointments'),
              (m) => m.AppointmentDetailPage,
            ),
          },
          {
            path: 'appointments/:id/reschedule',
            lazy: page(
              () => import('@app/features/appointments'),
              (m) => m.ReschedulePage,
            ),
          },
          {
            path: 'appointments/:id/review',
            lazy: page(
              () => import('@app/features/appointments'),
              (m) => m.LeaveReviewPage,
            ),
          },
          {
            path: 'help',
            lazy: page(
              () => import('@app/features/help'),
              (m) => m.HelpPage,
            ),
          },
          {
            // Not linked from the app. The design library on one page, for reviewers.
            path: 'design-library',
            lazy: page(
              () => import('./DesignLibraryPage'),
              (m) => m.DesignLibraryPage,
            ),
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
  {
    // Booking has no main navigation. The steps share one parent so the draft survives between them.
    path: 'book/:id',
    element: <FocusLayout />,
    children: [
      {
        errorElement: <RouteErrorPage />,
        children: [
          {
            lazy: page(
              () => import('@app/features/booking'),
              (m) => m.BookingFlow,
            ),
            children: [
              {
                index: true,
                lazy: page(
                  () => import('@app/features/booking'),
                  (m) => m.ChooseStep,
                ),
              },
              {
                path: 'details',
                lazy: page(
                  () => import('@app/features/booking'),
                  (m) => m.DetailsStep,
                ),
              },
              {
                path: 'review',
                lazy: page(
                  () => import('@app/features/booking'),
                  (m) => m.ReviewStep,
                ),
              },
              {
                path: 'done',
                lazy: page(
                  () => import('@app/features/booking'),
                  (m) => m.DoneStep,
                ),
              },
            ],
          },
        ],
      },
    ],
  },
];
