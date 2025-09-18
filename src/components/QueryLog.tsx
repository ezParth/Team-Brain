import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { Clock, MessageCircle } from 'lucide-react';
import { Badge } from './ui/badge';

interface QueryHistoryItem {
  id: string;
  question: string;
  timestamp: string;
  answerPreview: string;
}

interface QueryLogProps {
  queryHistory: QueryHistoryItem[];
  onSelectQuery: (query: QueryHistoryItem) => void;
  selectedQueryId?: string;
}

export function QueryLog({ queryHistory, onSelectQuery, selectedQueryId }: QueryLogProps) {
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Query History
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-2 p-6 pt-0">
            {queryHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No queries yet</p>
                <p className="text-sm">Your question history will appear here</p>
              </div>
            ) : (
              queryHistory.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Button
                    variant={selectedQueryId === item.id ? "secondary" : "ghost"}
                    className="w-full p-4 h-auto justify-start text-left"
                    onClick={() => onSelectQuery(item)}
                  >
                    <div className="w-full">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="line-clamp-2 text-sm leading-relaxed flex-1">
                          {item.question}
                        </p>
                        <Badge variant="outline" className="text-xs ml-2 whitespace-nowrap">
                          {formatTimeAgo(item.timestamp)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 text-left">
                        {item.answerPreview}
                      </p>
                    </div>
                  </Button>
                </motion.div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}