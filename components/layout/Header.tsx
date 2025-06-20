'use client';

import { usePathname } from 'next/navigation';
import LandingHeader from './LandingHeader';
import DashboardHeader from './DashboardHeader';

// Define routes that should use the landing header
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/pricing',
  '/features'
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