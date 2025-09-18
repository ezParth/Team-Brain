import React from 'react';
import { motion } from 'motion/react';
import { Database, FileText, MessageSquare, Calendar } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';

interface Source {
  id: string;
  type: 'slack' | 'document' | 'meeting';
  title: string;
  content: string;
  author: string;
  date: string;
  channel?: string;
}

interface KnowledgeBaseStatusProps {
  sources: Source[];
}

export function KnowledgeBaseStatus({ sources }: KnowledgeBaseStatusProps) {
  const documentCount = sources.filter(s => s.type === 'document').length;
  const slackCount = sources.filter(s => s.type === 'slack').length;
  const meetingCount = sources.filter(s => s.type === 'meeting').length;
  
  const recentlyAdded = sources.filter(s => s.date === 'Just now').length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mb-6"
    >
      <Card className="border border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Database className="w-5 h-5 text-primary" />
            <span className="text-sm">Knowledge Base Status</span>
            {recentlyAdded > 0 && (
              <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-xs">
                +{recentlyAdded} Added
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center gap-1">
              <FileText className="w-4 h-4 text-blue-500" />
              <span className="text-2xl font-medium">{documentCount}</span>
              <span className="text-xs text-muted-foreground">Documents</span>
            </div>
            
            <div className="flex flex-col items-center gap-1">
              <MessageSquare className="w-4 h-4 text-green-500" />
              <span className="text-2xl font-medium">{slackCount}</span>
              <span className="text-xs text-muted-foreground">Slack</span>
            </div>
            
            <div className="flex flex-col items-center gap-1">
              <Calendar className="w-4 h-4 text-purple-500" />
              <span className="text-2xl font-medium">{meetingCount}</span>
              <span className="text-xs text-muted-foreground">Meetings</span>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Total Sources: {sources.length}</span>
              <span>Ready for queries</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}