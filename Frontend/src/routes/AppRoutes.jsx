import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';

import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Customers from '../pages/Customers';
import Services from '../pages/Services';
import Barbers from '../pages/Barbers';
import Appointments from '../pages/Appointments';
import Attendance from '../pages/Attendance';
import Wages from '../pages/Wages';
import Reports from '../pages/Reports';
import Profile from '../pages/Profile';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Authenticated Layout Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/profile" element={<Profile />} />

          {/* Admin & Receptionist Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Administrator', 'Receptionist']} />}>
            <Route path="/customers" element={<Customers />} />
          </Route>

          {/* Admin Only Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Administrator']} />}>
            <Route path="/services" element={<Services />} />
            <Route path="/barbers" element={<Barbers />} />
            <Route path="/reports" element={<Reports />} />
          </Route>

          {/* Admin & Barber Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Administrator', 'Barber']} />}>
            <Route path="/wages" element={<Wages />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
