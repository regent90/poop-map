import React, { useState, useEffect } from 'react';
import { UserProfile, Poop, Language, TranslationStrings, Friend, FriendRequest } from './types';
import { translations } from './constants';
import { PoopMap } from './components/PoopMap';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { PoopDetailsModal } from './components/PoopDetailsModal';
import { PoopDetailView } from './components/PoopDetailView';
import { PoopDetailModal } from './components/PoopDetailModal';
import { FriendsModal } from './components/FriendsModal';
import { UserSwitcher } from './components/UserSwitcher';
import { PoopIcon, SpinnerIcon } from './components/icons';
import { Wrapper, Status } from "@googlemaps/react-wrapper";
// Firebase imports
import './firebase'; // Initialize Firebase
import { checkFirebaseConnection, getFirebaseConnectionStatus } from './firebase';
import { 
  savePoopToCloud, 
  getUserPoops, 
  getFriendsPoops, 
  getPublicPoops,
  saveFriendToCloud,
  getUserFriends,
  sendFriendRequest,
  getUserFriendRequests,
  updateFriendRequestStatus,
  subscribeToUserPoops,
  subscribeToFriendRequests
} from './services/database';

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
  const [showPoopDetailModal, setShowPoopDetailModal] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [allPoops, setAllPoops] = useState<Poop[]>([]); // All poops including friends'
  const [useFirebase, setUseFirebase] = useState(true); // Toggle between Firebase and localStorage
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [firebaseReady, setFirebaseReady] = useState(false);

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

  // Check Firebase configuration
  useEffect(() => {
    const checkFirebaseConfig = () => {
      const hasApiKey = !!import.meta.env.VITE_FIREBASE_API_KEY;
      const hasProjectId = !!import.meta.env.VITE_FIREBASE_PROJECT_ID;
      
      console.log('🔥 Firebase Config Check:', {
        hasApiKey,
        hasProjectId,
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.substring(0, 10) + '...',
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
      });
      
      setFirebaseReady(hasApiKey && hasProjectId);
      
      if (!hasApiKey || !hasProjectId) {
        console.warn('⚠️ Firebase not configured properly, using localStorage only');
        setUseFirebase(false);
      }
    };
    
    checkFirebaseConfig();
  }, []);

  // Monitor online status and Firebase connection
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      console.log('🌐 Network: Online');
      
      // Test Firebase connection when coming back online
      if (useFirebase) {
        const isFirebaseConnected = await checkFirebaseConnection();
        console.log(`🔥 Firebase: ${isFirebaseConnected ? 'Connected' : 'Blocked/Offline'}`);
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      console.log('🌐 Network: Offline');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial connection check
    handleOnline();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [useFirebase]);

  useEffect(() => {
    // Load user from localStorage first
    const storedUser = localStorage.getItem('poopMapUser');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      
      // Check storage usage (monitoring only, no deletion)
      checkStorageUsage();
    }
  }, []);

  // Load user data when Firebase is ready or user changes
  useEffect(() => {
    if (user?.email) {
      if (useFirebase && isOnline && firebaseReady) {
        console.log('🔄 Auto-loading Firebase data for:', user.email);
        loadFirebaseData(user.email);
      } else {
        console.log('📱 Loading local data for:', user.email);
        loadPoops(user.email);
        loadFriends(user.email);
      }
    }
  }, [user, useFirebase, isOnline, firebaseReady]);

  // Set up real-time listeners for Firebase
  useEffect(() => {
    if (user?.email && useFirebase && isOnline && firebaseReady) {
      console.log('🔄 Setting up real-time listeners for:', user.email);
      
      // Listen to friend requests
      const unsubscribeFriendRequests = subscribeToFriendRequests(
        user.email,
        (requests) => {
          console.log(`📨 Real-time update: ${requests.length} friend requests for ${user.email}`);
          console.log('Friend requests:', requests.map(r => ({ from: r.fromUserEmail, status: r.status })));
          setFriendRequests(requests);
        }
      );

      // Listen to user's poops
      const unsubscribePoops = subscribeToUserPoops(
        user.email,
        (userPoops) => {
          console.log(`💩 Received ${userPoops.length} user poops via real-time listener`);
          setPoops(userPoops);
          
          // Update allPoops with the new user poops
          setAllPoops(prevAllPoops => {
            // Remove old user poops and add new ones
            const otherPoops = prevAllPoops.filter(poop => poop.userId !== user.email);
            return [...userPoops, ...otherPoops];
          });
        }
      );

      // Cleanup listeners on unmount or user change
      return () => {
        console.log('🔄 Cleaning up real-time listeners');
        unsubscribeFriendRequests();
        unsubscribePoops();
      };
    }
  }, [user?.email, useFirebase, isOnline, firebaseReady]);

  useEffect(() => {
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

  const savePoops = async (newPoops: Poop[]) => {
    if (!user || !user.email) return;
    
    // Always save to localStorage as backup
    try {
      localStorage.setItem(`poops_${user.email}`, JSON.stringify(newPoops));
      console.log(`💾 Saved ${newPoops.length} poops to localStorage for ${user.email}`);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
    
    // Save to Firebase if online and connected
    if (useFirebase && isOnline) {
      try {
        // Check Firebase connection first
        const isConnected = await checkFirebaseConnection();
        if (!isConnected) {
          console.warn('🔴 Firebase connection failed, saving to localStorage only');
          return;
        }

        // Save each new poop to Firebase
        const lastPoop = newPoops[newPoops.length - 1];
        if (lastPoop && !lastPoop.id.includes('firebase-')) {
          const firebaseId = await savePoopToCloud(lastPoop);
          console.log(`☁️ Saved poop to Firebase with ID: ${firebaseId}`);
          
          // Update the poop with Firebase ID
          const updatedPoops = [...newPoops];
          updatedPoops[updatedPoops.length - 1] = {
            ...lastPoop,
            id: `firebase-${firebaseId}`
          };
          setPoops(updatedPoops);
          
          // Update localStorage with Firebase ID
          localStorage.setItem(`poops_${user.email}`, JSON.stringify(updatedPoops));
        }
      } catch (error) {
        console.error('Failed to save to Firebase:', error);
        
        // Check if it's a network/blocking issue
        if (error.message?.includes('ERR_BLOCKED_BY_CLIENT') || 
            error.message?.includes('network') ||
            error.code === 'unavailable') {
          console.log('🚫 Firebase blocked by ad blocker or network issue - using offline mode');
        } else {
          console.log('📱 Saved to localStorage only (offline mode)');
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
          // Try to get place information from Google Maps Geocoding API
          const geocoder = new (window as any).google.maps.Geocoder();
          const response = await new Promise((resolve, reject) => {
            geocoder.geocode(
              { location: { lat, lng } },
              (results: any, status: any) => {
                console.log('🗺️ Geocoding status:', status);
                if (status === 'OK' && results[0]) {
                  console.log('✅ Geocoding successful:', results[0].formatted_address);
                  resolve(results[0]);
                } else {
                  console.warn('⚠️ Geocoding failed with status:', status);
                  // Don't reject, just resolve with null to continue without address
                  resolve(null);
                }
              }
            );
          });

          const result = response as any;
          let address = '';
          let placeName = '';

          if (result) {
            // Geocoding successful
            address = result.formatted_address;
            
            // Try to find a place name from the address components
            for (const component of result.address_components) {
              if (component.types.includes('establishment') ||
                component.types.includes('point_of_interest')) {
                placeName = component.long_name;
                break;
              }
            }
          } else {
            console.log('📍 Proceeding without address information');
          }

          // Set pending data and show modal
          setPendingPoopData({
            lat,
            lng,
            address: address || undefined,
            placeName: placeName || undefined
          });
          setShowPoopModal(true);
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

  const loadFirebaseData = async (userEmail: string) => {
    if (!userEmail) return;
    
    try {
      console.log('Loading data from Firebase for:', userEmail);
      
      // Load user's poops
      const userPoops = await getUserPoops(userEmail);
      setPoops(userPoops);
      console.log(`Loaded ${userPoops.length} user poops from Firebase`);
      
      // Load friends
      const userFriends = await getUserFriends(userEmail);
      setFriends(userFriends);
      console.log(`Loaded ${userFriends.length} friends from Firebase`);
      
      // Load friend requests
      const requests = await getUserFriendRequests(userEmail);
      setFriendRequests(requests);
      console.log(`Loaded ${requests.length} friend requests from Firebase`);
      
      // Load friends' poops and public poops
      const friendEmails = userFriends.map(f => f.email);
      const [friendsPoops, publicPoops] = await Promise.all([
        getFriendsPoops(friendEmails),
        getPublicPoops()
      ]);
      
      // Combine all visible poops
      const allVisiblePoops = [
        ...userPoops,
        ...friendsPoops,
        ...publicPoops.filter(poop => poop.userId !== userEmail) // Avoid duplicates
      ];
      
      // Remove duplicates
      const uniquePoops = allVisiblePoops.filter((poop, index, self) => 
        index === self.findIndex(p => p.id === poop.id)
      );
      
      setAllPoops(uniquePoops);
      console.log(`Total visible poops: ${uniquePoops.length}`);
      
    } catch (error) {
      console.error('Error loading Firebase data:', error);
      // Fallback to localStorage
      loadPoops(userEmail);
      loadFriends(userEmail);
    }
  };

  const loadFriendsPoops = () => {
    if (useFirebase && isOnline && user?.email) {
      loadFirebaseData(user.email);
      return;
    }
    
    if (!user?.email) return;
    
    console.log('Loading friends poops from localStorage for:', friends.length, 'friends');
    
    // Start with current user's poops
    let allVisiblePoops = [...poops];
    
    // Load each friend's poops
    friends.forEach(friend => {
      const friendPoops = localStorage.getItem(`poops_${friend.email}`);
      if (friendPoops) {
        try {
          const parsedPoops: Poop[] = JSON.parse(friendPoops);
          console.log(`Found ${parsedPoops.length} poops for friend ${friend.name}`);
          
          // Filter based on privacy settings
          const visibleFriendPoops = parsedPoops.filter(poop => {
            // Always show public poops
            if (poop.privacy === 'public') return true;
            
            // Show friends-only poops if we're friends
            if (poop.privacy === 'friends') return true;
            
            // Never show private poops
            return false;
          });
          
          console.log(`${visibleFriendPoops.length} visible poops from ${friend.name}`);
          allVisiblePoops = [...allVisiblePoops, ...visibleFriendPoops];
        } catch (error) {
          console.error(`Error loading poops for ${friend.email}:`, error);
        }
      }
    });
    
    // Remove duplicates and update allPoops
    const uniquePoops = allVisiblePoops.filter((poop, index, self) => 
      index === self.findIndex(p => p.id === poop.id)
    );
    
    console.log(`Total visible poops: ${uniquePoops.length}`);
    setAllPoops(uniquePoops);
  };

  const saveFriends = (newFriends: Friend[]) => {
    if (!user?.email) return;
    localStorage.setItem(`friends_${user.email}`, JSON.stringify(newFriends));
  };

  const saveFriendRequests = (newRequests: FriendRequest[]) => {
    if (!user?.email) return;
    localStorage.setItem(`friendRequests_${user.email}`, JSON.stringify(newRequests));
  };

  const handleAddFriend = async (email: string) => {
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

    try {
      if (useFirebase && isOnline && firebaseReady) {
        // Send to Firebase
        const firebaseId = await sendFriendRequest(newRequest);
        console.log('✅ Friend request sent to Firebase with ID:', firebaseId);
        alert(`📤 Friend request sent to ${email}!\n\n🔄 The request will appear in real-time on their device!`);
      } else {
        // Fallback to localStorage
        console.log('📱 Using localStorage fallback for friend request');
        
        // Save to global friend requests (so other users can see it)
        const globalRequests = JSON.parse(localStorage.getItem('globalFriendRequests') || '[]');
        globalRequests.push(newRequest);
        localStorage.setItem('globalFriendRequests', JSON.stringify(globalRequests));

        // Add to target user's friend requests
        const targetRequests = JSON.parse(localStorage.getItem(`friendRequests_${email}`) || '[]');
        targetRequests.push(newRequest);
        localStorage.setItem(`friendRequests_${email}`, JSON.stringify(targetRequests));

        alert(`📤 Friend request sent to ${email}!\n\n💡 Tip: Switch to "${email}" user to see and accept the request!`);
      }
    } catch (error) {
      console.error('❌ Failed to send friend request:', error);
      alert('❌ Failed to send friend request. Please try again.');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    console.log('🔄 Accepting friend request:', requestId);
    const request = friendRequests.find(r => r.id === requestId);
    
    if (!request) {
      console.error('❌ Friend request not found:', requestId);
      alert('❌ Friend request not found');
      return;
    }
    
    if (!user?.email) {
      console.error('❌ User email not found');
      alert('❌ User not logged in');
      return;
    }

    console.log('📋 Request details:', request);
    console.log('👤 Current user:', user.email);
    console.log('🔧 Firebase status:', { useFirebase, isOnline, firebaseReady });

    try {
      if (useFirebase && isOnline && firebaseReady) {
        console.log('🔄 Step 1: Updating request status in Firebase...');
        await updateFriendRequestStatus(requestId, 'accepted');
        console.log('✅ Step 1 complete: Friend request status updated');

        console.log('🔄 Step 2: Adding requester to current user\'s friends...');
        // Add requester to current user's friends list in Firebase
        const newFriend: Friend = {
          id: request.fromUserId,
          name: request.fromUserName,
          email: request.fromUserEmail,
          picture: request.fromUserPicture,
          status: 'accepted',
          addedAt: Date.now()
        };

        await saveFriendToCloud(user.email, newFriend);
        console.log('✅ Step 2 complete: Added requester to current user\'s friends');

        console.log('🔄 Step 3: Adding current user to requester\'s friends...');
        // Add current user to requester's friends list (mutual friendship)
        const mutualFriend: Friend = {
          id: user.email,
          name: user.name || 'Unknown',
          email: user.email,
          picture: user.picture,
          status: 'accepted',
          addedAt: Date.now()
        };

        await saveFriendToCloud(request.fromUserEmail, mutualFriend);
        console.log('✅ Step 3 complete: Added current user to requester\'s friends');

        console.log('🔄 Step 4: Updating local state...');
        // Update local state (real-time listeners will also update this)
        const updatedFriends = [...friends, newFriend];
        setFriends(updatedFriends);
        console.log('✅ Step 4 complete: Local state updated');

        alert(`✅ Friend request accepted!\n\n👥 You and ${request.fromUserName} are now friends!`);
      } else {
        // Fallback to localStorage
        console.log('📱 Using localStorage fallback for accepting friend request');
        
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
        
        // Reload friends' poops after accepting friend request
        setTimeout(() => {
          loadFriendsPoops();
        }, 100);
      }
    } catch (error) {
      console.error('❌ Failed to accept friend request:', error);
      console.error('Error details:', error);
      
      // Check if it's a permission error
      if (error.code === 'permission-denied') {
        alert('❌ Permission denied. Please check Firestore security rules.');
      } else if (error.code === 'not-found') {
        alert('❌ Friend request not found in database.');
      } else {
        alert(`❌ Failed to accept friend request: ${error.message}`);
      }
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      if (useFirebase && isOnline && firebaseReady) {
        // Update request status in Firebase
        await updateFriendRequestStatus(requestId, 'rejected');
        console.log('✅ Friend request rejected in Firebase');
        
        // Local state will be updated by real-time listener
        alert('❌ Friend request rejected');
      } else {
        // Fallback to localStorage
        console.log('📱 Using localStorage fallback for rejecting friend request');
        const updatedRequests = friendRequests.filter(r => r.id !== requestId);
        setFriendRequests(updatedRequests);
        saveFriendRequests(updatedRequests);
      }
    } catch (error) {
      console.error('❌ Failed to reject friend request:', error);
      alert('❌ Failed to reject friend request. Please try again.');
    }
  };

  // 處理地圖上便便標記的點擊
  const handlePoopClick = (poop: Poop) => {
    console.log('🗺️ Poop clicked from map:', poop.id);
    setSelectedPoop(poop);
    setShowPoopDetailModal(true);
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

  // Load friends' poops when friends list changes
  useEffect(() => {
    if (user?.email && friends.length > 0) {
      loadFriendsPoops();
    }
  }, [friends, user]);

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

  // Debug API key loading
  console.log('🗺️ Google Maps API Key loaded:', apiKey ? 'Yes' : 'No');
  console.log('🔑 API Key length:', apiKey.length);

  // Check for ad blocker
  useEffect(() => {
    const checkAdBlocker = () => {
      // Create a test element that ad blockers typically block
      const testAd = document.createElement('div');
      testAd.innerHTML = '&nbsp;';
      testAd.className = 'adsbox';
      testAd.style.position = 'absolute';
      testAd.style.left = '-10000px';
      document.body.appendChild(testAd);
      
      setTimeout(() => {
        const isBlocked = testAd.offsetHeight === 0;
        if (isBlocked) {
          console.warn('🚫 Ad blocker detected - this may interfere with Google Maps loading');
        }
        document.body.removeChild(testAd);
      }, 100);
    };
    
    checkAdBlocker();
  }, []);

  const render = (status: Status) => {
    console.log('🗺️ Google Maps loading status:', status);
    
    // SUCCESS: Return null to show the PoopMap component
    if (status === Status.SUCCESS) {
      console.log('✅ Google Maps loaded successfully - showing map');
      return null;
    }
    
    if (status === Status.FAILURE) {
      let errorMessage = 'Failed to load Google Maps.';
      let troubleshooting = [];
      
      if (!apiKey) {
        errorMessage = 'Google Maps API key is missing.';
        troubleshooting.push('Check environment variables');
      } else {
        // Check for common issues
        troubleshooting.push('Try disabling ad blocker (uBlock Origin, AdBlock Plus)');
        troubleshooting.push('Check browser extensions');
        troubleshooting.push('Verify API key permissions');
        troubleshooting.push('Check network connection');
      }
      
      return (
        <div className="h-full w-full flex items-center justify-center bg-red-100">
          <div className="text-center p-4 max-w-md">
            <p className="text-red-600 font-semibold mb-2">🚫 Google Maps Loading Failed</p>
            <p className="text-red-500 text-sm mb-3">{errorMessage}</p>
            
            <div className="text-left bg-red-50 p-3 rounded text-xs">
              <p className="font-semibold text-red-700 mb-2">Troubleshooting:</p>
              {troubleshooting.map((tip, index) => (
                <p key={index} className="text-red-600 mb-1">• {tip}</p>
              ))}
            </div>
            
            <button 
              onClick={() => window.location.reload()} 
              className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              🔄 Retry
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-200">
        <div className="text-center">
          <SpinnerIcon className="h-12 w-12 animate-spin text-gray-500 mx-auto mb-2" />
          <p className="text-gray-600">Loading Google Maps...</p>
        </div>
      </div>
    );
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

      {!apiKey ? (
        <div className="h-full w-full flex items-center justify-center bg-red-100">
          <div className="text-center p-4">
            <p className="text-red-600 font-semibold mb-2">⚠️ Configuration Error</p>
            <p className="text-red-500 text-sm mb-2">Google Maps API key is missing</p>
            <p className="text-red-400 text-xs">
              Please set VITE_GOOGLE_MAPS_API_KEY in environment variables
            </p>
          </div>
        </div>
      ) : (
        <Wrapper 
          apiKey={apiKey} 
          libraries={['marker']} 
          render={render}
          version="weekly"
          region="TW"
          language="zh-TW"
        >
          <PoopMap poops={getVisiblePoops()} onPoopClick={handlePoopClick} />
        </Wrapper>
      )}

      <div className="absolute bottom-20 right-4 z-10 text-right">
        {error && <p className="bg-red-500 text-white p-2 rounded-md mb-2">{error}</p>}
        <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="font-bold text-gray-800">{t.totalDrops}: <span className="text-amber-800">{poops.length}</span></p>
            <div className="flex items-center space-x-1 text-xs">
              {useFirebase && firebaseReady ? (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">☁️</span>
              ) : (
                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full">💾</span>
              )}
              {!isOnline && <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full">📱</span>}
            </div>
          </div>
          {poops.length === 0 && <p className="text-sm text-gray-600">{t.noDropsYet}</p>}
          {poops.length > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              <p>最新便便: {new Date(poops[poops.length - 1]?.timestamp).toLocaleTimeString()}</p>
              <p>可見便便: {allPoops.length} 筆 (含好友)</p>
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


        
        {/* Firebase test button */}
        <button
          onClick={async () => {
            console.log('🧪 Testing Firebase connection...');
            try {
              if (!firebaseReady) {
                alert('❌ Firebase 未正確配置！\n\n請檢查環境變數：\n• VITE_FIREBASE_API_KEY\n• VITE_FIREBASE_PROJECT_ID');
                return;
              }
              
              // Test Firebase connection
              const testPoop: Poop = {
                id: 'test-firebase-' + Date.now(),
                lat: 25.0330,
                lng: 121.5654,
                timestamp: Date.now(),
                rating: 5,
                placeName: 'Firebase 測試',
                privacy: 'public',
                userId: user?.email || 'test@firebase.com',
                notes: 'Firebase 連接測試'
              };
              
              const firebaseId = await savePoopToCloud(testPoop);
              alert(`✅ Firebase 連接成功！\n\n📊 測試結果：\n• Firebase ID: ${firebaseId}\n• 資料已上傳到雲端`);
              
              // Reload data to show the new poop
              if (user?.email) {
                loadFirebaseData(user.email);
              }
            } catch (error) {
              console.error('Firebase test failed:', error);
              alert(`❌ Firebase 連接失敗！\n\n錯誤：${error}\n\n請檢查：\n• 網路連線\n• Firebase 配置\n• Firestore 規則`);
            }
          }}
          className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
        >
          🧪 測試 Firebase
        </button>

        {/* Google API test button */}
        <button
          onClick={async () => {
            console.log('🗺️ Testing Google Maps API...');
            try {
              const google = (window as any).google;
              if (!google?.maps) {
                alert('❌ Google Maps API 未載入！\n\n請檢查網路連線和 API 金鑰');
                return;
              }

              // Test Geocoding API
              console.log('✅ Google Maps API loaded successfully');
              console.log('📍 Available services:', {
                Map: !!google.maps.Map,
                Marker: !!google.maps.Marker,
                AdvancedMarkerElement: !!google.maps.marker?.AdvancedMarkerElement,
                Geocoder: !!google.maps.Geocoder
              });

              // Test Geocoding with error handling
              const geocoder = new google.maps.Geocoder();
              try {
                const testResult = await new Promise((resolve, reject) => {
                  geocoder.geocode(
                    { location: { lat: 25.0330, lng: 121.5654 } }, // 台北101
                    (results: any, status: any) => {
                      if (status === 'OK' && results[0]) {
                        resolve(results[0]);
                      } else {
                        reject(new Error(`Geocoding failed: ${status}`));
                      }
                    }
                  );
                });

                const result = testResult as any;
                alert(`✅ Google APIs 連接成功！\n\n📍 測試結果：\n• Maps API: 正常載入\n• Geocoding API: 正常運作\n• 測試地址: ${result.formatted_address}\n• 狀態: 完全正常`);
              } catch (geocodingError) {
                console.warn('Geocoding test failed:', geocodingError);
                alert(`⚠️ Google Maps API 部分正常\n\n📍 測試結果：\n• Maps API: 正常載入\n• Geocoding API: ${geocodingError.message}\n• 地圖功能: 可用\n• 地址查詢: 可能受限\n\n💡 地圖仍可正常使用，只是沒有地址信息`);
              }
              
            } catch (error) {
              console.error('Google API test failed:', error);
              let errorMessage = `❌ Google API 連接失敗！\n\n錯誤：${error}\n\n`;
              
              if (error.message?.includes('REQUEST_DENIED')) {
                errorMessage += '可能原因：\n• API 金鑰權限不足\n• HTTP referrer 限制\n• Geocoding API 未啟用';
              } else if (error.message?.includes('OVER_QUERY_LIMIT')) {
                errorMessage += '可能原因：\n• API 配額已用完\n• 請求頻率過高';
              } else {
                errorMessage += '可能原因：\n• 網路連線問題\n• API 金鑰無效\n• 服務暫時不可用';
              }
              
              alert(errorMessage);
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          🗺️ 測試 Google API
        </button>
        
        {/* Firebase/localStorage toggle */}
        <button
          onClick={() => {
            if (!firebaseReady && !useFirebase) {
              alert('❌ Firebase 未配置，無法切換到雲端模式');
              return;
            }
            
            setUseFirebase(!useFirebase);
            const newMode = !useFirebase;
            alert(`${newMode ? '☁️' : '💾'} 切換到 ${newMode ? 'Firebase 雲端' : 'localStorage 本地'} 模式！
            
${newMode ? '✅ 跨瀏覽器同步\n✅ 真實多用戶\n✅ 即時更新' : '✅ 離線可用\n✅ 快速存取\n✅ 隱私保護'}

🔥 Firebase: ${firebaseReady ? '已配置' : '未配置'}
🌐 網路: ${isOnline ? '在線' : '離線'}`);
            
            if (user?.email) {
              if (newMode && isOnline && firebaseReady) {
                loadFirebaseData(user.email);
              } else {
                loadPoops(user.email);
                loadFriends(user.email);
              }
            }
          }}
          className={`px-4 py-2 text-white text-sm rounded-lg transition-colors ${
            useFirebase && firebaseReady
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-gray-600 hover:bg-gray-700'
          }`}
        >
          {useFirebase && firebaseReady ? '☁️ Firebase' : '💾 本地'} 
          {!isOnline && '(離線)'}
          {!firebaseReady && '(未配置)'}
        </button>
        
        {/* Reload friends poops button */}
        <button
          onClick={() => {
            loadFriendsPoops();
            alert(`🔄 重新載入好友便便！
            
📊 目前狀況：
• ${friends.length} 位好友
• ${allPoops.length} 筆可見便便
• 模式：${useFirebase ? 'Firebase 雲端' : 'localStorage 本地'}
• 網路：${isOnline ? '在線' : '離線'}
• 檢查 Console 查看詳細資訊`);
          }}
          className="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
        >
          🔄 載入好友便便
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

      {/* Poop Detail Modal */}
      <PoopDetailModal
        isOpen={showPoopDetailModal}
        onClose={() => setShowPoopDetailModal(false)}
        poop={selectedPoop}
        currentUser={user}
        translations={t}
      />
    </div>
  );
};

export default App;