'use client';

import { usePathname } from 'next/navigation';
import LandingHeader from './LandingHeader';
import DashboardHeader from './DashboardHeader';

// Define routes that should use the landing header
const publicRoutes = [
  '/',
  '/pricing',
  '/features'
];

// Define routes that should have no header (auth pages)
const noHeaderRoutes = [
  '/login',
  '/signup'
];

// Define routes that should use the dashboard header
const authenticatedRoutes = [
  '/dashboard',
  '/workflows',
  '/generate',
  '/settings',
  '/feedback',
  '/admin'
];

export default function Header() {
  const pathname = usePathname();

  // Check if current route should have no header (auth pages)
  const isNoHeaderRoute = noHeaderRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Return null for auth pages to have clean full-screen experience
  if (isNoHeaderRoute) {
    return null;
  }

  // Check if current route is an authenticated route
  const isDashboardRoute = authenticatedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if current route is explicitly a public route
  const isPublicRoute = publicRoutes.includes(pathname);

  // Default to landing header for public routes, dashboard header for authenticated routes
  if (isDashboardRoute) {
    return <DashboardHeader />;
  }

  // Default to landing header for public routes and any unmatched routes
  return <LandingHeader />;
} 