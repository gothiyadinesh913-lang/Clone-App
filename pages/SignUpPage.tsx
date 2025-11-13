import React, { useState } from 'react';
import { signUp } from '../services/firebase';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LoaderCircle, UserPlus } from 'lucide-react';

const SignUpPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            toast.error("Password should be at least 6 characters.");
            return;
        }
        setIsLoading(true);
        try {
            await signUp(email, password, username, mobile);
            toast.success('Account created successfully!');
            // App component will automatically navigate to dashboard
        } catch (error: any) {
            console.error(error);
            const errorMessage = error.code === 'auth/email-already-in-use'
                ? 'This email is already registered.'
                : 'An error occurred. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full justify-center p-6 bg-phone-bg-light dark:bg-phone-bg-dark">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Get started with your own clones.</p>
            </div>
            <form onSubmit={handleSignUp} className="space-y-4">
                 <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 text-sm text-gray-900 dark:text-gray-100"
                    />
                </div>
                 <div>
                    <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Number</label>
                    <input
                        type="tel"
                        id="mobile"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 text-sm text-gray-900 dark:text-gray-100"
                    />
                </div>
                <div>
                    <label htmlFor="email-signup" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                    <input
                        type="email"
                        id="email-signup"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 text-sm text-gray-900 dark:text-gray-100"
                    />
                </div>
                <div>
                    <label htmlFor="password-signup"  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                    <input
                        type="password"
                        id="password-signup"
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
                    {isLoading ? <LoaderCircle size={20} className="animate-spin" /> : <UserPlus size={20} />}
                    <span>Sign Up</span>
                </button>
            </form>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-primary-500 hover:underline">
                    Sign In
                </Link>
            </p>
        </div>
    );
};

export default SignUpPage;