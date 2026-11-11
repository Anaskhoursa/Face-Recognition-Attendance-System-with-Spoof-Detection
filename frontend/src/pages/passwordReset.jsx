import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { 
    requestPasswordReset, 
    verifyResetCode, 
    resetPassword 
} from '../api/api';
import './passwordReset.css';

const PasswordResetPage = () => {
    const [step, setStep] = useState(1); 
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [storedEmail, setStoredEmail] = useState('');

    const requestResetMutation = useMutation({
        mutationFn: requestPasswordReset,
        onSuccess: (data) => {
            setStoredEmail(email);
            setStep(2);
        },
        onError: (error) => {
            alert(error.response?.data?.message || 'Failed to send reset code');
        },
    });

    const verifyCodeMutation = useMutation({
        mutationFn: () => verifyResetCode({email:storedEmail, code}),
        onSuccess: () => {
            setStep(3);
        },
        onError: (error) => {
            alert(error.response?.data?.message || 'Invalid or expired code');
        },
    });

    const resetPasswordMutation = useMutation({
        mutationFn: () => resetPassword({email:storedEmail, code, new_password:password, confirm_password:confirmPassword}),
        onSuccess: () => {
            alert('Password reset successfully! You can now log in with your new password.');
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        },
        onError: (error) => {
            alert(error.response?.data?.message || 'Failed to reset password');
        },
    });

    const handleEmailSubmit = (e) => {
        e.preventDefault();
        if (!email.trim()) {
            alert('Please enter your email');
            return;
        }
        requestResetMutation.mutate({email});
    };

    const handleCodeSubmit = (e) => {
        e.preventDefault();
        if (!code.trim() || code.length !== 6) {
            alert('Please enter the 6-digit code');
            return;
        }
        verifyCodeMutation.mutate();
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (!password.trim()) {
            alert('Please enter a new password');
            return;
        }
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }
        resetPasswordMutation.mutate();
    };

    const handleResendCode = () => {
        if (!storedEmail) return;
        requestResetMutation.mutate({email:storedEmail});
        alert('New code sent to your email');
    };

    const renderStepIndicator = () => (
        <div className="step-indicator">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>
                <div className="step-number">1</div>
                <div className="step-label">Enter Email</div>
            </div>
            <div className="step-line"></div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
                <div className="step-number">2</div>
                <div className="step-label">Verify Code</div>
            </div>
            <div className="step-line"></div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>
                <div className="step-number">3</div>
                <div className="step-label">New Password</div>
            </div>
        </div>
    );

    return (
        <div className="password-reset-page">
            <div className="password-reset-container">
                <div className="password-reset-header">
                    <h1>Reset Your Password</h1>
                    <p>Follow the steps below to reset your password</p>
                </div>

                {renderStepIndicator()}

                <div className="password-reset-content">
                    {step === 1 && (
                        <div className="step-container">
                            <form onSubmit={handleEmailSubmit} className="password-reset-form">
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email address"
                                        required
                                        disabled={requestResetMutation.isPending}
                                    />
                                    <small className="form-hint">
                                        Enter the email associated with your account
                                    </small>
                                </div>

                                <button
                                    type="submit"
                                    className="btn-primary1"
                                    disabled={requestResetMutation.isPending}
                                >
                                    {requestResetMutation.isPending ? 'Sending...' : 'Send Reset Code'}
                                </button>

                                <div className="back-to-login">
                                    <a href="/login">Back to Login</a>
                                </div>
                            </form>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="step-container">
                            <div className="step-info">
                                <h3>Check Your Email</h3>
                                <p>
                                    We sent a 6-digit code to <strong>{storedEmail}</strong>. 
                                    Enter it below to continue.
                                </p>
                            </div>

                            <form onSubmit={handleCodeSubmit} className="password-reset-form">
                                <div className="form-group">
                                    <label>Verification Code</label>
                                    <div className="code-input-container">
                                        <input
                                            type="text"
                                            value={code}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '');
                                                setCode(value.slice(0, 6));
                                            }}
                                            placeholder="000000"
                                            maxLength="6"
                                            required
                                            disabled={verifyCodeMutation.isPending}
                                            className="code-input"
                                        />
                                        <div className="code-length">
                                            {code.length}/6
                                        </div>
                                    </div>
                                    <small className="form-hint">
                                        Enter the 6-digit code from your email
                                    </small>
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="button"
                                        onClick={handleResendCode}
                                        className="btn-secondary1"
                                        disabled={requestResetMutation.isPending}
                                    >
                                        {requestResetMutation.isPending ? 'Resending...' : 'Resend Code'}
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary1"
                                        disabled={verifyCodeMutation.isPending || code.length !== 6}
                                    >
                                        {verifyCodeMutation.isPending ? 'Verifying...' : 'Verify Code'}
                                    </button>
                                </div>

                                <div className="change-email">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="text-link"
                                    >
                                        Use different email
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="step-container">
                            <div className="step-info">
                                <h3>Create New Password</h3>
                                <p>
                                    Create a new password for <strong>{storedEmail}</strong>
                                </p>
                            </div>

                            <form onSubmit={handlePasswordSubmit} className="password-reset-form">
                                <div className="form-group">
                                    <label>New Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        required
                                        minLength="6"
                                        disabled={resetPasswordMutation.isPending}
                                    />
                                    <small className="form-hint">
                                        Minimum 6 characters
                                    </small>
                                </div>

                                <div className="form-group">
                                    <label>Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        required
                                        disabled={resetPasswordMutation.isPending}
                                    />
                                </div>

                                <div className="password-requirements">
                                    <h4>Password Requirements:</h4>
                                    <ul>
                                        <li className={password.length >= 6 ? 'met' : ''}>
                                            At least 6 characters long
                                        </li>
                                        <li className={password === confirmPassword && password ? 'met' : ''}>
                                            Passwords match
                                        </li>
                                    </ul>
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className="btn-secondary1"
                                        disabled={resetPasswordMutation.isPending}
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary1"
                                        disabled={resetPasswordMutation.isPending || !password || !confirmPassword}
                                    >
                                        {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {resetPasswordMutation.isSuccess && (
                    <div className="success-message">
                        <div className="success-icon">✅</div>
                        <h3>Password Reset Successful!</h3>
                        <p>You will be redirected to the login page shortly.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PasswordResetPage;