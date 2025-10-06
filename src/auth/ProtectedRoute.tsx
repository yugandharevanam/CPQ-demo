// File: src/auth/ProtectedRoute.tsx
import React, { memo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from './useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
// import { AppSidebar } from "@/components/layout/app-sidebar" // Commented out - sidebar not needed
import { SiteHeader } from "@/components/layout/site-header"
// import {
//   SidebarInset,
//   SidebarProvider,
// } from "@/components/ui/sidebar" // Commented out - sidebar not needed
import { Toaster } from '@/components/ui/sonner';

interface ProtectedRouteProps {
  pagetitle?: string,
  children: React.ReactNode;
}

const ProtectedRoute = memo(function ProtectedRoute({ pagetitle, children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    // Redirect to login page, but save the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    // Sidebar components commented out - direct access to lift-plan
    // <SidebarProvider>
    //   <AppSidebar />
    //   <SidebarInset>
        <div className="min-h-screen">
          <SiteHeader title={pagetitle} />
          <div className="flex items-center px-4">
            {children}
            <Toaster richColors position="top-center"/>
          </div>
        </div>
    //   </SidebarInset>
    // </SidebarProvider>
  );
});

export default ProtectedRoute;