export interface User {
    fullName: string;
    email: string;
    companyName: string;
    plan?: string;
    isPro?: boolean;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    fullName: string;
    companyName: string;
    email: string;
    password: string;
}

export interface AuthContextData {
    user: User | null;
    isAuthenticated: boolean;
    login: (data: LoginCredentials) => Promise<void>;
    register: (data: RegisterCredentials) => Promise<void>;
    logout: () => void;
    loading: boolean;
}