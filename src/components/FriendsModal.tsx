import React, { useState, useRef } from 'react';
import { Friend, FriendRequest, TranslationStrings, UserProfile } from '../types';

interface FriendsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserProfile;
    friends: Friend[];
    friendRequests: FriendRequest[];
    translations: TranslationStrings;
    onAddFriend: (email: string) => void;
    onAcceptRequest: (requestId: string) => void;
    onRejectRequest: (requestId: string) => void;
}

export const FriendsModal: React.FC<FriendsModalProps> = ({
    isOpen,
    onClose,
    user,
    friends,
    friendRequests,
    translations,
    onAddFriend,
    onAcceptRequest,
    onRejectRequest
}) => {
    const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'add'>('friends');
    const [emailInput, setEmailInput] = useState('');
    const [showQR, setShowQR] = useState(false);
    const qrCanvasRef = useRef<HTMLCanvasElement>(null);

    if (!isOpen) return null;

    const generateQRCode = (text: string) => {
        const canvas = qrCanvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Create a simple visual QR code placeholder
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 200, 200);

        // Draw border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, 200, 200);

        // Draw QR-like pattern
        ctx.fillStyle = '#000000';
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 20; j++) {
                if (Math.random() > 0.5) {
                    ctx.fillRect(i * 10, j * 10, 8, 8);
                }
            }
        }

        // Add corner markers
        ctx.fillRect(10, 10, 30, 30);
        ctx.fillRect(160, 10, 30, 30);
        ctx.fillRect(10, 160, 30, 30);

        // Add text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('POOP MAP', 100, 100);
        ctx.fillText('INVITE', 100, 115);
    };

    const handleAddFriend = () => {
        if (emailInput.trim()) {
            onAddFriend(emailInput.trim());
            setEmailInput('');
        }
    };

    const generateInviteLink = () => {
        const baseUrl = window.location.origin;
        const inviteData = {
            email: user.email || '',
            name: user.name || '',
            picture: user.picture || '',
            timestamp: Date.now()
        };
        const encodedData = btoa(JSON.stringify(inviteData));
        return `${baseUrl}?invite=${encodedData}`;
    };

    const shareViaEmail = () => {
        const subject = `${user.name} invited you to Poop Map! 💩`;
        const body = `Hi there!

${user.name} (${user.email}) has invited you to join Poop Map - the fun way to track and share bathroom experiences!

🚽 What is Poop Map?
- Track your bathroom visits with ratings and photos
- Share experiences with friends (photos stay private!)
- Discover the best (and worst) bathroom spots
- Multi-language support

👥 Join ${user.name}'s friend network:
${generateInviteLink()}

Ready to drop some knowledge? 💩
`;
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    };

    const copyInviteLink = async () => {
        try {
            await navigator.clipboard.writeText(generateInviteLink());
            alert('邀請連結已複製到剪貼簿！\nInvite link copied to clipboard!');
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = generateInviteLink();
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('邀請連結已複製！\nInvite link copied!');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                            👥 {translations.friends}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl"
                        >
                            ×
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab('friends')}
                            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'friends' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                                }`}
                        >
                            {translations.friends} ({friends.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'requests' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                                }`}
                        >
                            {translations.friendRequests} ({friendRequests.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('add')}
                            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'add' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                                }`}
                        >
                            {translations.addFriend}
                        </button>
                    </div>

                    {/* Friends List */}
                    {activeTab === 'friends' && (
                        <div className="space-y-3">
                            {friends.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">
                                    No friends yet. Start adding some!
                                </p>
                            ) : (
                                friends.map((friend) => (
                                    <div key={friend.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                        <img
                                            src={friend.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.name)}`}
                                            alt={friend.name}
                                            className="w-10 h-10 rounded-full"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{friend.name}</p>
                                            <p className="text-sm text-gray-600">{friend.email}</p>
                                        </div>
                                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                            Friends
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Friend Requests */}
                    {activeTab === 'requests' && (
                        <div className="space-y-3">
                            {friendRequests.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">
                                    No pending friend requests.
                                </p>
                            ) : (
                                friendRequests.map((request) => (
                                    <div key={request.id} className="p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <img
                                                src={request.fromUserPicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(request.fromUserName)}`}
                                                alt={request.fromUserName}
                                                className="w-10 h-10 rounded-full"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{request.fromUserName}</p>
                                                <p className="text-sm text-gray-600">{request.fromUserEmail}</p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => onAcceptRequest(request.id)}
                                                className="flex-1 py-2 px-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                                            >
                                                {translations.acceptRequest}
                                            </button>
                                            <button
                                                onClick={() => onRejectRequest(request.id)}
                                                className="flex-1 py-2 px-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                                            >
                                                {translations.rejectRequest}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Add Friends */}
                    {activeTab === 'add' && (
                        <div className="space-y-6">
                            {/* Add by Email */}
                            <div>
                                <h3 className="font-medium text-gray-900 mb-3">📧 {translations.shareViaEmail}</h3>
                                <div className="flex space-x-2">
                                    <input
                                        type="email"
                                        value={emailInput}
                                        onChange={(e) => setEmailInput(e.target.value)}
                                        placeholder="friend@example.com"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                    <button
                                        onClick={handleAddFriend}
                                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                                    >
                                        {translations.addFriend}
                                    </button>
                                </div>
                            </div>

                            {/* Share Options */}
                            <div>
                                <h3 className="font-medium text-gray-900 mb-3">{translations.inviteFriend}</h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={shareViaEmail}
                                        className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <span className="text-2xl">📧</span>
                                            <div>
                                                <p className="font-medium text-blue-900">{translations.shareViaEmail}</p>
                                                <p className="text-sm text-blue-700">Send invitation via email</p>
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setShowQR(!showQR);
                                            if (!showQR) {
                                                // Generate QR code when showing
                                                setTimeout(() => generateQRCode(generateInviteLink()), 100);
                                            }
                                        }}
                                        className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <span className="text-2xl">📱</span>
                                            <div>
                                                <p className="font-medium text-green-900">{translations.shareViaQR}</p>
                                                <p className="text-sm text-green-700">Show QR code for scanning</p>
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={copyInviteLink}
                                        className="w-full p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <span className="text-2xl">🔗</span>
                                            <div>
                                                <p className="font-medium text-purple-900">{translations.shareViaLink}</p>
                                                <p className="text-sm text-purple-700">Copy invitation link</p>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* QR Code */}
                            {showQR && (
                                <div className="text-center">
                                    <h4 className="font-medium text-gray-900 mb-3">{translations.myQRCode}</h4>
                                    <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                                        <canvas
                                            ref={qrCanvasRef}
                                            width="200"
                                            height="200"
                                            className="border"
                                            onLoad={() => generateQRCode(generateInviteLink())}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Scan this QR code to add me as a friend
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};