
'use client';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Heart } from 'lucide-react';
import { RecommendButton } from '@/components/recommend-dialog';

export function FloatingRecommendButton({ shareUrl }: { shareUrl: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg"
          aria-label="Share the love"
        >
          <Heart className="h-7 w-7 fill-current" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 mr-4">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Share the Love!</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              Enjoying our food? Help us grow by recommending us to your friends and family!
            </p>
          </div>
          <RecommendButton
            shareUrl={shareUrl}
            triggerText="Copy Shareable Link"
            variant="default"
            className="w-full"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
