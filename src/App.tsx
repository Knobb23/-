/**
 * Application Entry & Router
 * DeSUP Student Organization Website
 */

import React, { lazy, Suspense } from "react";
import { createBrowserRouter, createHashRouter, RouterProvider } from "react-router-dom";
import { RootLayout } from "./components/layout/RootLayout";
import { NotFoundPage } from "./pages/NotFoundPage";

// Phase 1 Pages
const HomePage = lazy(() => import("./pages/HomePage"));

// Phase 2 Pages
const NewsPage = lazy(() => import("./pages/NewsPage"));
const NewsDetailPage = lazy(() => import("./pages/NewsDetailPage"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const DownloadsPage = lazy(() => import("./pages/DownloadsPage"));
const EmblemPage = lazy(() => import("./pages/about/EmblemPage"));
const AuthorityPage = lazy(() => import("./pages/about/AuthorityPage"));
const BoardPage = lazy(() => import("./pages/about/BoardPage"));
const AdvisorsPage = lazy(() => import("./pages/about/AdvisorsPage"));
const HallPage = lazy(() => import("./pages/about/HallPage"));

// Phase 3 Pages
const TransparencyPage = lazy(() => import("./pages/TransparencyPage"));
const ComplaintPage = lazy(() => import("./pages/ComplaintPage"));
const TrackPage = lazy(() => import("./pages/TrackPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));

// Phase 4 Page: Admin Panel
const AdminPage = lazy(() => import("./pages/AdminPage"));

const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-[#B8923A]/30 border-t-[#4B1F7A] animate-spin" />
      <span className="text-xs text-[#1B1226]/60 font-sans tracking-wide">กำลังโหลดข้อมูล...</span>
    </div>
  </div>
);

const routes = [
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RootLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <HomePage />
          </Suspense>
        ),
      },
      // News
      {
        path: "news",
        element: (
          <Suspense fallback={<PageLoader />}>
            <NewsPage />
          </Suspense>
        ),
      },
      {
        path: "news/:category",
        element: (
          <Suspense fallback={<PageLoader />}>
            <NewsPage />
          </Suspense>
        ),
      },
      {
        path: "news/read/:id",
        element: (
          <Suspense fallback={<PageLoader />}>
            <NewsDetailPage />
          </Suspense>
        ),
      },
      // Calendar & Downloads
      {
        path: "calendar",
        element: (
          <Suspense fallback={<PageLoader />}>
            <CalendarPage />
          </Suspense>
        ),
      },
      {
        path: "downloads",
        element: (
          <Suspense fallback={<PageLoader />}>
            <DownloadsPage />
          </Suspense>
        ),
      },
      // About Us
      {
        path: "about/emblem",
        element: (
          <Suspense fallback={<PageLoader />}>
            <EmblemPage />
          </Suspense>
        ),
      },
      {
        path: "about/authority",
        element: (
          <Suspense fallback={<PageLoader />}>
            <AuthorityPage />
          </Suspense>
        ),
      },
      {
        path: "about/board",
        element: (
          <Suspense fallback={<PageLoader />}>
            <BoardPage />
          </Suspense>
        ),
      },
      {
        path: "about/advisors",
        element: (
          <Suspense fallback={<PageLoader />}>
            <AdvisorsPage />
          </Suspense>
        ),
      },
      {
        path: "about/hall",
        element: (
          <Suspense fallback={<PageLoader />}>
            <HallPage />
          </Suspense>
        ),
      },
      // Transparency, Complaints, Tracking, Contact
      {
        path: "transparency",
        element: (
          <Suspense fallback={<PageLoader />}>
            <TransparencyPage />
          </Suspense>
        ),
      },
      {
        path: "complaint",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ComplaintPage />
          </Suspense>
        ),
      },
      {
        path: "track",
        element: (
          <Suspense fallback={<PageLoader />}>
            <TrackPage />
          </Suspense>
        ),
      },
      {
        path: "contact",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ContactPage />
          </Suspense>
        ),
      },
      // Admin Panel
      {
        path: "admin",
        element: (
          <Suspense fallback={<PageLoader />}>
            <AdminPage />
          </Suspense>
        ),
      },
      // 404 Route
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
];

// Automatically detect GitHub Pages domain (e.g. knobb23.github.io)
// GitHub Pages hosts apps under a subdirectory path (/repository-name/) and lacks native SPA rewrite,
// so HashRouter ensures 100% zero-configuration routing and never produces a 404/blank screen on refresh.
const isGitHubPages =
  typeof window !== "undefined" && window.location.hostname.includes("github.io");

const router = isGitHubPages ? createHashRouter(routes) : createBrowserRouter(routes);

export default function App() {
  return <RouterProvider router={router} />;
}
