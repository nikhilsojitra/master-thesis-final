import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

function renderAtRoot() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div>Secret Dashboard</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  test('shows a loading spinner while auth state is resolving', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, loading: true });

    const { container } = renderAtRoot();

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  test('redirects to /login when not authenticated', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, loading: false });

    renderAtRoot();

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Secret Dashboard')).not.toBeInTheDocument();
  });

  test('renders the protected content when authenticated', () => {
    useAuth.mockReturnValue({ isAuthenticated: true, loading: false });

    renderAtRoot();

    expect(screen.getByText('Secret Dashboard')).toBeInTheDocument();
  });
});
