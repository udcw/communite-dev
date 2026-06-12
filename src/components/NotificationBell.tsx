'use client';

import { useState, useEffect } from 'react';
import { FaBell, FaHeart, FaComment, FaUserPlus } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface Notification {
  _id: string;
  type: 'like' | 'comment' | 'follow';
  fromUserName: string;
  postId?: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.read).length);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId })
    });
    fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Rafraîchir toutes les 30s
    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <FaHeart className="text-red-500" />;
      case 'comment': return <FaComment className="text-green-500" />;
      case 'follow': return <FaUserPlus className="text-blue-500" />;
      default: return <FaBell />;
    }
  };

  const getMessage = (notification: Notification) => {
    switch (notification.type) {
      case 'like': return `${notification.fromUserName} a aimé votre post`;
      case 'comment': return `${notification.fromUserName} a commenté votre post`;
      case 'follow': return `${notification.fromUserName} vous suit`;
      default: return '';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setShowDropdown(!showDropdown);
          if (!showDropdown) fetchNotifications();
        }}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      >
        <FaBell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 font-semibold">
            Notifications
          </div>
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              Aucune notification
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif._id}
                className={`p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition ${!notif.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                onClick={() => {
                  markAsRead(notif._id);
                  if (notif.postId) router.push(`/post/${notif.postId}`);
                  setShowDropdown(false);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      {getMessage(notif)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notif.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}