'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaComment, FaEnvelope, FaPaperPlane, FaUser, FaArrowLeft } from 'react-icons/fa';

interface Message {
  senderId: string;
  senderName: string;
  content: string;
  read: boolean;
  createdAt: string;
}

interface Conversation {
  _id: string;
  participants: string[];
  messages: Message[];
  lastMessage: string;
  lastMessageAt: string;
}

function MessagesContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toEmail = searchParams.get('to');
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/messages');
      const data = await res.json();
      setConversations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
    }
    setLoading(false);
  };

  const fetchConversation = async (conversationId: string) => {
    if (!conversationId) return;
    try {
      const res = await fetch(`/api/messages/${conversationId}`);
      const data = await res.json();
      setSelectedConversation(data);
    } catch (error) {
      console.error('Erreur chargement conversation:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    let conversationId = selectedConversation?._id;

    if (!conversationId) {
      try {
        const res = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipientEmail, content: newMessage })
        });
        const data = await res.json();
        conversationId = data._id;
        setShowNewChat(false);
      } catch (error) {
        console.error('Erreur création conversation:', error);
        return;
      }
    } else {
      try {
        await fetch(`/api/messages/${conversationId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: newMessage })
        });
      } catch (error) {
        console.error('Erreur envoi message:', error);
        return;
      }
    }

    setNewMessage('');
    if (conversationId) {
      await fetchConversation(conversationId);
    }
    await fetchConversations();
  };

  useEffect(() => {
    fetchConversations();
    
    if (toEmail && session?.user?.email !== toEmail) {
      setRecipientEmail(toEmail);
      setShowNewChat(true);
      fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientEmail: toEmail, content: '' })
      }).then(async (res) => {
        const data = await res.json();
        if (data._id) {
          await fetchConversation(data._id);
          await fetchConversations();
        }
      });
    }
  }, [toEmail, session]);

  if (!session) {
    return <div className="text-center py-20">Connectez-vous pour voir vos messages</div>;
  }

  const otherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p !== session.user?.email) || 'Inconnu';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Bouton retour */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-white transition"
        >
          <FaArrowLeft className="w-4 h-4" />
          Retour
        </button>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FaEnvelope className="text-blue-500" />
          Messages
        </h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Liste des conversations */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-4 max-h-[600px] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Conversations</h2>
            <button
              onClick={() => setShowNewChat(!showNewChat)}
              className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
            >
              + Nouveau
            </button>
          </div>

          {showNewChat && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <input
                type="email"
                placeholder="Email du destinataire"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm mb-2"
              />
              <button
                onClick={() => {
                  if (recipientEmail) {
                    setShowNewChat(false);
                    fetch('/api/messages', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ recipientEmail, content: '' })
                    }).then(async (res) => {
                      const data = await res.json();
                      if (data._id) {
                        await fetchConversation(data._id);
                        await fetchConversations();
                      }
                    });
                  }
                }}
                className="w-full px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
              >
                Démarrer
              </button>
            </div>
          )}

          {loading ? (
            <p className="text-gray-500 text-center py-4">Chargement...</p>
          ) : conversations.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aucune conversation</p>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv._id}
                onClick={() => {
                  fetchConversation(conv._id);
                  setSelectedConversation(conv);
                }}
                className={`w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition mb-1 ${
                  selectedConversation?._id === conv._id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <FaUser className="text-gray-400" />
                  <span className="font-medium text-sm truncate">
                    {otherParticipant(conv)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate mt-1">
                  {conv.lastMessage || 'Nouvelle conversation'}
                </p>
              </button>
            ))
          )}
        </div>

        {/* Zone de chat */}
        <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl border p-4 flex flex-col h-[600px]">
          {selectedConversation ? (
            <>
              <div className="border-b pb-3 mb-4 flex items-center gap-2">
                <FaUser className="text-gray-400" />
                <span className="font-medium">
                  {otherParticipant(selectedConversation)}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                {selectedConversation.messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.senderId === session.user?.email ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        msg.senderId === session.user?.email
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Écrire un message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
                >
                  <FaPaperPlane className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <FaComment className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Sélectionnez une conversation</p>
                <p className="text-sm">ou démarrez-en une nouvelle</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Chargement...</div>}>
      <MessagesContent />
    </Suspense>
  );
}