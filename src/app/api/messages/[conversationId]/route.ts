import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Conversation from '@/models/Conversation';

// GET - Récupérer une conversation spécifique
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const { conversationId } = await params;
  await connectDB();

  const conversation = await Conversation.findById(conversationId);
  
  if (!conversation) {
    return NextResponse.json({ error: 'Conversation non trouvée' }, { status: 404 });
  }

  // Vérifier que l'utilisateur est participant
  if (!conversation.participants.includes(session.user.email)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  // Marquer les messages comme lus
  conversation.messages.forEach((msg: any) => {
    if (msg.senderId !== session.user.email) {
      msg.read = true;
    }
  });
  await conversation.save();

  return NextResponse.json(conversation);
}

// POST - Ajouter un message à une conversation
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const { conversationId } = await params;
  await connectDB();
  const { content } = await req.json();

  const conversation = await Conversation.findById(conversationId);
  
  if (!conversation) {
    return NextResponse.json({ error: 'Conversation non trouvée' }, { status: 404 });
  }

  if (!conversation.participants.includes(session.user.email)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  conversation.messages.push({
    senderId: session.user.email,
    senderName: session.user.name,
    content,
    read: false,
    createdAt: new Date()
  });
  conversation.lastMessage = content;
  conversation.lastMessageAt = new Date();

  await conversation.save();

  return NextResponse.json(conversation);
}