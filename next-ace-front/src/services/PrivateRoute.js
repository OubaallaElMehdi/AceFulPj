import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../context/AuthContext'; // Assuming AuthContext

const PrivateRoute = ({ children }) => {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const { user, setUser, token, setToken } = useContext(AuthContext); // Using AuthContext

    useEffect(() => {
        // Check for existing authentication state on initial render
        const checkAuth = async () => {
            const storedToken = localStorage.getItem('token');
            // Validate token on backend if necessary (for security)
            if (storedToken) {
                setToken(storedToken);
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
                router.push('/login');
            }
        };

        checkAuth();
    }, []);

    if (!isAuthenticated) {
        return null; // Prevent rendering while loading or redirecting
    }

    return children; // Render protected content if authenticated
};

export default PrivateRoute;