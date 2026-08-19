import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const result = await register(name, email, password, passwordConfirm);
    setLoading(false);
    if (result?.success) {
      navigate('/');
    } else {
      setError(result?.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] p-8">
        <h1 className="font-headline-lg text-headline-lg text-on-surface text-center mb-6">Create Account</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 text-error rounded-xl text-body-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-label-md font-label-md text-on-surface-variant mb-2">Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface"
              placeholder="John Doe"
              required
            />
          </div>
          <div>
            <label className="block text-label-md font-label-md text-on-surface-variant mb-2">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-label-md font-label-md text-on-surface-variant mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface"
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <label className="block text-label-md font-label-md text-on-surface-variant mb-2">Confirm Password</label>
            <input 
              type="password" 
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface"
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="w-full py-3 bg-primary text-on-primary rounded-full font-label-lg hover:bg-primary/90 transition-colors">
            Sign Up
          </button>
        </form>
        <p className="mt-6 text-center text-body-md text-on-surface-variant">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
