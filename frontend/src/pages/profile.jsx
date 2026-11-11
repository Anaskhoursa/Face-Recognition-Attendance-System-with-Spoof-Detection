import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile, changePassword, uploadProfileImage } from '../api/api';
import './profile.css';
import WebcamCapture from '../components/webCapture';
import Cookies from "js-cookie";

const ProfilePage = () => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('profile');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        phone_number: ''
    });
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [profileImage, setProfileImage] = useState(null);
    const [previewImage, setPreviewImage] = useState('');
    const user = JSON.parse(Cookies.get('details')?.toString() ?? '');
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const { data: profile, isLoading, error } = useQuery({
        queryKey: ['profile'],
        queryFn: getProfile,
    });

    const updateProfileMutation = useMutation({
        mutationFn: updateProfile,
        onSuccess: () => {
            queryClient.invalidateQueries(['profile']);
            alert('Profile updated successfully!');
        },
        onError: (error) => {
            alert(error.response?.data?.message || 'Failed to update profile');
        },
    });

    const changePasswordMutation = useMutation({
        mutationFn: changePassword,
        onSuccess: () => {
            setPasswordData({
                current_password: '',
                new_password: '',
                confirm_password: ''
            });
            alert('Password changed successfully!');
        },
        onError: (error) => {
            alert(error.response?.data?.message || 'Failed to change password');
        },
    });

    const uploadImageMutation = useMutation({
        mutationFn: uploadProfileImage,
        onSuccess: (data) => {
            queryClient.invalidateQueries(['profile']);
            setProfileImage(null);
            setPreviewImage('');
            alert('Profile image updated successfully!');
        },
        onError: (error) => {
            alert(error.response?.data?.message || 'Failed to upload image');
        },
    });

    useEffect(() => {
        if (profile?.message) {
            setFormData({
                username: profile.message.username || '',
                email: profile.message.email || '',
                first_name: profile.message.first_name || '',
                last_name: profile.message.last_name || '',
            });
        }
    }, [profile]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        updateProfileMutation.mutate(formData);
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        changePasswordMutation.mutate(passwordData);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageUpload = () => {
        if (!profileImage) {
            alert('Please select an image first');
            return;
        }

        const formData = new FormData();
        formData.append('profile_image', profileImage);
        uploadImageMutation.mutate(formData);
    };



    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();





            window.location.href = '/login';

        } catch (error) {
            console.error('Logout error:', error);
            alert('Failed to logout. Please try again.');
        } finally {
            setIsLoggingOut(false);
            setShowLogoutConfirm(false);
        }
    };

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const handleCancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    if (isLoading) {
        return (
            <div className="profile-loading">
                <div className="spinner"></div>
                <p>Loading profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-error">
                <div className="error-icon">⚠️</div>
                <h3>Error Loading Profile</h3>
                <p>{error.message}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    const userData = profile?.message || {};

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-header">
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <h1>My Profile</h1>
                        <div className="user-profile-section">
                            <div className="user-info-dropdown">
                                <div className="user-avatar-trigger">
                                    <div className="student-avatar">
                                        {user.profile_image ? (
                                            <img
                                                src={'https://anas044-attendance-nodejs.hf.space/api' + user.profile_image}
                                                className="profile-image"
                                                alt={user.first_name || 'User'}
                                            />
                                        ) : (
                                            <div className="avatar-initials">
                                                {user.first_name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="user-name">
                                        {user.firstName} {user.lastName}
                                        <span className="user-role">{user.role}</span>
                                    </div>
                                    <button className="dropdown-arrow">
                                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                                            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="user-dropdown-menu">
                                    <div className="dropdown-header">
                                        <div className="dropdown-avatar">
                                            {user.profile_image ? (
                                                <img
                                                    src={'https://anas044-attendance-nodejs.hf.space/api' + user.profile_image}
                                                    className="profile-image"
                                                    alt={user.first_name || 'User'}
                                                />
                                            ) : (
                                                <div className="avatar-initials-large">
                                                    {user.first_name?.charAt(0)?.toUpperCase() || 'U'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="dropdown-user-info">
                                            <div className="dropdown-user-name">
                                                {user.first_name} {user.last_name}
                                            </div>
                                            <div className="dropdown-user-email">
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="dropdown-divider"></div>

                                    <a href="/" className="dropdown-item">
                                        <span className="dropdown-icon">👤</span>
                                        <span>Dashboard</span>
                                    </a>



                                    <div className="dropdown-divider"></div>

                                    <button
                                        onClick={handleLogoutClick}
                                        className="dropdown-item logout-item"
                                        disabled={isLoggingOut}
                                    >
                                        <span className="dropdown-icon">🚪</span>
                                        <span>
                                            {isLoggingOut ? 'Logging out...' : 'Logout'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {showLogoutConfirm && (
                        <div className="logout-modal-overlay">
                            <div className="logout-modal">
                                <div className="logout-modal-header">
                                    <h3>Confirm Logout</h3>
                                    <button onClick={handleCancelLogout} className="close-modal-btn">
                                        ✕
                                    </button>
                                </div>

                                <div className="logout-modal-body">
                                    <div className="logout-warning-icon">⚠️</div>
                                    <p>Are you sure you want to logout?</p>
                                    <p className="logout-warning-text">
                                        You will need to login again to access the dashboard.
                                    </p>
                                </div>

                                <div className="logout-modal-actions">
                                    <button
                                        onClick={handleCancelLogout}
                                        className="logout-cancel-btn"
                                        disabled={isLoggingOut}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="logout-confirm-btn"
                                        disabled={isLoggingOut}
                                    >
                                        {isLoggingOut ? 'Logging out...' : 'Yes, Logout'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="profile-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            Profile Information
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
                            onClick={() => setActiveTab('password')}
                        >
                            Change Password
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'photo' ? 'active' : ''}`}
                            onClick={() => setActiveTab('photo')}
                        >
                            Profile Photo
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'photo' ? 'active' : ''}`}
                            onClick={() => setActiveTab('face')}
                        >
                            Save your face encoding
                        </button>
                    </div>
                </div>

                <div className="profile-content">
                    {activeTab === 'profile' && (
                        <div className="profile-section">
                            <div className="profile-info-card">
                                <div className="profile-avatar-section">
                                    <div className="profile-avatar">
                                        {userData.profile_image ? (
                                            <img
                                                src={'https://anas044-attendance-nodejs.hf.space/api' + userData.profile_image}
                                                alt={userData.username}
                                                className="avatar-image"
                                            />
                                        ) : (
                                            <div className="avatar-initials">
                                                {userData.first_name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="profile-basic-info">
                                        <h2>{userData.username}</h2>
                                        <p>{userData.email}</p>
                                        <p className="role-badge">{userData.role}</p>
                                    </div>
                                </div>

                                <form onSubmit={handleProfileSubmit} className="profile-form">
                                    <div className="form-grid">


                                        <div className="form-group">
                                            <label>Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="Enter email"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>First Name</label>
                                            <input
                                                type="text"
                                                name="first_name"
                                                value={formData.first_name}
                                                onChange={handleInputChange}
                                                placeholder="Enter first name"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Last Name</label>
                                            <input
                                                type="text"
                                                name="last_name"
                                                value={formData.last_name}
                                                onChange={handleInputChange}
                                                placeholder="Enter last name"
                                            />
                                        </div>


                                    </div>

                                    <div className="form-actions">
                                        <button
                                            type="submit"
                                            className="btn-primary"
                                            disabled={updateProfileMutation.isPending}
                                        >
                                            {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </div>


                        </div>
                    )}

                    {activeTab === 'password' && (
                        <div className="password-section">
                            <div className="password-card">
                                <h2>Change Password</h2>
                                <p className="section-description">
                                    Ensure your account is using a long, random password to stay secure.
                                </p>

                                <form onSubmit={handlePasswordSubmit} className="password-form">
                                    <div className="form-group">
                                        <label>Current Password</label>
                                        <input
                                            type="password"
                                            name="current_password"
                                            value={passwordData.current_password}
                                            onChange={handlePasswordChange}
                                            placeholder="Enter current password"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>New Password</label>
                                        <input
                                            type="password"
                                            name="new_password"
                                            value={passwordData.new_password}
                                            onChange={handlePasswordChange}
                                            placeholder="Enter new password"
                                            required
                                            minLength="6"
                                        />
                                        <small className="password-hint">
                                            Password must be at least 6 characters long
                                        </small>
                                    </div>

                                    <div className="form-group">
                                        <label>Confirm New Password</label>
                                        <input
                                            type="password"
                                            name="confirm_password"
                                            value={passwordData.confirm_password}
                                            onChange={handlePasswordChange}
                                            placeholder="Confirm new password"
                                            required
                                        />
                                    </div>

                                    <div className="form-actions">
                                        <button
                                            type="submit"
                                            className="btn-primary"
                                            disabled={changePasswordMutation.isPending}
                                        >
                                            {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
                                        </button>
                                    </div>
                                </form>

                                <div className="password-tips">
                                    <h4>Password Tips:</h4>
                                    <ul>
                                        <li>Use a combination of letters, numbers, and symbols</li>
                                        <li>Avoid using personal information</li>
                                        <li>Don't reuse passwords from other sites</li>
                                        <li>Consider using a password manager</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'photo' && (
                        <div className="photo-section">
                            <div className="photo-card">
                                <h2>Profile Photo</h2>
                                <p className="section-description">
                                    Update your profile photo. JPG, PNG or GIF (Max 5MB)
                                </p>

                                <div className="photo-upload-area">
                                    <div className="current-photo">
                                        <div className="photo-preview">
                                            {previewImage ? (
                                                <img src={previewImage} alt="Preview" />
                                            ) : userData.profile_image ? (
                                                <img src={'https://anas044-attendance-nodejs.hf.space/api' + userData.profile_image} alt="Current" />
                                            ) : (
                                                <div className="photo-placeholder">
                                                    <div className="placeholder-icon">📷</div>
                                                    <p>No photo</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="upload-controls">
                                        <div className="file-input-wrapper">
                                            <input
                                                type="file"
                                                id="profile-image"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="file-input"
                                            />
                                            <label htmlFor="profile-image" className="btn-secondary">
                                                Choose Image
                                            </label>
                                            {profileImage && (
                                                <span className="file-name">{profileImage.name}</span>
                                            )}
                                        </div>

                                        <button
                                            onClick={handleImageUpload}
                                            disabled={!profileImage || uploadImageMutation.isPending}
                                            className="btn-primary"
                                        >
                                            {uploadImageMutation.isPending ? 'Uploading...' : 'Upload Photo'}
                                        </button>
                                    </div>

                                    <div className="upload-tips">
                                        <h4>Photo Guidelines:</h4>
                                        <ul>
                                            <li>Use a clear, recent photo of yourself</li>
                                            <li>Face should be clearly visible</li>
                                            <li>Image size should not exceed 5MB</li>
                                            <li>Supported formats: JPG, PNG, GIF</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'face' && <WebcamCapture />}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;