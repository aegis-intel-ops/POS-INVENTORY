import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Types
interface User {
    id: number;
    username: string;
    email: string;
    role: 'admin' | 'cashier' | 'kitchen';
    is_active: boolean;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    hasRole: (...roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing token on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('pos_token');
        const storedUser = localStorage.getItem('pos_user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            // Optionally validate token with /auth/me endpoint
            validateToken(storedToken);
        } else {
            setIsLoading(false);
        }
    }, []);

    const validateToken = async (tokenToValidate: string) => {
        try {
            const response = await fetch(`${API_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${tokenToValidate}`
                }
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else {
                // Token invalid, clear storage
                logout();
            }
        } catch (error) {
            console.error('Token validation failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            // Use JSON login to avoid multipart form issues
            const response = await fetch(`${API_URL}/auth/login-json`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const data = await response.json();
                setToken(data.access_token);
                setUser(data.user);
                localStorage.setItem('pos_token', data.access_token);
                localStorage.setItem('pos_user', JSON.stringify(data.user));
                return { success: true };
            } else {
                const errorData = await response.json();
                return { success: false, error: errorData.detail || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Network error. Is the server running?' };
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('pos_token');
        localStorage.removeItem('pos_user');
    };

    const hasRole = (...roles: string[]): boolean => {
        return user !== null && roles.includes(user.role);
    };

    const value: AuthContextType = {
        user,
        token,
        isLoading,
        isAuthenticated: user !== null,
        login,
        logout,
        hasRole
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Protected Route Component
interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Will be redirected by App.tsx
        return null;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
                    <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
