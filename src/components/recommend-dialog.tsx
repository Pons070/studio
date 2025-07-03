
'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecommendButtonProps {
  shareUrl: string;
  triggerText?: string;
  variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "destructive" | "accent";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function RecommendButton({
  shareUrl,
  triggerText = 'Copy Link',
  variant = 'default',
  size = 'default',
  className,
}: RecommendButtonProps) {
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
        toast({ title: 'Link Copied!', description: 'The shareable link has been copied to your clipboard.' });
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        toast({ title: 'Error', description: 'Failed to copy the link.', variant: 'destructive' });
    });
  };

  return (
    <Button onClick={copyToClipboard} variant={variant} size={size} className={className}>
      <Copy className={cn(size !== 'icon' && 'mr-2 h-4 w-4')} />
      {size !== 'icon' && triggerText}
    </Button>
  );
}
