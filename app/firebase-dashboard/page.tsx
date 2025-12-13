'use client';

import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { User, Database, AlertCircle, CheckCircle } from 'lucide-react';

// Brand Colors (Ruler Archetype)
const CHARCOAL = '#1A1D21';
const GREEN = '#0B1F1A';
const WHITE = '#FFFFFF';

export default function FirebaseDashboard() {
  // State Management
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  // Firebase initialization and authentication
  useEffect(() => {
    // Get Firebase config from global variable
    const firebaseConfig = (window as any).__firebase_config;
    const authToken = (window as any).__initial_auth_token;

    if (!firebaseConfig) {
      console.error('Firebase config not found in __firebase_config');
      setIsLoading(false);
      return;
    }

    try {
      // Initialize Firebase
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);

      // Sign in with custom token or anonymously
      const signIn = async () => {
        try {
          if (authToken) {
            await signInWithCustomToken(auth, authToken);
          } else {
            await signInAnonymously(auth);
          }
        } catch (error) {
          console.error('Authentication error:', error);
        }
      };

      signIn();

      // Listen for auth state changes
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setUserId(user.uid);
        } else {
          setUserId(null);
        }
        setIsLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Firebase initialization error:', error);
      setIsLoading(false);
    }
  }, []);

  // Fetch user data from Firestore
  const fetchUserData = async () => {
    if (!userId) return;

    setIsFetching(true);
    setFetchError(null);
    setUserData(null);

    try {
      const firebaseConfig = (window as any).__firebase_config;
      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);

      // Construct the path: /artifacts/${appId}/users/${userId}/profile/data
      // Note: appId would need to be defined or passed in
      const appId = 'hitchyard-mvp'; // Replace with actual appId
      const docRef = doc(db, 'artifacts', appId, 'users', userId, 'profile', 'data');

      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUserData(docSnap.data());
      } else {
        setFetchError('No user data found at the specified path.');
      }
    } catch (error: any) {
      setFetchError(error.message || 'Failed to fetch user data');
      console.error('Firestore read error:', error);
    } finally {
      setIsFetching(false);
    }
  };

  // Loading screen
  if (isLoading) {
    return (
      <div
        style={{ backgroundColor: CHARCOAL }}
        className="min-h-screen w-full flex items-center justify-center"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 mx-auto mb-4" style={{ borderColor: GREEN }}></div>
          <h2 className="text-2xl font-cinzel text-white">Loading...</h2>
          <p className="text-gray-400 mt-2 font-spartan">Authenticating with Firebase</p>
        </div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div
      style={{ backgroundColor: CHARCOAL }}
      className="min-h-screen w-full font-spartan text-white"
    >
      {/* Header */}
      <header className="p-6 md:p-8 w-full max-w-6xl mx-auto border-b" style={{ borderColor: GREEN }}>
        <h1 className="text-3xl font-bold font-cinzel tracking-widest text-white">
          <span className="text-5xl" style={{ color: GREEN }}>H</span>ITCHYARD
        </h1>
        <p className="text-sm text-gray-400 mt-2">Carrier Platform Access Dashboard</p>
      </header>

      {/* Main Content */}
      <main className="p-6 md:p-12 w-full max-w-6xl mx-auto">
        {/* User ID Display Card */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6 border" style={{ borderColor: GREEN }}>
          <div className="flex items-center gap-3 mb-4">
            <User size={24} style={{ color: GREEN }} />
            <h2 className="text-xl font-cinzel font-bold">Authenticated User</h2>
          </div>
          <div className="bg-black p-4 rounded-md">
            <p className="text-xs text-gray-500 mb-1">Firebase UID (Unredacted)</p>
            <p className="text-lg font-mono break-all" style={{ color: GREEN }}>
              {userId || 'Not authenticated'}
            </p>
          </div>
        </div>

        {/* Fetch User Data Section */}
        <div className="bg-gray-900 rounded-lg p-6 border" style={{ borderColor: GREEN }}>
          <div className="flex items-center gap-3 mb-4">
            <Database size={24} style={{ color: GREEN }} />
            <h2 className="text-xl font-cinzel font-bold">Firestore Data Access</h2>
          </div>

          <p className="text-sm text-gray-400 mb-4">
            Attempting to read: <code className="text-gray-300">/artifacts/hitchyard-mvp/users/{userId}/profile/data</code>
          </p>

          <button
            onClick={fetchUserData}
            disabled={!userId || isFetching}
            className="px-6 py-3 rounded-md font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
            style={{ backgroundColor: GREEN, color: WHITE }}
          >
            {isFetching ? 'Fetching...' : 'Fetch User Data'}
          </button>

          {/* Display Results */}
          {userData && (
            <div className="mt-6 bg-black p-4 rounded-md border border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={20} style={{ color: GREEN }} />
                <p className="font-semibold" style={{ color: GREEN }}>Data Retrieved Successfully</p>
              </div>
              <pre className="text-xs text-gray-300 overflow-auto max-h-96">
                {JSON.stringify(userData, null, 2)}
              </pre>
            </div>
          )}

          {fetchError && (
            <div className="mt-6 bg-red-950 p-4 rounded-md border border-red-700">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={20} className="text-red-400" />
                <p className="font-semibold text-red-400">Error</p>
              </div>
              <p className="text-sm text-red-300">{fetchError}</p>
            </div>
          )}
        </div>

        {/* Information Box */}
        <div className="mt-6 bg-gray-900 rounded-lg p-6 border border-gray-700">
          <h3 className="font-semibold text-white mb-2">System Information</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Authentication: Firebase Auth</li>
            <li>• Database: Firestore</li>
            <li>• Theme: Ruler Archetype (Dark Mode)</li>
            <li>• Status: {userId ? 'Authenticated ✓' : 'Not Authenticated'}</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
