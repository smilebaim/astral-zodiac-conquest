import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  type: 'battle' | 'resource' | 'council' | 'research' | 'achievement' | 'system' | 'social';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  action?: {
    type: string;
    data: any;
  };
}

interface NotificationSystemProps {
  userId: string;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<Notification['type'] | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
    subscribeToNotifications();
  }, [userId]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotifications(prev => [payload.new as Notification, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setNotifications(prev =>
              prev.map(n =>
                n.id === payload.new.id ? (payload.new as Notification) : n
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setNotifications(prev =>
              prev.filter(n => n.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.filter(n => n.id !== notificationId)
      );
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    const icons: { [key: string]: string } = {
      battle: '⚔️',
      resource: '💎',
      council: '👥',
      research: '🔬',
      achievement: '🏆',
      system: '⚙️',
      social: '💬',
    };
    return icons[type] || '📢';
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    const colors: { [key: string]: string } = {
      low: 'text-slate-400',
      medium: 'text-yellow-400',
      high: 'text-red-400',
    };
    return colors[priority] || 'text-slate-400';
  };

  const getTypeColor = (type: Notification['type']) => {
    const colors: { [key: string]: string } = {
      battle: 'bg-red-500/10 border-red-500/20',
      resource: 'bg-yellow-500/10 border-yellow-500/20',
      council: 'bg-blue-500/10 border-blue-500/20',
      research: 'bg-purple-500/10 border-purple-500/20',
      achievement: 'bg-green-500/10 border-green-500/20',
      system: 'bg-slate-500/10 border-slate-500/20',
      social: 'bg-pink-500/10 border-pink-500/20',
    };
    return colors[type] || 'bg-slate-500/10 border-slate-500/20';
  };

  const filteredNotifications = notifications.filter(
    n => filter === 'all' || n.type === filter
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full bg-cosmic-dark/50 border border-cosmic-purple/40"
      >
        <div className="text-2xl">🔔</div>
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </div>
        )}
      </motion.button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-96 bg-cosmic-dark/90 backdrop-blur-md rounded-lg border border-cosmic-purple/40 shadow-lg"
          >
            <div className="p-4 border-b border-cosmic-purple/40">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-cosmic-light-purple">
                  Notifications
                </h2>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={markAllAsRead}
                    className="text-sm text-slate-400 hover:text-white"
                  >
                    Mark all as read
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="p-2 border-b border-cosmic-purple/40">
              <div className="flex gap-2 overflow-x-auto">
                {['all', 'battle', 'resource', 'council', 'research', 'achievement', 'system', 'social'].map(type => (
                  <motion.button
                    key={type}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilter(type as any)}
                    className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                      filter === type
                        ? 'bg-cosmic-purple text-white'
                        : 'bg-cosmic-dark/50 text-slate-400'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cosmic-purple"></div>
                </div>
              ) : error ? (
                <div className="p-4 text-red-500 text-center">{error}</div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-4 text-slate-400 text-center">No notifications</div>
              ) : (
                <div className="divide-y divide-cosmic-purple/20">
                  {filteredNotifications.map(notification => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 ${
                        notification.read ? 'bg-cosmic-dark/50' : 'bg-cosmic-purple/10'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-white">
                              {notification.title}
                            </h3>
                            <span className={`text-xs ${getPriorityColor(notification.priority)}`}>
                              {notification.priority.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-slate-500">
                              {new Date(notification.timestamp).toLocaleString()}
                            </p>
                            <div className="flex gap-2">
                              {!notification.read && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-xs text-slate-400 hover:text-white"
                                >
                                  Mark as read
                                </motion.button>
                              )}
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => deleteNotification(notification.id)}
                                className="text-xs text-red-400 hover:text-red-300"
                              >
                                Delete
                              </motion.button>
                            </div>
                          </div>
                          {notification.action && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="mt-2 w-full cosmic-button text-sm"
                            >
                              {notification.action.type}
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

              <AnimatePresence>
                {notifications.map(notification => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`p-4 border-b border-cosmic-purple/40 ${
                      !notification.read ? 'bg-cosmic-purple/10' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-semibold ${getNotificationColor(notification.type)}`}>
                            {notification.title}
                          </h4>
                          <span className="text-xs text-slate-500">
                            {new Date(notification.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300 mt-1">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationSystem; 