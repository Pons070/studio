
"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { Review } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from './auth';

type ReviewContextType = {
  reviews: Review[];
  addReview: (orderId: string, rating: number, comment: string) => Promise<void>;
  addAdminReply: (reviewId: string, reply: string) => Promise<void>;
  togglePublishStatus: (reviewId: string) => Promise<void>;
  deleteReview: (reviewId: string, orderId: string) => Promise<void>;
  isLoading: boolean;
};

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export function ReviewProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    async function loadReviews() {
        setIsLoading(true);
        try {
            const response = await fetch('/api/reviews');
            const data = await response.json();
            if (data.success) {
                setReviews(data.reviews);
            } else {
                toast({ title: 'Error', description: 'Could not fetch reviews.', variant: 'destructive' });
            }
        } catch (error) {
             console.error("Failed to fetch reviews from API", error);
             toast({ title: 'Network Error', description: 'Could not connect to the server for reviews.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }
    loadReviews();
  }, [toast]);

  const addReview = useCallback(async (orderId: string, rating: number, comment: string) => {
    const reviewData = {
      orderId,
      rating,
      comment,
      customerName: currentUser?.name || 'Guest User',
      customerId: currentUser?.id || 'guest',
    };

    try {
        const response = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reviewData),
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            toast({ title: "Error", description: result.message || "Failed to submit review.", variant: "destructive" });
            return;
        }

        const newReview: Review = result.review;
        setReviews(prevReviews => [newReview, ...prevReviews]);
        toast({
          title: "Review Submitted!",
          description: "Thank you for your valuable feedback.",
          variant: "success",
        });
    } catch (error) {
        toast({ title: 'Network Error', description: 'Could not connect to the server to submit review.', variant: 'destructive' });
    }
  }, [toast, currentUser]);

  const addAdminReply = useCallback(async (reviewId: string, reply: string) => {
    const reviewToUpdate = reviews.find(r => r.id === reviewId);
    if (!reviewToUpdate) return;
    
    const updatedReview = { ...reviewToUpdate, adminReply: reply };

    try {
        const response = await fetch('/api/reviews', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedReview),
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            toast({ title: "Error", description: result.message || "Failed to add reply.", variant: "destructive" });
            return;
        }

        setReviews(prevReviews => 
          prevReviews.map(r => (r.id === reviewId ? result.review : r))
        );
        toast({ title: "Reply Sent" });
    } catch (error) {
        toast({ title: 'Network Error', description: 'Could not connect to add reply.', variant: 'destructive' });
    }
  }, [reviews, toast]);

  const togglePublishStatus = useCallback(async (reviewId: string) => {
    const reviewToUpdate = reviews.find(r => r.id === reviewId);
    if (!reviewToUpdate) return;

    const updatedReview = { ...reviewToUpdate, isPublished: !reviewToUpdate.isPublished };

    try {
        const response = await fetch('/api/reviews', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedReview),
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            toast({ title: "Error", description: result.message || "Failed to update status.", variant: "destructive" });
            return;
        }

        setReviews(prevReviews =>
          prevReviews.map(r => (r.id === reviewId ? result.review : r))
        );
        toast({ title: "Review Updated" });
    } catch (error) {
        toast({ title: 'Network Error', description: 'Could not connect to update status.', variant: 'destructive' });
    }
  }, [reviews, toast]);

  const deleteReview = useCallback(async (reviewId: string, orderId: string) => {
    try {
        const response = await fetch('/api/reviews', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: reviewId, orderId }),
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            toast({ title: "Error", description: result.message || "Failed to delete review.", variant: "destructive" });
            return;
        }

        setReviews(prevReviews => prevReviews.filter(r => r.id !== reviewId));
        toast({ title: "Review Deleted", variant: "destructive" });
    } catch (error) {
        toast({ title: 'Network Error', description: 'Could not connect to delete review.', variant: 'destructive' });
    }
  }, [toast]);


  return (
    <ReviewContext.Provider value={{ reviews, addReview, addAdminReply, togglePublishStatus, deleteReview, isLoading }}>
      {children}
    </ReviewContext.Provider>
  );
}

export function useReviews() {
  const context = useContext(ReviewContext);
  if (context === undefined) {
    throw new Error('useReviews must be used within a ReviewProvider');
  }
  return context;
}
