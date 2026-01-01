import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';

export default function Auth() {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    async function handleGoogleLogin() {
        setError('');
        setLoading(true);
        try {
            await loginWithGoogle();
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={styles.container}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass"
                style={styles.card}
            >
                <h1 style={styles.title}>Tasker</h1>
                <p style={styles.subtitle}>
                    Plan smart, work together. Sign in to your shared space.
                </p>

                <div style={styles.authBox}>
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        style={styles.googleButton}
                    >
                        <img
                            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                            alt="Google"
                            style={styles.googleIcon}
                        />
                        <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
                    </button>

                    {error && <p style={styles.error}>{error}</p>}
                </div>

                <p style={styles.footerText}>
                    By signing in, you agree to collaborate and stay productive.
                </p>
            </motion.div>
        </div>
    );
}

const styles = {
    container: {
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-md)',
    },
    card: {
        width: '100%',
        maxWidth: '400px',
        padding: 'var(--spacing-lg)',
        textAlign: 'center',
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: '800',
        marginBottom: '0.5rem',
        color: 'var(--primary)',
        letterSpacing: '-0.02em',
    },
    subtitle: {
        color: 'var(--text-muted)',
        marginBottom: '3rem',
        fontSize: '1rem',
        lineHeight: '1.4',
    },
    authBox: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    googleButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '1rem',
        borderRadius: 'var(--radius-md)',
        background: 'white',
        color: '#333',
        fontSize: '1rem',
        fontWeight: '600',
        transition: 'transform 0.2s, box-shadow 0.2s',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    googleIcon: {
        width: '20px',
        height: '20px',
    },
    error: {
        color: 'var(--danger)',
        fontSize: '0.85rem',
        marginTop: '0.5rem',
    },
    footerText: {
        marginTop: '3rem',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
    }
};
