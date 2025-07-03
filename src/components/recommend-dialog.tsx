
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Share2, Copy, Twitter, Facebook } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecommendButtonProps {
  shareUrl: string;
  shareTitle: string;
  shareText: string;
  triggerText?: string;
  variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "destructive" | "accent";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function RecommendButton({
  shareUrl,
  shareTitle,
  shareText,
  triggerText = 'Recommend Us',
  variant = 'default',
  size = 'default',
  className,
}: RecommendButtonProps) {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        toast({ title: 'Thanks for sharing!' });
      } catch (error) {
        // This can happen if the user cancels the share sheet.
        // We only want to log/notify for real errors, not the user dismissing the share UI.
        if (error instanceof DOMException && error.name === 'AbortError') {
          // User cancelled the share, do nothing.
        } else {
          console.error('Error sharing:', error);
          toast({
            title: 'Could Not Share',
            description: 'Something went wrong while trying to share.',
            variant: 'destructive',
          });
        }
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      setDialogOpen(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({ title: 'Link Copied!', description: 'The link has been copied to your clipboard.' });
  };
  
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <Button onClick={handleShare} variant={variant} size={size} className={className}>
        <Share2 className={cn(size !== 'icon' && 'mr-2 h-4 w-4')} />
        {size !== 'icon' && triggerText}
      </Button>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share with friends</DialogTitle>
          <DialogDescription>
            Help us spread the word about our delicious food!
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input id="link" defaultValue={shareUrl} readOnly />
          </div>
          <Button type="button" size="sm" className="px-3" onClick={copyToClipboard}>
            <span className="sr-only">Copy</span>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex justify-center space-x-4 pt-4">
          <Button asChild variant="outline" size="icon" className="h-12 w-12 rounded-full">
            <a href={twitterUrl} target="_blank" rel="noopener noreferrer">
                <Twitter className="h-6 w-6" />
                <span className="sr-only">Share on Twitter</span>
            </a>
          </Button>
           <Button asChild variant="outline" size="icon" className="h-12 w-12 rounded-full">
            <a href={facebookUrl} target="_blank" rel="noopener noreferrer">
                <Facebook className="h-6 w-6" />
                <span className="sr-only">Share on Facebook</span>
            </a>
          </Button>
          <Button asChild variant="outline" size="icon" className="h-12 w-12 rounded-full">
            <a href={whatsappUrl} data-action="share/whatsapp/share" target="_blank" rel="noopener noreferrer">
                <svg
                    aria-hidden="true"
                    focusable="false"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="currentColor"
                >
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 6.045.001 10.952-4.906 10.953-10.951s-4.908-10.951-10.953-10.951c-6.045.001-10.952 4.907-10.953 10.951.001 2.23.654 4.385 1.846 6.24l-.47 1.745 1.77 1.78zM9.062 7.025c-.533-.02-1.07.256-1.524.731-.52.521-.842 1.221-.839 2.115l.004.146c.002.484.14.96.402 1.389.282.47.65.912 1.09 1.314.502.462 1.118.898 1.803 1.286 1.526.852 2.997 1.271 4.542.923.37-.082.682-.233.91-.45.24-.23.411-.53.482-.9.102-.533.023-1.008-.164-1.417-.181-.418-.516-.714-.94-.854-.421-.139-.853-.137-1.247.042-.317.145-.633.342-.895.592-.239.231-.402.48-.592.653-.204.19-.41.332-.614.432-.229.112-.493.175-.765.176-.431.002-.82-.153-1.09-.411-.29-.28-.44-.63-.44-.986l.002-.147c.002-.26.06-.51.17-.732.12-.24.28-.45.49-.63.23-.2.49-.34.78-.44.29-.1.59-.14.89-.12l.29.01c.31.02.6.09.87.21.29.13.54.31.75.55.22.23.41.51.51.81.12.35.18.71.18 1.08.002.13-.004.26-.02.38-.01.12-.04.24-.07.35-.04.11-.09.22-.15.33-.06.1-.13.2-.21.29-.09.09-.18.17-.29.23-.11.07-.22.12-.34.17-.12.05-.24.08-.37.11l-.01.01c-.43.11-.84.2-1.22.28-.4.08-.78.15-1.15.21-.39.06-.77.1-1.13.12-.38.01-.74-.02-1.08-.07-.36-.05-.7-.14-1.03-.27-.33-.13-.65-.29-.94-.49-.3-.2-.56-.43-.8-.7l-.01-.01c-.48-.54-.84-1.16-1.06-1.84-.23-.7-.31-1.44-.24-2.21.05-.59.25-1.14.58-1.61.34-.49.8-1.07 1.63-1.15.3-.03.59.01.87.1l.01.01z" />
                </svg>
                <span className="sr-only">Share on WhatsApp</span>
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
