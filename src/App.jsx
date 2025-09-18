import React, { useState, useEffect } from 'react';
import { QueryBox } from './components/QueryBox';
import { ResultsDisplay } from './components/ResultsDisplay';
import { QueryLog } from './components/QueryLog';
import { LoadingState } from './components/LoadingState';
import { FileUpload } from './components/FileUpload';
import { KnowledgeBaseStatus } from './components/KnowledgeBaseStatus';
import { motion, AnimatePresence } from 'motion/react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './components/ui/resizable';
import { useIsMobile } from './components/ui/use-mobile';
import { Toaster } from './components/ui/sonner';

// Mock data
const mockSources = [
  {
    id: '1',
    type: 'slack',
    title: 'Discussion about deployment process',
    content: 'We use automated CI/CD pipelines with GitHub Actions. The deployment happens automatically when code is merged to main branch. We have staging and production environments.',
    author: 'Sarah Chen',
    date: '2 hours ago',
    channel: 'dev-team'
  },
  {
    id: '2',
    type: 'document',
    title: 'Team Deployment Guide',
    content: 'Our deployment process follows these steps: 1) Code review and approval 2) Automated testing 3) Staging deployment 4) Manual QA testing 5) Production deployment. All deployments are logged and can be rolled back if needed.',
    author: 'Mike Johnson',
    date: '1 day ago'
  }
];

const mockQueryHistory = [
  {
    id: '1',
    question: 'How does our deployment process work?',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    answerPreview: 'We use automated CI/CD pipelines with GitHub Actions...'
  },
  {
    id: '2',
    question: 'What are the team communication guidelines?',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    answerPreview: 'Use Slack for daily communication, email for external...'
  },
  {
    id: '3',
    question: 'Where can I find the API documentation?',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    answerPreview: 'API documentation is available in our internal wiki...'
  }
];

const exampleQueries = [
  "How does our deployment process work?",
  "What are the team communication guidelines?",
  "Where can I find the API documentation?",
  "What's our code review process?"
];

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [queryHistory, setQueryHistory] = useState(mockQueryHistory);
  const [selectedQueryId, setSelectedQueryId] = useState(undefined);
  const [knowledgeBase, setKnowledgeBase] = useState(mockSources);
  const isMobile = useIsMobile();

  // Initialize dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleQuery = async (question) => {
    setIsLoading(true);
    setCurrentResult(null);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Use the updated knowledge base for sources
    const relevantSources = knowledgeBase.slice(0, Math.min(3, knowledgeBase.length));
    
    const mockResult = {
      id: Date.now().toString(),
      question,
      answer: `Based on our team's knowledge base (${knowledgeBase.length} documents), here's what I found about "${question}". Our deployment process is automated and follows industry best practices. We use GitHub Actions for CI/CD, which automatically tests and deploys code when it's merged to the main branch. The process includes automated testing, staging deployment, manual QA verification, and finally production deployment. All deployments are logged and can be rolled back if issues are discovered.`,
      sources: relevantSources,
      timestamp: new Date().toISOString()
    };
    
    // Add to history
    const historyItem = {
      id: mockResult.id,
      question,
      timestamp: mockResult.timestamp,
      answerPreview: mockResult.answer.substring(0, 100) + '...'
    };
    
    setQueryHistory(prev => [historyItem, ...prev]);
    setCurrentResult(mockResult);
    setSelectedQueryId(mockResult.id);
    setIsLoading(false);
  };

  const handleSelectQuery = (query) => {
    setSelectedQueryId(query.id);
    // In a real app, you would fetch the full result from the backend
    const relevantSources = knowledgeBase.slice(0, Math.min(3, knowledgeBase.length));
    const mockResult = {
      id: query.id,
      question: query.question,
      answer: `This is the cached answer for: "${query.question}". ${query.answerPreview}`,
      sources: relevantSources,
      timestamp: query.timestamp
    };
    setCurrentResult(mockResult);
  };

  const handleFileUpload = (uploadedFiles) => {
    // Convert uploaded files to knowledge base sources
    const newSources = uploadedFiles
      .filter(file => file.status === 'success')
      .map(file => ({
        id: file.id,
        type: 'document',
        title: file.name,
        content: generateMockContent(file.name),
        author: 'You',
        date: 'Just now'
      }));
    
    // Add new sources to knowledge base
    setKnowledgeBase(prev => [...newSources, ...prev]);
    
    // Show success message
    if (newSources.length > 0) {
      console.log(`Added ${newSources.length} documents to knowledge base`);
    }
  };

  // Generate mock content based on file name for demo purposes
  const generateMockContent = (fileName) => {
    const name = fileName.toLowerCase();
    if (name.includes('deployment') || name.includes('deploy')) {
      return 'This document contains detailed information about our deployment procedures, including automated testing, staging environments, and production rollout strategies.';
    } else if (name.includes('api') || name.includes('documentation')) {
      return 'This document provides comprehensive API documentation including endpoints, authentication methods, request/response formats, and usage examples.';
    } else if (name.includes('security') || name.includes('policy')) {
      return 'This document outlines our security policies, including access controls, data protection measures, incident response procedures, and compliance requirements.';
    } else if (name.includes('onboarding') || name.includes('guide')) {
      return 'This document contains step-by-step onboarding instructions for new team members, including setup procedures, tools overview, and initial tasks.';
    } else {
      return `This document contains important information extracted from ${fileName}. The content has been processed and indexed for search and retrieval.`;
    }
  };

  const EmptyState = () => (
    <motion.div
      key="empty"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-16 text-muted-foreground"
    >
      <p className="text-lg mb-6">Ask a question to get started</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto mb-4">
        {exampleQueries.map((query, index) => (
          <motion.button
            key={query}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleQuery(query)}
            className="p-3 text-sm bg-accent/50 hover:bg-accent rounded-lg border border-border transition-colors text-left"
            disabled={isLoading}
          >
            <span className="text-muted-foreground">Try: </span>
            <span className="text-foreground">{query}</span>
          </motion.button>
        ))}
      </div>
      <p className="text-sm mt-6 text-muted-foreground/70">
        Click any example above or type your own question
      </p>
    </motion.div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="space-y-6">
          <QueryBox onSubmit={handleQuery} isLoading={isLoading} />
          
          <AnimatePresence mode="wait">
            {isLoading ? (
              <LoadingState key="loading" />
            ) : currentResult ? (
              <ResultsDisplay key="results" result={currentResult} />
            ) : (
              <EmptyState />
            )}
          </AnimatePresence>
          
          <QueryLog
            queryHistory={queryHistory}
            onSelectQuery={handleSelectQuery}
            selectedQueryId={selectedQueryId}
          />
        </div>
        <FileUpload onUploadComplete={handleFileUpload} />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="h-screen bg-background">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel defaultSize={75} minSize={50}>
          <div className="h-full p-8 overflow-auto">
            <div className="max-w-5xl mx-auto space-y-8">
              <QueryBox onSubmit={handleQuery} isLoading={isLoading} />
              
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <LoadingState key="loading" />
                ) : currentResult ? (
                  <ResultsDisplay key="results" result={currentResult} />
                ) : (
                  <EmptyState />
                )}
              </AnimatePresence>
            </div>
          </div>
        </ResizablePanel>
        
        <ResizableHandle className="w-2 bg-border hover:bg-border/80 transition-colors" />
        
        <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
          <div className="h-full p-6 border-l bg-card/50">
            <KnowledgeBaseStatus sources={knowledgeBase} />
            <QueryLog
              queryHistory={queryHistory}
              onSelectQuery={handleSelectQuery}
              selectedQueryId={selectedQueryId}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      <FileUpload onUploadComplete={handleFileUpload} />
      <Toaster />
    </div>
  );
}