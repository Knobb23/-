/**
 * Application Entry & Router
 * DeSUP Student Organization Website
 */

import React from "react";
import { createBrowserRouter, createHashRouter, RouterProvider } from "react-router-dom";
import { RootLayout } from "./components/layout/RootLayout";
import { NotFoundPage } from "./pages/NotFoundPage";

// Direct Page Imports (Eliminates chunk loading failures on GitHub Pages / CDN / subdirectories)
import HomePage from "./pages/HomePage";
import NewsPage from "./pages/NewsPage";
import NewsDetailPage from "./pages/NewsDetailPage";
import CalendarPage from "./pages/CalendarPage";
import DownloadsPage from "./pages/DownloadsPage";
import EmblemPage from "./pages/about/EmblemPage";
import AuthorityPage from "./pages/about/AuthorityPage";
import BoardPage from "./pages/about/BoardPage";
import AdvisorsPage from "./pages/about/AdvisorsPage";
import HallPage from "./pages/about/HallPage";
import TransparencyPage from "./pages/TransparencyPage";
import ComplaintPage from "./pages/ComplaintPage";
import TrackPage from "./pages/TrackPage";
import ContactPage from "./pages/ContactPage";
import AdminPage from "./pages/AdminPage";

const routes = [
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      // News Routes
      {
        path: "news",
        element: <NewsPage />,
      },
      {
        path: "news/:category",
        element: <NewsPage />,
      },
      {
        path: "news/read/:id",
        element: <NewsDetailPage />,
      },
      // Calendar & Downloads
      {
        path: "calendar",
        element: <CalendarPage />,
      },
      {
        path: "downloads",
        element: <DownloadsPage />,
      },
      // About Us Pages
      {
        path: "about/emblem",
        element: <EmblemPage />,
      },
      {
        path: "about/authority",
        element: <AuthorityPage />,
      },
      {
        path: "about/board",
        element: <BoardPage />,
      },
      {
        path: "about/advisors",
        element: <AdvisorsPage />,
      },
      {
        path: "about/hall",
        element: <HallPage />,
      },
      // Transparency, Complaints, Tracking, Contact
      {
        path: "transparency",
        element: <TransparencyPage />,
      },
      {
        path: "complaint",
        element: <ComplaintPage />,
      },
      {
        path: "track",
        element: <TrackPage />,
      },
      {
        path: "contact",
        element: <ContactPage />,
      },
      // Admin Panel & Admin Users
      {
        path: "admin",
        element: <AdminPage />,
      },
      {
        path: "admin/users",
        element: <AdminPage defaultTab="users" />,
      },
      // 404 Route
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
];

/**
 * Automatic Router Configuration:
 * - Detects subdirectory hosting (e.g. GitHub Pages https://<user>.github.io/<repo>/)
 *   and sets router basename automatically.
 * - Supports HashRouter fallback when URL contains hash (#/...) or file protocol.
 * - Supports clean HTML5 BrowserRouter with SPA rewrites for Firebase, Vercel, Netlify,
 *   Cloud Run, and GitHub Pages (via public/404.html redirect).
 */
function getRouterBasename(): string {
  // 1. If Vite base path is a subpath (e.g. /my-repo/), use it
  const viteBase = import.meta.env.BASE_URL;
  if (viteBase && viteBase !== "/" && viteBase !== "./") {
    return viteBase.replace(/\/$/, "");
  }

  // 2. If hosted under GitHub Pages with a repository path: /<repo-name>/
  if (typeof window !== "undefined" && window.location.hostname.includes("github.io")) {
    const parts = window.location.pathname.split("/").filter(Boolean);
    if (parts.length > 0 && !parts[0].includes(".")) {
      return `/${parts[0]}`;
    }
  }

  return "";
}

const isHashBased =
  typeof window !== "undefined" &&
  (window.location.protocol === "file:" ||
    (Boolean(window.location.hash) && window.location.hash.startsWith("#/")));

const basename = getRouterBasename();

const router = isHashBased
  ? createHashRouter(routes)
  : createBrowserRouter(routes, { basename: basename || undefined });

export default function App() {
  return <RouterProvider router={router} />;
}
