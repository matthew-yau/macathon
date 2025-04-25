'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoArrowBack } from 'react-icons/io5';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase'; 


interface Message {
  id: number;
  sender_id: string;
  receiver_id: string;
  message: string;
  timestamp: string;
}

interface Match {
  user_id: string;
  name: string;
}

const supabase = createClientComponentClient(); // Initialize Supabase client

const Chat = () => {
    const router = useRouter();
    const supabase = createClientComponentClient<Database>();
  
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [matches, setMatches] = useState<any[]>([]);
    const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [messageInput, setMessageInput] = useState('');
  
    // 🔐 Get current user
    useEffect(() => {
      const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          setCurrentUserId(user.email);
        }
      };
      getUser();
    }, []);
  
    // 👥 Fetch matches
    useEffect(() => {
      const fetchMatches = async () => {
        if (!currentUserId) return;
  
        const { data, error } = await supabase
          .from('user_relationships')
          .select('email, target_email')
          .eq('action', 'matched')
          .or(`email.eq.${currentUserId},target_email.eq.${currentUserId}`);
  
        if (data) {
          const uniqueEmails = new Set<string>();
          const matchedUsers = data
            .map((match) =>
              match.email === currentUserId ? match.target_email : match.email
            )
            .filter((email) => {
              if (uniqueEmails.has(email)) return false;
              uniqueEmails.add(email);
              return true;
            })
            .map((email) => ({ user_id: email, name: email }));
  
          setMatches(matchedUsers);
        }
      };
  
      fetchMatches();
    }, [currentUserId]);
  
    // 💬 Fetch messages when selecting a match
    useEffect(() => {
      const fetchMessages = async () => {
        if (!selectedMatch || !currentUserId) return;
  
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(
            `and(sender_id.eq.${currentUserId},receiver_id.eq.${selectedMatch.user_id}),and(sender_id.eq.${selectedMatch.user_id},receiver_id.eq.${currentUserId})`
          )
          .order('timestamp', { ascending: true });
  
        if (data) {
          setMessages(data);
        }
      };
  
      fetchMessages();
    }, [selectedMatch, currentUserId]);
  
    // 🔄 Realtime messages
    useEffect(() => {
      const channel = supabase
        .channel('realtime-messages')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          (payload) => {
            const newMessage = payload.new;
  
            if (
              selectedMatch &&
              currentUserId &&
              ((newMessage.sender_id === selectedMatch.user_id &&
                newMessage.receiver_id === currentUserId) ||
                (newMessage.sender_id === currentUserId &&
                  newMessage.receiver_id === selectedMatch.user_id))
            ) {
              setMessages((prev) => [...prev, newMessage]);
            }
          }
        )
        .subscribe();
  
      return () => {
        supabase.removeChannel(channel);
      };
    }, [selectedMatch, currentUserId]);
  
    // 📨 Send message
    const handleSendMessage = async () => {
      if (!messageInput.trim() || !currentUserId || !selectedMatch) return;
  
      const newMessage = {
        sender_id: currentUserId,
        receiver_id: selectedMatch.user_id,
        message: messageInput,
        timestamp: new Date().toISOString(),
      };
  
      const { error } = await supabase.from('messages').insert([newMessage]);
  
      if (error) {
        console.error('Error sending message:', error.message);
      } else {
        setMessageInput('');
      }
    };
  
    const handleKeyPress = (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage();
      }
    };
  
    return (
      <div className="flex h-screen bg-gray-200">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="absolute top-4 left-4 bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm hover:bg-gray-200 flex items-center space-x-2"
        >
          <IoArrowBack className="text-xl" />
          <span>Back</span>
        </button>
  
        {/* Chat Section */}
        <div className="w-full flex flex-col items-center pt-10">
          <div className="flex justify-between items-center mb-4 w-full max-w-xl px-4">
            <h2 className="text-2xl font-semibold">
              {selectedMatch ? `Chat with ${selectedMatch.name}` : 'Select a match'}
            </h2>
          </div>
  
          <div className="flex-1 overflow-y-auto space-y-4 mb-6 w-full max-w-xl px-4">
            {messages.map((msg, idx) => (
              <div
                key={`${msg.timestamp}-${idx}`}
                className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs p-3 rounded-xl ${
                    msg.sender_id === currentUserId ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'
                  }`}
                >
                  <p>{msg.message}</p>
                </div>
              </div>
            ))}
          </div>
  
          {selectedMatch && (
            <div className="flex items-center space-x-2 w-full max-w-xl px-4">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full p-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Type a message..."
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Send
              </button>
            </div>
          )}
        </div>
  
        {/* Matches List */}
        <div className="w-1/3 bg-white p-6 border-l">
          <h2 className="text-xl font-semibold mb-4">Matches</h2>
          <div>
            {matches.map((match) => (
              <div
                key={match.user_id}
                className={`p-2 mb-2 cursor-pointer rounded-lg ${
                  selectedMatch?.user_id === match.user_id ? 'bg-blue-200' : 'bg-gray-200'
                }`}
                onClick={() => setSelectedMatch(match)}
              >
                {match.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  export default Chat;
  