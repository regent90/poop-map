import React, { useState, useEffect } from 'react';
import { UserProfile, Poop, Language, TranslationStrings, Friend, FriendRequest } from './types';
import { translations } from './constants';
import { PoopMap } from './components/PoopMap';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { PoopDetailsModal } from './components/PoopDetailsModal';
import { PoopDetailView } from './components/PoopDetailView';
import { FriendsModal } from './components/FriendsModal';
import { UserSwitcher } from './components/UserSwitcher';
import { PoopIcon, SpinnerIcon } from './components/icons';
import { Wrapper, Status } from "@googlemaps/react-wrapper";

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [poops, setPoops] = useState<Poop[]>([]);
  const [lang, setLang] = useState<Language>('en');
  const [isDropping, setIsDropping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [pendingPoopData, setPendingPoopData] = useState<{ lat: number, lng: number, address?: string, placeName?: string } | null>(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [selectedPoop, setSelectedPoop] = useState<Poop | null>(null);
  const [selectedPoopNumber, setSelectedPoopNumber] = useState(0);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [allPoops, setAllPoops] = useState<Poop[]>([]); // All poops including friends'

  const t: TranslationStrings = translations[lang];

  // Clean up localStorage on app start
  // Check storage usage (for monitoring only, no deletion)
  const checkStorageUsage = () => {
    try {
      const storageUsed = JSON.stringify(localStorage).length;
      const storageMB = (storageUsed / 1024 / 1024).toFixed(2);
      console.log(`📊 Storage usage: ${storageMB}MB`);
      
      if (storageUsed > 4000000) { // > 4MB
        console.warn('⚠️ Storage is getting full. Consider using cloud storage for production.');
      }
      
      // Count poops by user
      const keys = Object.keys(localStorage);
      const poopKeys = keys.filter(key => key.startsWith('poops_'));
      console.log(`💩 Total users with poop data: ${poopKeys.length}`);
      
      poopKeys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          const poops = JSON.parse(data);
          const userEmail = key.replace('poops_', '');
          console.log(`👤 ${userEmail}: ${poops.length} poops`);
        }
      });
    } catch (error) {
      console.error('Storage check failed:', error);
    }
  };

  useEffect(() => {
    // Load user from localStorage first
    const storedUser = localStorage.getItem('poopMapUser');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      loadPoops(userData.email);
      
      // Check storage usage (monitoring only, no deletion)
      checkStorageUsage();
    }

    // Load language preference
    const storedLang = localStorage.getItem('poopMapLang');
    if (storedLang && Object.keys(translations).includes(storedLang)) {
      setLang(storedLang as Language);
    } else {
      // Auto-detect browser language
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('zh-tw') || browserLang.startsWith('zh-hant')) {
        setLang('zh-TW');
      } else if (browserLang.startsWith('zh')) {
        setLang('zh-CN');
      } else if (browserLang.startsWith('ja')) {
        setLang('ja');
      } else if (browserLang.startsWith('ko')) {
        setLang('ko');
      } else if (browserLang.startsWith('es')) {
        setLang('es');
      } else if (browserLang.startsWith('fr')) {
        setLang('fr');
      } else if (browserLang.startsWith('de')) {
        setLang('de');
      }
    }
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('poopMapLang', newLang);
  };

  const loadPoops = (userEmail?: string) => {
    if (!userEmail) return;
    console.log('Loading poops for user:', userEmail);
    const storedPoops = localStorage.getItem(`poops_${userEmail}`);
    if (storedPoops) {
      const userPoops = JSON.parse(storedPoops);
      console.log('Found stored poops:', userPoops.length);

      // Fix old poops that don't have userId
      const fixedPoops = userPoops.map((poop: Poop) => ({
        ...poop,
        userId: poop.userId || userEmail, // Add userId if missing
        privacy: poop.privacy || 'private' // Add privacy if missing
      }));

      setPoops(fixedPoops);

      // Save the fixed poops back to localStorage only if there were actual changes
      const hasChanges = fixedPoops.some((poop: Poop, index: number) => {
        const originalPoop = userPoops[index];
        return !originalPoop?.userId || !originalPoop?.privacy;
      });
      
      if (hasChanges) {
        console.log('Fixing old poop data and saving...');
        localStorage.setItem(`poops_${userEmail}`, JSON.stringify(fixedPoops));
      }

      // Also update allPoops with user's poops
      setAllPoops(prevAllPoops => {
        // Remove old poops from this user and add new ones
        const otherUsersPoops = prevAllPoops.filter(poop => poop.userId !== userEmail);
        return [...otherUsersPoops, ...fixedPoops];
      });
    }
  };

  const savePoops = (newPoops: Poop[]) => {
    if (!user || !user.email) return;
    try {
      // Save all poop data including photos
      localStorage.setItem(`poops_${user.email}`, JSON.stringify(newPoops));
      console.log(`💾 Saved ${newPoops.length} poops for ${user.email}`);
    } catch (error) {
      console.error('Failed to save poops:', error);
      
      if (error instanceof DOMException && error.code === 22) {
        // Storage quota exceeded - inform user but don't delete data
        alert(`⚠️ 儲存空間已滿！
        
🔍 目前狀況：
• 你有 ${newPoops.length} 筆珍貴的便便記錄
• 瀏覽器儲存空間已達上限

💡 解決方案：
1. 匯出資料備份（建議）
2. 清理瀏覽器其他網站資料
3. 升級到雲端儲存版本

❌ 我們不會刪除你的便便記錄！`);
        
        // Try to save without photos as fallback
        try {
          const poopsWithoutPhotos = newPoops.map(poop => ({
            ...poop,
            photo: poop.photo ? '[Photo removed to save space]' : undefined
          }));
          localStorage.setItem(`poops_${user.email}`, JSON.stringify(poopsWithoutPhotos));
          console.log('💾 Saved poops without photos as fallback');
          alert('📷 照片已暫時移除以節省空間，其他資料已保存');
        } catch (e) {
          console.error('Even fallback save failed:', e);
          alert('❌ 無法儲存資料，請清理瀏覽器儲存空間');
        }
      }
    }
  };

  const handleLoginSuccess = async (tokenResponse: any) => {
    setIsLoading(true);
    try {
      // Fetch user info from Google
      const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenResponse.access_token}`);
      const userInfo = await response.json();

      const userData: UserProfile = {
        name: userInfo.name,
        email: userInfo.email,
        picture: userInfo.picture,
      };

      setUser(userData);
      localStorage.setItem('poopMapUser', JSON.stringify(userData));
      loadPoops(userData.email);
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setPoops([]);
    localStorage.removeItem('poopMapUser');
  };

  const addPoop = () => {
    setError(null);
    setIsDropping(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          // Get place information from Google Maps Geocoding API
          const geocoder = new (window as any).google.maps.Geocoder();
          const response = await new Promise((resolve, reject) => {
            geocoder.geocode(
              { location: { lat, lng } },
              (results: any, status: any) => {
                if (status === 'OK' && results[0]) {
                  resolve(results[0]);
                } else {
                  reject(new Error('Geocoding failed'));
                }
              }
            );
          });

          const result = response as any;
          const address = result.formatted_address;
          let placeName = '';

          // Try to find a place name from the address components
          for (const component of result.address_components) {
            if (component.types.includes('establishment') ||
              component.types.includes('point_of_interest')) {
              placeName = component.long_name;
              break;
            }
          }

          // Set pending data and show modal
          setPendingPoopData({
            lat,
            lng,
            address,
            placeName: placeName || undefined
          });
          setShowDetailsModal(true);
          setIsDropping(false);

        } catch (error) {
          console.error('Geocoding error:', error);
          // Fallback: show modal without place info
          setPendingPoopData({ lat, lng });
          setShowDetailsModal(true);
          setIsDropping(false);
        }
      },
      () => {
        setError(t.locationError);
        setIsDropping(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSavePoopDetails = (details: Partial<Poop>) => {
    if (!pendingPoopData || !user?.email) return;

    console.log('Saving poop details:', details);
    console.log('Current user:', user.email);

    const newPoop: Poop = {
      id: new Date().toISOString(),
      lat: pendingPoopData.lat,
      lng: pendingPoopData.lng,
      timestamp: Date.now(),
      rating: 3, // Default rating
      privacy: 'private', // Default privacy
      userId: user.email,
      ...details,
    };

    console.log('New poop created:', newPoop);

    const updatedPoops = [...poops, newPoop];
    console.log('Updated poops array:', updatedPoops.length);

    setPoops(updatedPoops);
    savePoops(updatedPoops);

    // Also add to all poops for visibility filtering
    const updatedAllPoops = [...allPoops, newPoop];
    setAllPoops(updatedAllPoops);

    // Reset modal state
    setShowDetailsModal(false);
    setPendingPoopData(null);

    console.log('Poop save completed');
  };

  const handleViewPoopDetails = (poop: Poop, poopNumber: number) => {
    setSelectedPoop(poop);
    setSelectedPoopNumber(poopNumber);
    setShowDetailView(true);
  };

  // Friend system functions
  const loadFriends = (userEmail: string) => {
    const storedFriends = localStorage.getItem(`friends_${userEmail}`);
    if (storedFriends) {
      setFriends(JSON.parse(storedFriends));
    }

    const storedRequests = localStorage.getItem(`friendRequests_${userEmail}`);
    if (storedRequests) {
      setFriendRequests(JSON.parse(storedRequests));
    }
  };

  const saveFriends = (newFriends: Friend[]) => {
    if (!user?.email) return;
    localStorage.setItem(`friends_${user.email}`, JSON.stringify(newFriends));
  };

  const saveFriendRequests = (newRequests: FriendRequest[]) => {
    if (!user?.email) return;
    localStorage.setItem(`friendRequests_${user.email}`, JSON.stringify(newRequests));
  };

  const handleAddFriend = (email: string) => {
    if (!user?.email || email === user.email) {
      alert('Cannot add yourself as a friend!');
      return;
    }

    // Check if already friends
    if (friends.some(friend => friend.email === email)) {
      alert('Already friends with this user!');
      return;
    }

    // Check if request already sent
    if (friendRequests.some(req => req.toUserEmail === email)) {
      alert('Friend request already sent to this user!');
      return;
    }

    // Create friend request
    const newRequest: FriendRequest = {
      id: Date.now().toString(),
      fromUserId: user.email,
      fromUserName: user.name || 'Unknown',
      fromUserEmail: user.email,
      fromUserPicture: user.picture,
      toUserEmail: email,
      timestamp: Date.now(),
      status: 'pending'
    };

    // Save to global friend requests (so other users can see it)
    const globalRequests = JSON.parse(localStorage.getItem('globalFriendRequests') || '[]');
    globalRequests.push(newRequest);
    localStorage.setItem('globalFriendRequests', JSON.stringify(globalRequests));

    // Add to target user's friend requests
    const targetRequests = JSON.parse(localStorage.getItem(`friendRequests_${email}`) || '[]');
    targetRequests.push(newRequest);
    localStorage.setItem(`friendRequests_${email}`, JSON.stringify(targetRequests));

    alert(`📤 Friend request sent to ${email}!\n\n💡 Tip: Switch to "${email}" user to see and accept the request!`);
  };

  const handleAcceptRequest = (requestId: string) => {
    const request = friendRequests.find(r => r.id === requestId);
    if (!request || !user?.email) return;

    // Add requester to current user's friends list
    const newFriend: Friend = {
      id: request.fromUserId,
      name: request.fromUserName,
      email: request.fromUserEmail,
      picture: request.fromUserPicture,
      status: 'accepted',
      addedAt: Date.now()
    };

    const updatedFriends = [...friends, newFriend];
    setFriends(updatedFriends);
    saveFriends(updatedFriends);

    // Add current user to requester's friends list (mutual friendship)
    const requesterFriends = JSON.parse(localStorage.getItem(`friends_${request.fromUserEmail}`) || '[]');
    const mutualFriend: Friend = {
      id: user.email,
      name: user.name || 'Unknown',
      email: user.email,
      picture: user.picture,
      status: 'accepted',
      addedAt: Date.now()
    };

    requesterFriends.push(mutualFriend);
    localStorage.setItem(`friends_${request.fromUserEmail}`, JSON.stringify(requesterFriends));

    // Remove from current user's requests
    const updatedRequests = friendRequests.filter(r => r.id !== requestId);
    setFriendRequests(updatedRequests);
    saveFriendRequests(updatedRequests);

    // Remove from global requests
    const globalRequests = JSON.parse(localStorage.getItem('globalFriendRequests') || '[]');
    const updatedGlobalRequests = globalRequests.filter((r: FriendRequest) => r.id !== requestId);
    localStorage.setItem('globalFriendRequests', JSON.stringify(updatedGlobalRequests));

    alert(`✅ You are now friends with ${request.fromUserName}!`);
  };

  const handleRejectRequest = (requestId: string) => {
    const updatedRequests = friendRequests.filter(r => r.id !== requestId);
    setFriendRequests(updatedRequests);
    saveFriendRequests(updatedRequests);
  };

  const handleSwitchUser = (newUser: UserProfile) => {
    // Save current user data
    if (user?.email) {
      localStorage.setItem('poopMapUser', JSON.stringify(user));
    }

    // Switch to new user
    setUser(newUser);
    localStorage.setItem('poopMapUser', JSON.stringify(newUser));

    // Load new user's data
    loadPoops(newUser.email);
    loadFriends(newUser.email || '');

    // Reset states
    setShowDetailsModal(false);
    setShowDetailView(false);
    setShowFriendsModal(false);
    setPendingPoopData(null);
    setSelectedPoop(null);

    console.log(`Switched to user: ${newUser.name} (${newUser.email})`);
  };

  // Load friends when user changes
  useEffect(() => {
    if (user?.email) {
      loadFriends(user.email);
    }
  }, [user]);

  // Handle invite links
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteData = urlParams.get('invite');

    if (inviteData && user?.email) {
      try {
        const decoded = JSON.parse(atob(inviteData));
        const { email: inviterEmail, name: inviterName, picture: inviterPicture } = decoded;

        if (inviterEmail && inviterEmail !== user.email) {
          // Check if already friends
          if (!friends.some(friend => friend.email === inviterEmail)) {
            const confirmAdd = confirm(
              `${inviterName} (${inviterEmail}) invited you to be friends on Poop Map!\n\nAccept friend request?`
            );

            if (confirmAdd) {
              const newFriend: Friend = {
                id: inviterEmail,
                name: inviterName || inviterEmail.split('@')[0],
                email: inviterEmail,
                picture: inviterPicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(inviterName || inviterEmail.split('@')[0])}&background=random&color=fff`,
                status: 'accepted',
                addedAt: Date.now()
              };

              const updatedFriends = [...friends, newFriend];
              setFriends(updatedFriends);
              saveFriends(updatedFriends);

              alert(`✅ You are now friends with ${inviterName}!`);
            }
          } else {
            alert(`You are already friends with ${inviterName}!`);
          }

          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (error) {
        console.error('Invalid invite link:', error);
      }
    }
  }, [user, friends]);

  // Filter poops based on privacy and friendship
  const getVisiblePoops = () => {
    if (!user?.email) return [];

    return allPoops.filter(poop => {
      // Always show own poops
      if (poop.userId === user.email) return true;

      // Check privacy settings for others' poops
      if (poop.privacy === 'private') return false;
      if (poop.privacy === 'public') return true;
      if (poop.privacy === 'friends') {
        return friends.some(friend => friend.email === poop.userId);
      }

      return false;
    });
  };

  // Friend system funct

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const render = (status: Status) => {
    if (status === Status.FAILURE) {
      return <div className="h-full w-full flex items-center justify-center bg-red-100"><p className="text-red-600">Error: Could not load Google Maps. Please check the API key.</p></div>;
    }
    return <div className="h-full w-full flex items-center justify-center bg-gray-200"><SpinnerIcon className="h-12 w-12 animate-spin text-gray-500" /></div>;
  };

  // Show login screen if user is not logged in
  if (!user) {
    return (
      <div className="relative h-screen w-screen">
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <SpinnerIcon className="h-12 w-12 animate-spin text-white" />
          </div>
        )}
        <LoginScreen onLoginSuccess={handleLoginSuccess} translations={t} />

        {/* Demo Mode Button */}
        <div className="absolute bottom-4 left-4">
          <button
            onClick={() => {
              const demoUser: UserProfile = {
                name: 'Demo User',
                email: 'demo@poopmap.com',
                picture: 'https://ui-avatars.com/api/?name=Demo+User&background=random&color=fff'
              };
              setUser(demoUser);
              loadPoops(demoUser.email);
            }}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            🚀 {t.language === 'zh-TW' ? '示範模式' : t.language === 'zh-CN' ? '演示模式' : 'Demo Mode'}
          </button>
        </div>

        <div className="absolute top-4 right-4">
          <div className="bg-white rounded-lg p-2 shadow-lg">
            <select
              value={lang}
              onChange={(e) => handleLanguageChange(e.target.value as Language)}
              className="border-none outline-none bg-transparent"
            >
              <option value="en">English</option>
              <option value="zh-TW">繁體中文</option>
              <option value="zh-CN">简体中文</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  // Main app for logged in users
  return (
    <div className="relative h-screen w-screen">
      {/* User Switcher for testing */}
      <UserSwitcher
        currentUser={user}
        onSwitchUser={handleSwitchUser}
        translations={t}
      />

      <Header
        user={user}
        onLogout={handleLogout}
        currentLang={lang}
        onLangChange={handleLanguageChange}
        translations={t}
        poops={poops}
        onViewPoopDetails={handleViewPoopDetails}
        onOpenFriends={() => setShowFriendsModal(true)}
        friendsCount={friends.length}
      />

      <Wrapper apiKey={apiKey} libraries={['marker']} render={render}>
        <PoopMap poops={getVisiblePoops()} />
      </Wrapper>

      <div className="absolute bottom-20 right-4 z-10 text-right">
        {error && <p className="bg-red-500 text-white p-2 rounded-md mb-2">{error}</p>}
        <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-lg">
          <p className="font-bold text-gray-800">{t.totalDrops}: <span className="text-amber-800">{poops.length}</span></p>
          {poops.length === 0 && <p className="text-sm text-gray-600">{t.noDropsYet}</p>}
          {poops.length > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              <p>最新便便: {new Date(poops[poops.length - 1]?.timestamp).toLocaleTimeString()}</p>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center space-y-2">
        <button
          onClick={addPoop}
          disabled={isDropping}
          className="flex items-center justify-center w-40 h-16 bg-amber-700 text-white rounded-full shadow-2xl hover:bg-amber-800 focus:outline-none focus:ring-4 focus:ring-amber-300 transition-all duration-300 ease-in-out transform hover:-translate-y-1 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isDropping ? (
            <>
              <SpinnerIcon className="animate-spin h-5 w-5 mr-3 text-white" />
              {t.dropping}
            </>
          ) : (
            <>
              <PoopIcon className="h-6 w-6 mr-2" />
              <span className="text-lg font-bold">{t.dropPoop}</span>
            </>
          )}
        </button>

        {/* Export data button */}
        <button
          onClick={() => {
            if (!user?.email) return;
            
            const exportData = {
              user: user,
              poops: poops,
              friends: friends,
              exportDate: new Date().toISOString(),
              version: '1.0'
            };
            
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `poop-map-backup-${user.name}-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            alert(`📥 便便記錄已匯出！
            
📊 匯出內容：
• ${poops.length} 筆便便記錄
• ${friends.length} 位好友
• 完整的個人資料

💾 檔案已下載到你的裝置`);
          }}
          className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
        >
          📥 匯出資料
        </button>
        
        {/* Test button for debugging */}
        <button
          onClick={() => {
            const testPoop: Poop = {
              id: 'test-' + Date.now(),
              lat: 25.0330, // 台北101附近
              lng: 121.5654,
              timestamp: Date.now(),
              rating: 4,
              placeName: '台北101',
              customLocation: '測試地點',
              privacy: 'public',
              userId: user?.email || 'demo',
            };
            const updatedPoops = [...poops, testPoop];
            setPoops(updatedPoops);
            savePoops(updatedPoops);
          }}
          className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
        >
          🧪 測試便便
        </button>

        {/* Add demo data button */}
        <button
          onClick={() => {
            if (!user?.email) return;

            // Add some demo poops for current user
            const demoPoops: Poop[] = [
              {
                id: 'demo-poop-1',
                lat: 25.0330,
                lng: 121.5654,
                timestamp: Date.now() - 3600000, // 1 hour ago
                rating: 4.5,
                placeName: '台北101',
                customLocation: '101大樓 B1 廁所',
                privacy: 'public',
                userId: user.email,
                notes: '很乾淨的廁所，五星推薦！'
              },
              {
                id: 'demo-poop-2',
                lat: 25.0417,
                lng: 121.5654,
                timestamp: Date.now() - 7200000, // 2 hours ago
                rating: 2.5,
                placeName: '台北車站',
                privacy: 'friends',
                userId: user.email,
                notes: '人太多了，有點吵'
              }
            ];

            const updatedPoops = [...poops, ...demoPoops];
            setPoops(updatedPoops);
            savePoops(updatedPoops);

            // Also add to allPoops
            const updatedAllPoops = [...allPoops, ...demoPoops];
            setAllPoops(updatedAllPoops);

            alert('Demo data added for current user!');
          }}
          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
        >
          🧪 添加示範資料
        </button>

        {/* Clear storage button */}
        <button
          onClick={() => {
            if (confirm('Clear all storage? This will remove all poop data!')) {
              localStorage.clear();
              setPoops([]);
              setAllPoops([]);
              setFriends([]);
              setFriendRequests([]);
              alert('Storage cleared!');
            }
          }}
          className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
        >
          🗑️ 清除資料
        </button>
      </div>

      {/* Poop Details Modal */}
      <PoopDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setPendingPoopData(null);
        }}
        onSave={handleSavePoopDetails}
        translations={t}
        initialData={pendingPoopData || undefined}
      />

      {/* Poop Detail View */}
      <PoopDetailView
        isOpen={showDetailView}
        onClose={() => {
          setShowDetailView(false);
          setSelectedPoop(null);
          setSelectedPoopNumber(0);
        }}
        poop={selectedPoop}
        translations={t}
        poopNumber={selectedPoopNumber}
      />

      {/* Friends Modal */}
      <FriendsModal
        isOpen={showFriendsModal}
        onClose={() => setShowFriendsModal(false)}
        user={user}
        friends={friends}
        friendRequests={friendRequests}
        translations={t}
        onAddFriend={handleAddFriend}
        onAcceptRequest={handleAcceptRequest}
        onRejectRequest={handleRejectRequest}
      />
    </div>
  );
};

export default App;