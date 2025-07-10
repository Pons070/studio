
"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { Review } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from './auth';
import { addReviewToStore, deleteReviewFromStore, getReviews, updateReviewInStore } from '@/lib/review-store';
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
  const [reviews, setReviews] = useState<Review[]>(getReviews());
  const { currentUser } = useAuth();
  const { addReviewToOrder: linkReviewToOrder, removeReviewIdFromOrder } = useOrders();
  const { toast } = useToast();

  const addReview = useCallback(async (orderId: string, rating: number, comment: string) => {
    const reviewData: Omit<Review, 'id' | 'date' | 'isPublished'> = {
      orderId,
      rating,
      comment,
      customerName: currentUser?.name || 'Guest User',
    };
    
    const newReview: Review = {
      ...reviewData,
      id: `REV-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      isPublished: false,
    };
    
    addReviewToStore(newReview);
    linkReviewToOrder(orderId, newReview.id);
    setReviews(getReviews());
    
    toast({
      title: "Review Submitted!",
      description: "Thank you for your valuable feedback.",
      variant: "success",
    });
  }, [toast, currentUser, linkReviewToOrder]);

  const addAdminReply = useCallback(async (reviewId: string, reply: string) => {
    const reviewToUpdate = reviews.find(r => r.id === reviewId);
    if (!reviewToUpdate) return;
    
    const updatedReview = { ...reviewToUpdate, adminReply: reply };
    updateReviewInStore(updatedReview);
    setReviews(getReviews());
    toast({ title: "Reply Sent" });
  }, [reviews, toast]);

  const togglePublishStatus = useCallback(async (reviewId: string) => {
    const reviewToUpdate = reviews.find(r => r.id === reviewId);
    if (!reviewToUpdate) return;

    const updatedReview = { ...reviewToUpdate, isPublished: !reviewToUpdate.isPublished };
    updateReviewInStore(updatedReview);
    setReviews(getReviews());
    toast({ title: "Review Updated" });
  }, [reviews, toast]);

  const deleteReview = useCallback(async (reviewId: string, orderId: string) => {
    deleteReviewFromStore(reviewId);
    removeReviewIdFromOrder(orderId);
    setReviews(getReviews());
    toast({ title: "Review Deleted", variant: "destructive" });
  }, [toast, removeReviewIdFromOrder]);

  return (
    <ReviewContext.Provider value={{ reviews, addReview, addAdminReply, togglePublishStatus, deleteReview, isLoading: false }}>
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
