import React, { useState } from 'react';
import { signIn } from '../services/firebase';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LoaderCircle, LogIn } from 'lucide-react';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const navigate = useNavigate();

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setHasError(false);
        try {
            await signIn(email, password);
            toast.success('Signed in successfully!');
            // App component will automatically navigate to dashboard
        } catch (error: any) {
            console.error(error);
            setHasError(true);
            const errorMessage = error.code === 'auth/invalid-credential'
                ? 'Invalid email or password.'
                : 'An error occurred. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full justify-center p-6 bg-phone-bg-light dark:bg-phone-bg-dark">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sign in to access your cloned apps.</p>
            </div>
            <form onSubmit={handleSignIn} className={`space-y-4 ${hasError ? 'animate-shake' : ''}`}>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 text-sm text-gray-900 dark:text-gray-100"
                    />
                </div>
                <div>
                    <label htmlFor="password"  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 text-sm text-gray-900 dark:text-gray-100"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200 font-semibold disabled:bg-primary-300"
                >
                    {isLoading ? <LoaderCircle size={20} className="animate-spin" /> : <LogIn size={20} />}
                    <span>Sign In</span>
                </button>
            </form>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                Don't have an account?{' '}
                <Link to="/signup" className="font-semibold text-primary-500 hover:underline">
                    Sign Up
                </Link>
            </p>
        </div>
    );
};

export default LoginPage;