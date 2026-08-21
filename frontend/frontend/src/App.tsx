import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Sidebar } from './components/SideBar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Accounts } from './pages/Accounts';
import { Subscription } from './pages/Subscription'; // Importação da tela de Assinaturas

function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-100">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Header />
                <main className="p-8 flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">{children}</div>
                </main>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <Dashboard />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/transactions"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <Transactions />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/accounts"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <Accounts />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/subscription"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <Subscription />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}