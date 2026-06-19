import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import User from '@/models/User';

// GET - Récupérer toutes les conversations de l'utilisateur
export async function GET() {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  await connectDB();
  
  const conversations = await Conversation.find({
    participants: session.user.email
  }).sort({ lastMessageAt: -1 });

  return NextResponse.json(conversations);
}

// POST - Démarrer une conversation ou envoyer un message
export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  await connectDB();
  const { recipientEmail, content } = await req.json();

  // Vérifier que le destinataire existe
  const recipient = await User.findOne({ email: recipientEmail });
  if (!recipient) {
    return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
  }

  // Trouver ou créer une conversation
  let conversation = await Conversation.findOne({
    participants: { $all: [session.user.email, recipientEmail] }
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [session.user.email, recipientEmail],
      messages: [],
      lastMessage: '',
      lastMessageAt: new Date()
    });
  }

  // Ajouter le message
  conversation.messages.push({
    senderId: session.user.email,
    senderName: session.user.name,
    content,
    read: false,
    createdAt: new Date()
  });
  conversation.lastMessage = content;
  conversation.lastMessageAt = new Date();
  conversation.updatedAt = new Date();

  await conversation.save();

  return NextResponse.json(conversation);
}