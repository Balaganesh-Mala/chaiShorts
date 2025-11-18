import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Songs from "./pages/Songs";
import Videos from "./pages/Videos";
import Categories from "./pages/Categories";
import Users from "./pages/Users";
import Movies from "./pages/Movies.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/songs"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Songs />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/videos"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Videos />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/movies"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Movies />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Categories />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Users />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
