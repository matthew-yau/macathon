'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IoArrowBack } from 'react-icons/io5'; // Import the arrow icon
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'; // Supabase client import

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
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error.message);
      } else {
        setCurrentUserEmail(data?.user?.email || '');
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (currentUserEmail) {
      const fetchMatches = async () => {
        const { data, error } = await supabase
          .from('user_relationships')
          .select('email, target_email, action')
          .or(`email.eq.${currentUserEmail},target_email.eq.${currentUserEmail}`)
          .eq('action', 'matched');

        if (error) {
          console.error('Error fetching matches:', error.message);
        } else {
          const matchedUsers: Match[] = [];
          data?.forEach((item: any) => {
            if (item.email === currentUserEmail) {
              matchedUsers.push({ user_id: item.target_email, name: item.target_email });
            } else if (item.target_email === currentUserEmail) {
              matchedUsers.push({ user_id: item.email, name: item.email });
            }
          });
          setMatches(matchedUsers);
        }
      };
      fetchMatches();
    }
  }, [currentUserEmail]);

  useEffect(() => {
    if (selectedMatch) {
      const fetchMessages = async () => {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${currentUserEmail},receiver_id.eq.${currentUserEmail}`)
          .eq('receiver_id', selectedMatch.user_id)
          .order('timestamp', { ascending: true });

        if (error) {
          console.error('Error fetching messages:', error.message);
        } else {
          setMessages(data || []);
        }
      };
      fetchMessages();
    }
  }, [selectedMatch, currentUserEmail]);

  const handleSendMessage = async () => {
    if (messageInput.trim() && selectedMatch) {
        const newMessage = {
            sender_id: currentUserEmail,
            receiver_id: selectedMatch.user_id,
            message: messageInput,
            timestamp: new Date().toISOString(),
          };
        

        const { data, error } = await supabase.from('messages').insert([newMessage]).select();

        if (error) {
        console.error('Error sending message:', error.message);
        } else {
        setMessages([...messages, ...(data || [])]);
        setMessageInput('');
        }
        
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent newline insertion
      handleSendMessage(); // Trigger send message on Enter key
    }
  };

  const uniqueMatches = matches.filter(
    (match, index, self) =>
      index === self.findIndex((m) => m.user_id === match.user_id)
  );

  return (
    <div className="flex h-screen bg-gray-200">
      {/* Back Button with Arrow */}
      <button
        onClick={() => router.push('/')}
        className="absolute top-4 left-4 bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm hover:bg-gray-200 flex items-center space-x-2"
      >
        <IoArrowBack className="text-xl" /> {/* Arrow Icon */}
        <span>Back</span>
      </button>

      {/* Chat Window */}
      <div className="w-full flex flex-col items-center pt-10">
        {/* Chat Header */}
        <div className="flex justify-between items-center mb-4 w-full max-w-xl px-4">
          <h2 className="text-2xl font-semibold">{selectedMatch ? `Chat with ${selectedMatch.name}` : 'Select a match'}</h2>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-6 w-full max-w-xl px-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender_id === currentUserEmail ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs p-3 rounded-xl ${
                  message.sender_id === currentUserEmail ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'
                }`}
              >
                <p>{message.message}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input Area */}
        {selectedMatch && (
          <div className="flex items-center space-x-2 w-full max-w-xl px-4">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyPress} // Add event listener for Enter key
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

      {/* Matches Sidebar (on the right side) */}
      <div className="w-1/3 bg-white p-6 border-l">
        <h2 className="text-xl font-semibold mb-4">Matches</h2>
        <div>
          {uniqueMatches.map((match) => (
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
