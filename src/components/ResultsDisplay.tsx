import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { motion } from 'motion/react';
import { ChevronDown, ChevronUp, FileText, MessageSquare, Calendar, Copy, Check, Share, ExternalLink } from 'lucide-react';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';

interface Source {
  id: string;
  type: 'slack' | 'document' | 'meeting';
  title: string;
  content: string;
  author: string;
  date: string;
  channel?: string;
}

interface QueryResult {
  id: string;
  question: string;
  answer: string;
  sources: Source[];
  timestamp: string;
}

interface ResultsDisplayProps {
  result: QueryResult | null;
}

export function ResultsDisplay({ result }: ResultsDisplayProps) {
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [copiedAnswer, setCopiedAnswer] = useState(false);
  const [copiedFull, setCopiedFull] = useState(false);

  if (!result) return null;

  const copyToClipboard = async (text: string, type: 'answer' | 'full') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'answer') {
        setCopiedAnswer(true);
        setTimeout(() => setCopiedAnswer(false), 2000);
        toast.success('Answer copied to clipboard');
      } else {
        setCopiedFull(true);
        setTimeout(() => setCopiedFull(false), 2000);
        toast.success('Full response copied to clipboard');
      }
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const shareResult = async () => {
    const shareText = `Q: ${result.question}\n\nA: ${result.answer}\n\nSources:\n${result.sources.map((s, i) => `${i + 1}. ${s.title} - ${s.author}`).join('\n')}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Team Brain Query Result',
          text: shareText
        });
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      await copyToClipboard(shareText, 'full');
    }
  };

  const getFullResponse = () => {
    return `Question: ${result.question}\n\nAnswer: ${result.answer}\n\nSources:\n${result.sources.map((source, index) => 
      `${index + 1}. ${source.title}\n   Author: ${source.author}\n   Type: ${source.type}\n   Date: ${source.date}${source.channel ? `\n   Channel: #${source.channel}` : ''}\n   Content: ${source.content}\n`
    ).join('\n')}`;
  };

  const getSourceIcon = (type: Source['type']) => {
    switch (type) {
      case 'slack':
        return <MessageSquare className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4" />;
      case 'meeting':
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getSourceBadgeVariant = (type: Source['type']) => {
    switch (type) {
      case 'slack':
        return 'default';
      case 'document':
        return 'secondary';
      case 'meeting':
        return 'outline';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
    >
      <Card className="border-2">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-lg leading-relaxed">{result.question}</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {new Date(result.timestamp).toLocaleTimeString()}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={shareResult}
                className="h-8 w-8 p-0"
              >
                <Share className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="prose prose-invert max-w-none"
          >
            <div className="bg-accent/50 rounded-lg p-6 border relative group">
              <p className="m-0 leading-relaxed">{result.answer}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(result.answer, 'answer')}
                className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {copiedAnswer ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </motion.div>

          <div className="flex items-center justify-between">
            <Collapsible open={sourcesOpen} onOpenChange={setSourcesOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 p-0 h-auto hover:bg-transparent"
                >
                  {sourcesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  <span>Sources ({result.sources.length})</span>
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(getFullResponse(), 'full')}
              className="flex items-center gap-2"
            >
              {copiedFull ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              Copy Full Response
            </Button>
          </div>

          <Collapsible open={sourcesOpen} onOpenChange={setSourcesOpen}>
            <CollapsibleContent className="mt-4">
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                {result.sources.map((source, index) => (
                  <motion.div
                    key={source.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-muted/50 group">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {getSourceIcon(source.type)}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="truncate">{source.title}</span>
                                <Badge variant={getSourceBadgeVariant(source.type)} className="text-xs">
                                  {source.type}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <span>{source.author}</span>
                                <span>•</span>
                                <span>{source.date}</span>
                                {source.channel && (
                                  <>
                                    <span>•</span>
                                    <span>#{source.channel}</span>
                                  </>
                                )}
                              </div>
                              <p className="text-sm leading-relaxed text-foreground/90">
                                {source.content}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(source.content, 'answer')}
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </motion.div>
  );
}