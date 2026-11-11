import React, { useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getSessionToken } from '../api/api';
import { io } from 'socket.io-client';
import './jitsiMeeting.css';
import VerifyFace from '../components/verifyFace';
import Cookies from "js-cookie";
import { useState } from 'react';

const JitsiMeetingAPI = () => {
    const { sessionId } = useParams();
    const [searchParams] = useSearchParams();
    const containerRef = useRef(null);
    const apiRef = useRef(null);
    const socketRef = useRef(null);
    const [hasJoined, setHasJoined] = useState(false)

    const displayName = searchParams.get('displayName') || 'Participant';
    const email = searchParams.get('email') || '';
    const roomName = sessionId || 'default-room';
    const cookie = Cookies.get('details')
    const user = JSON.parse(cookie?.toString() ?? '');

    const userId = user.user_id;

    console.log(userId)

    const {
        data: token,
        isLoading,
        isError,
        error,
        refetch: refetchToken
    } = useQuery({
        queryKey: ['sessionToken', sessionId],
        queryFn: () => getSessionToken({ session_id: sessionId }),
        enabled: !!sessionId,
        retry: 2,
    });

    // Socket.io connection
    useEffect(() => {
        if (!token || !sessionId || !userId || !hasJoined) return;

        const socketUrl = 'https://anas044-attendance-nodejs.hf.space';

        const socket = io({
            withCredentials: true,
            transports: ["websocket"],
            query: {
                userId: userId,
                sessionId: sessionId
            }
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Socket connected for attendance tracking');

            socket.emit('join', {
                userId: userId,
                sessionId: sessionId,
                joinedAt: new Date().toISOString()
            });
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [token, sessionId, userId, hasJoined]);

    useEffect(() => {
        if (!token || !containerRef.current) return;

        const script = document.createElement('script');
        script.src = 'https://8x8.vc/external_api.js';
        script.async = true;

        script.onload = () => {
            const { JitsiMeetExternalAPI } = window;

            const domain = '8x8.vc';
            const options = {
                roomName: `vpaas-magic-cookie-af14ee6b9535490ab98f4552fcbbe618/${token.room_name || roomName}`,
                parentNode: containerRef.current,
                width: '100%',
                height: '100%',
                jwt: token.message,
                userInfo: {
                    displayName: displayName,
                    email: email,
                },
                configOverwrite: {
                    startWithAudioMuted: true,
                    startWithVideoMuted: false,
                    prejoinPageEnabled: false,
                    disableDeepLinking: true,
                    disableInviteFunctions: true,
                },
                interfaceConfigOverwrite: {
                    DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                    SHOW_BRAND_WATERMARK: false,
                    SHOW_POWERED_BY: false,
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_WATERMARK_FOR_GUESTS: false,
                    MOBILE_APP_PROMO: false,
                    TOOLBAR_BUTTONS: [
                        'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                        'fodeviceselection', 'hangup', 'profile', 'info', 'chat', 'recording',
                        'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                        'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                        'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                        'security'
                    ],
                },
            };

            console.log('Initializing Jitsi meeting');

            apiRef.current = new JitsiMeetExternalAPI(domain, options);

            // Jitsi event handlers
            apiRef.current.on('videoConferenceJoined', () => {
                console.log('Joined Jitsi meeting');
                setHasJoined(true)
            });

            apiRef.current.on('videoConferenceLeft', () => {
                console.log('Left Jitsi meeting - Disconnecting socket');

                setHasJoined(false)
                if (socketRef.current) {
                    socketRef.current.disconnect();
                    socketRef.current = null;
                }

                // Redirect
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            });

            apiRef.current.on('readyToClose', () => {
                console.log('Jitsi meeting ended for all - Disconnecting socket');

                // MANUALLY DISCONNECT SOCKET when meeting ends
                if (socketRef.current) {
                    socketRef.current.disconnect();
                    socketRef.current = null;
                }

                if (apiRef.current) {
                    apiRef.current.dispose();
                }

                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            });
        };

        script.onerror = (error) => {
            console.error('Failed to load Jitsi API script:', error);
        };

        document.body.appendChild(script);

        return () => {
            // Clean up Jitsi
            if (apiRef.current) {
                try {
                    apiRef.current.dispose();
                } catch (e) {
                    console.error('Error disposing Jitsi API:', e);
                }
            }

            // Clean up script
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }

            // Disconnect socket if still connected (tab closing)
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [token, roomName, displayName, email]);

    const onClose = () => {
        refetchToken();
    };

    if (isLoading) {
        return (
            <div className="jitsi-loading">
                <div className="spinner"></div>
                <p>Initializing meeting session...</p>
            </div>
        );
    }

    if (error?.response?.data?.message === 'verify your face') {
        return (
            <div className="jitsi-error">
                <h3>Please verify your face to join the meeting</h3>
                <VerifyFace session_id={sessionId} onClose={() => onClose()} />
            </div>
        );
    }

    if (isError || !sessionId) {
        return (
            <div className="jitsi-error">
                <h3>Failed to join meeting</h3>
                <p>{error?.response?.data?.message || 'Invalid session ID'}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    return (
        <div className="jitsi-container">
            <div className="jitsi-header">
                <h2>Meeting: {roomName}</h2>
                <span>Joined as: {displayName}</span>
            </div>
            <div ref={containerRef} className="jitsi-meet-container" />
        </div>
    );
};

export default JitsiMeetingAPI;