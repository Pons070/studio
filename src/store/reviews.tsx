
"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { Review } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from './auth';
import { useOrders } from './orders';

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
  const { addReviewToOrder: linkReviewToOrder, removeReviewIdFromOrder } = useOrders();
  const { toast } = useToast();

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/reviews');
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const addReview = useCallback(async (orderId: string, rating: number, comment: string) => {
    const reviewData = {
      orderId, rating, comment,
      customerName: currentUser?.name || 'Guest User',
    };
    
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });
      if (!response.ok) throw new Error('Failed to submit review');
      const { review: newReview } = await response.json();
      
      linkReviewToOrder(orderId, newReview.id);
      fetchReviews();
      
      toast({
        title: "Review Submitted!",
        description: "Thank you for your valuable feedback.",
        variant: "success",
      });
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  }, [toast, currentUser, linkReviewToOrder, fetchReviews]);

  const addAdminReply = useCallback(async (reviewId: string, reply: string) => {
    const reviewToUpdate = reviews.find(r => r.id === reviewId);
    if (!reviewToUpdate) return;
    
    try {
      await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...reviewToUpdate, adminReply: reply }),
      });
      fetchReviews();
      toast({ title: "Reply Sent" });
    } catch (error) {
       toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  }, [reviews, toast, fetchReviews]);

  const togglePublishStatus = useCallback(async (reviewId: string) => {
    const reviewToUpdate = reviews.find(r => r.id === reviewId);
    if (!reviewToUpdate) return;
    
    try {
      await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...reviewToUpdate, isPublished: !reviewToUpdate.isPublished }),
      });
      fetchReviews();
      toast({ title: "Review Updated" });
    } catch (error) {
       toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  }, [reviews, toast, fetchReviews]);

  const deleteReview = useCallback(async (reviewId: string, orderId: string) => {
    try {
      await fetch('/api/reviews', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reviewId, orderId }),
      });
      fetchReviews();
      toast({ title: "Review Deleted", variant: "destructive" });
    } catch (error) {
       toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  }, [toast, fetchReviews]);

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
