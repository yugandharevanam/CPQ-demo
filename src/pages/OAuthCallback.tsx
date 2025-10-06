import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../auth/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';

const OAuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const { handleOAuthCallback } = useAuth();
  const processedRef = useRef(false);
  
  useEffect(() => {
    // Prevent multiple executions
    if (processedRef.current || processing) {
      return;
    }

    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const errorParam = params.get('error');
    
    if (errorParam) {
      setError(errorParam);
      processedRef.current = true;
      return;
    }
    
    if (!code) {
      setError('No authentication code received');
      processedRef.current = true;
      return;
    }

    // Mark as processing and processed
    setProcessing(true);
    processedRef.current = true;
    
    
    handleOAuthCallback(code)
      .catch((err) => {
        console.error('OAuth callback error:', err);
        setError('Authentication failed. Please try again.');
        setProcessing(false);
      });
  }, [location.search, handleOAuthCallback, processing]);
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-600">Authentication Error</h2>
          <p className="text-gray-700 mt-4">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <LoadingSpinner />
      <p className="mt-4">
        {processing ? 'Processing authentication...' : 'Initializing...'}
      </p>
    </div>
  );
};

export default OAuthCallback;