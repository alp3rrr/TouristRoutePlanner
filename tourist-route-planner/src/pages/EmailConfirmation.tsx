import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Alert } from '@mui/material';
import { authApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const EmailConfirmation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const calledRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
      return;
    }
    if (calledRef.current) return;
    calledRef.current = true;

    const email = searchParams.get('email');
    const token = searchParams.get('token');
    if (!email || !token) {
      setStatus('error');
      setMessage('Invalid confirmation link.');
      return;
    }

    authApi.confirmEmail({ email, token })
      .then(() => {
        setStatus('success');
        setMessage('Email confirmed! Redirecting to dashboard...');
        setTimeout(() => navigate('/dashboard'), 2000);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(
          typeof err.response?.data === 'string'
            ? err.response.data
            : err.response?.data?.message || 'Failed to confirm email.'
        );
      });
      
  }, [searchParams, navigate, isAuthenticated]);

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh">
      {status === 'loading' && <CircularProgress />}
      {status !== 'loading' && <Alert severity={status}>{message}</Alert>}
    </Box>
  );
};

export default EmailConfirmation; 