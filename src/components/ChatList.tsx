import { MessageCircle, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Chat {
  id: string;
  user: {
    id: number;
    name: string;
    image?: string;
  };
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  isNewMatch?: boolean;
}

interface ChatListProps {
  chats: Chat[];
  onChatSelect: (chat: Chat) => void;
}

export const ChatList = ({ chats, onChatSelect }: ChatListProps) => {
  const newMatches = chats.filter(chat => chat.isNewMatch);
  const conversations = chats.filter(chat => !chat.isNewMatch);

  return (
    <div className="space-y-6">
      {/* New Matches Section */}
      {newMatches.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-primary fill-current" />
            <h2 className="text-lg font-semibold">New Matches</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {newMatches.map((match) => (
              <button
                key={match.id}
                onClick={() => onChatSelect(match)}
                className="flex-shrink-0 text-center group"
              >
                <div className="relative mb-2">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 group-hover:border-primary transition-colors">
                    {match.user.image ? (
                      <img
                        src={match.user.image}
                        alt={match.user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                        {match.user.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center text-xs">
                    💕
                  </div>
                </div>
                <p className="text-xs font-medium truncate w-16">
                  {match.user.name}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Messages</h2>
        </div>
        
        {conversations.length === 0 ? (
          <Card className="p-8 text-center">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No messages yet</h3>
            <p className="text-muted-foreground text-sm">
              Start swiping to find your perfect match!
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {conversations.map((chat) => (
              <Card
                key={chat.id}
                className="p-4 hover:bg-accent/10 cursor-pointer transition-colors"
                onClick={() => onChatSelect(chat)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      {chat.user.image ? (
                        <img
                          src={chat.user.image}
                          alt={chat.user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                          {chat.user.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    {chat.unreadCount && chat.unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs bg-accent">
                        {chat.unreadCount}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold truncate">{chat.user.name}</h3>
                      {chat.lastMessageTime && (
                        <span className="text-xs text-muted-foreground">
                          {chat.lastMessageTime}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {chat.lastMessage || "Say hello! 👋"}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};