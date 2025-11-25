'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { userAPI, ordersAPI, addressAPI } from '@/lib/api';
import UserDashboard from '@/components/UserDashboard'; // Import the artifact

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const { wishlist, removeFromWishlist } = useWishlist();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<Record<string, unknown> | null>(null);
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [addresses, setAddresses] = useState<Record<string, unknown>[]>([]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      if (!user?.id) return;
      const [profile, ordersData, addressesData] = await Promise.all([
        userAPI.getProfile(user.id),
        ordersAPI.getUserOrders(user.id),
        addressAPI.getAddresses(user.id)
      ]);

      setProfileData(profile);
      setOrders(ordersData);
      setAddresses(addressesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchAllData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  const handleRemoveFromWishlist = async (productId: number) => {
    try {
      await removeFromWishlist(productId);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <UserDashboard
        user={profileData}
        orders={orders}
        wishlist={wishlist}
        addresses={addresses}
        _onRefresh={fetchAllData}
        onRemoveFromWishlist={handleRemoveFromWishlist}
      />
    </ProtectedRoute>
  );
}