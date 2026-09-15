import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminRoute from './AdminRoute';
import { useAuth } from '../../contexts/AuthContext';

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

function renderAtRoot() {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <div>Admin Dashboard</div>
            </AdminRoute>
          }
        />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/" element={<div>Home Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AdminRoute', () => {
  test('shows a loading spinner while auth state is resolving', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, isAdmin: false, loading: true });

    const { container } = renderAtRoot();

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  test('redirects to /login when not authenticated', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, isAdmin: false, loading: false });

    renderAtRoot();

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  test('redirects to / when authenticated but not an admin', () => {
    useAuth.mockReturnValue({ isAuthenticated: true, isAdmin: false, loading: false });

    renderAtRoot();

    expect(screen.getByText('Home Page')).toBeInTheDocument();
    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
  });

  test('renders the protected content for an authenticated admin', () => {
    useAuth.mockReturnValue({ isAuthenticated: true, isAdmin: true, loading: false });

    renderAtRoot();

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });
});
