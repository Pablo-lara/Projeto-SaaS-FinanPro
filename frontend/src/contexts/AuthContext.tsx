import { useState, type ReactNode } from 'react';
import { api } from '../services/api';
import type { User, LoginCredentials, RegisterCredentials } from '../types/auth';
import { AuthContext } from './AuthContextValue';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('@FinanPro:user');
        if (storedUser) {
            try {
                return JSON.parse(storedUser) as User;
            } catch {
                return null;
            }
        }
        return null;
    });

    const [loading] = useState(false);

    const login = async (loginData: LoginCredentials) => {
        const response = await api.post('/auth/login', loginData);
        const { token, fullName, email, companyName } = response.data;

        const userData: User = { fullName, email, companyName };

        localStorage.setItem('@FinanPro:token', token);
        localStorage.setItem('@FinanPro:user', JSON.stringify(userData));

        setUser(userData);
    };

    const register = async (registerData: RegisterCredentials) => {
        const response = await api.post('/auth/register', registerData);
        const { token, fullName, email, companyName } = response.data;

        const userData: User = { fullName, email, companyName };

        localStorage.setItem('@FinanPro:token', token);
        localStorage.setItem('@FinanPro:user', JSON.stringify(userData));

        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('@FinanPro:token');
        localStorage.removeItem('@FinanPro:user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}