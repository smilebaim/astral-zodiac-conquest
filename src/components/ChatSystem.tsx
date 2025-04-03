import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import type { ZodiacProps } from './ZodiacCard';

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_zodiac: string;
  content: string;
  timestamp: string;
  type: 'text' | 'system' | 'battle' | 'resource' | 'council';
  channel: 'global' | 'council' | 'private';
  recipient_id?: string;
  metadata?: {
    battle_id?: string;
    resource_amount?: number;
    resource_type?: string;
    council_action?: string;
  };
}

interface ChatSystemProps {
  userId: string;
  userName: string;
  userZodiac: string;
  councilId?: string;
}

const ChatSystem: React.FC<ChatSystemProps> = ({
  userId,
  userName,
  userZodiac,
  councilId,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeChannel, setActiveChannel] = useState<'global' | 'council' | 'private'>('global');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isUserListOpen, setIsUserListOpen] = useState(false);
  const [users, setUsers] = useState<{ id: string; name: string; zodiac: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    fetchUsers();
    subscribeToMessages();
  }, [activeChannel, selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('messages')
        .select('*')
        .order('timestamp', { ascending: true });

      if (activeChannel === 'council' && councilId) {
        query = query.eq('channel', 'council').eq('council_id', councilId);
      } else if (activeChannel === 'private' && selectedUser) {
        query = query
          .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
          .or(`sender_id.eq.${selectedUser},recipient_id.eq.${selectedUser}`)
          .eq('channel', 'private');
      } else {
        query = query.eq('channel', 'global');
      }

      const { data, error } = await query;

      if (error) throw error;

      setMessages(data || []);
    } catch (err) {
      setError('Failed to fetch messages');
      console.error('Error fetching messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, zodiac')
        .neq('id', userId);

      if (error) throw error;

      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: activeChannel === 'council' && councilId
            ? `channel=eq.council,council_id=eq.${councilId}`
            : activeChannel === 'private' && selectedUser
            ? `channel=eq.private,or(sender_id=eq.${userId},recipient_id=eq.${userId})`
            : 'channel=eq.global',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages(prev => [...prev, payload.new as Message]);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const message: Partial<Message> = {
        sender_id: userId,
        sender_name: userName,
        sender_zodiac: userZodiac,
        content: newMessage.trim(),
        channel: activeChannel,
        type: 'text',
        timestamp: new Date().toISOString(),
      };

      if (activeChannel === 'council' && councilId) {
        message.council_id = councilId;
      } else if (activeChannel === 'private' && selectedUser) {
        message.recipient_id = selectedUser;
      }

      const { error } = await supabase.from('messages').insert([message]);

      if (error) throw error;

      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getZodiacIcon = (zodiac: string) => {
    const icons: { [key: string]: string } = {
      aries: '♈',
      taurus: '♉',
      gemini: '♊',
      cancer: '♋',
      leo: '♌',
      virgo: '♍',
      libra: '♎',
      scorpio: '♏',
      sagittarius: '♐',
      capricorn: '♑',
      aquarius: '♒',
      pisces: '♓',
    };
    return icons[zodiac.toLowerCase()] || '✨';
  };

  const getZodiacColor = (zodiac: string) => {
    const colors: { [key: string]: string } = {
      aries: 'text-red-500',
      taurus: 'text-green-500',
      gemini: 'text-yellow-500',
      cancer: 'text-blue-500',
      leo: 'text-orange-500',
      virgo: 'text-purple-500',
      libra: 'text-pink-500',
      scorpio: 'text-red-700',
      sagittarius: 'text-purple-700',
      capricorn: 'text-gray-700',
      aquarius: 'text-blue-700',
      pisces: 'text-indigo-500',
    };
    return colors[zodiac.toLowerCase()] || 'text-white';
  };

  const getMessageTypeColor = (type: Message['type']) => {
    const colors: { [key: string]: string } = {
      text: 'bg-cosmic-dark/50',
      system: 'bg-slate-800/50',
      battle: 'bg-red-900/50',
      resource: 'bg-yellow-900/50',
      council: 'bg-blue-900/50',
    };
    return colors[type] || 'bg-cosmic-dark/50';
  };

  const getChannelName = (channel: Message['channel']) => {
    const names: { [key: string]: string } = {
      global: 'Global Chat',
      council: 'Council Chat',
      private: 'Private Chat',
    };
    return names[channel] || channel;
  };

  return (
    <div className="flex h-full">
      {/* User List */}
      <div className="w-64 bg-cosmic-dark/90 backdrop-blur-md border-r border-cosmic-purple/40">
        <div className="p-4 border-b border-cosmic-purple/40">
          <h2 className="text-lg font-semibold text-cosmic-light-purple">Channels</h2>
        </div>
        <div className="p-2 space-y-2">
          {['global', 'council', 'private'].map(channel => (
            <motion.button
              key={channel}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setActiveChannel(channel as any);
                setSelectedUser(null);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg ${
                activeChannel === channel
                  ? 'bg-cosmic-purple text-white'
                  : 'bg-cosmic-dark/50 text-slate-400 hover:bg-cosmic-dark/70'
              }`}
            >
              {getChannelName(channel as Message['channel'])}
            </motion.button>
          ))}
        </div>
        {activeChannel === 'private' && (
          <>
            <div className="p-4 border-t border-cosmic-purple/40">
              <h2 className="text-lg font-semibold text-cosmic-light-purple">Users</h2>
            </div>
            <div className="p-2 space-y-2">
              {users.map(user => (
                <motion.button
                  key={user.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedUser(user.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg ${
                    selectedUser === user.id
                      ? 'bg-cosmic-purple text-white'
                      : 'bg-cosmic-dark/50 text-slate-400 hover:bg-cosmic-dark/70'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-lg ${getZodiacColor(user.zodiac)}`}>
                      {getZodiacIcon(user.zodiac)}
                    </span>
                    <span>{user.name}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-cosmic-purple/40">
          <h2 className="text-lg font-semibold text-cosmic-light-purple">
            {activeChannel === 'private' && selectedUser
              ? `Chat with ${users.find(u => u.id === selectedUser)?.name}`
              : getChannelName(activeChannel)}
          </h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cosmic-purple"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : messages.length === 0 ? (
            <div className="text-slate-400 text-center">No messages</div>
          ) : (
            messages.map(message => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-lg ${getMessageTypeColor(message.type)} ${
                  message.sender_id === userId ? 'ml-auto' : 'mr-auto'
                } max-w-[80%]`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-lg ${getZodiacColor(message.sender_zodiac)}`}>
                    {getZodiacIcon(message.sender_zodiac)}
                  </span>
                  <span className="font-semibold text-white">{message.sender_name}</span>
                  <span className="text-xs text-slate-400">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-slate-300">{message.content}</p>
                {message.metadata && (
                  <div className="mt-2 text-xs text-slate-400">
                    {message.metadata.battle_id && (
                      <div>Battle ID: {message.metadata.battle_id}</div>
                    )}
                    {message.metadata.resource_amount && (
                      <div>
                        {message.metadata.resource_amount} {message.metadata.resource_type}
                      </div>
                    )}
                    {message.metadata.council_action && (
                      <div>Action: {message.metadata.council_action}</div>
                    )}
                  </div>
                )}
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-cosmic-purple/40">
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
              className="p-2 rounded-lg bg-cosmic-dark/50 border border-cosmic-purple/40"
            >
              😊
            </motion.button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 rounded-lg bg-cosmic-dark/50 border border-cosmic-purple/40 text-white placeholder-slate-400 focus:outline-none focus:border-cosmic-purple"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage}
              className="px-4 py-2 rounded-lg cosmic-button"
            >
              Send
            </motion.button>
          </div>
          <AnimatePresence>
            {isEmojiPickerOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-2 p-2 bg-cosmic-dark/90 backdrop-blur-md rounded-lg border border-cosmic-purple/40"
              >
                <div className="grid grid-cols-8 gap-1">
                  {['😊', '😂', '🤔', '😎', '😍', '😡', '😱', '😴'].map(emoji => (
                    <motion.button
                      key={emoji}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setNewMessage(prev => prev + emoji);
                        setIsEmojiPickerOpen(false);
                      }}
                      className="p-1 text-xl"
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ChatSystem; 