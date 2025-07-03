
"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { Review } from '@/lib/types';
import { reviews as mockReviews } from '@/lib/mock-data';
import { useToast } from "@/hooks/use-toast";
import { useOrders } from './orders';
import { useAuth } from './auth';

type ReviewContextType = {
  reviews: Review[];
  addReview: (orderId: string, rating: number, comment: string) => void;
  addAdminReply: (reviewId: string, reply: string) => void;
  togglePublishStatus: (reviewId: string) => void;
  deleteReview: (reviewId: string) => void;
};

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'culina-preorder-reviews';

export function ReviewProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const { addReviewToOrder, removeReviewIdFromOrder } = useOrders();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (item) {
        setReviews(JSON.parse(item));
      }
    } catch (error) {
      console.error("Failed to load reviews from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reviews));
    } catch (error) {
      console.error("Failed to save reviews to localStorage", error);
    }
  }, [reviews]);


  const addReview = useCallback((orderId: string, rating: number, comment: string) => {
    const newReview: Review = {
      id: `REV-${Date.now()}`,
      orderId,
      customerName: currentUser?.name || 'Guest User',
      rating,
      comment,
      date: new Date().toISOString().split('T')[0],
      isPublished: false,
    };
    setReviews(prevReviews => [newReview, ...prevReviews]);
    addReviewToOrder(orderId, newReview.id);
    toast({
      title: "Review Submitted!",
      description: "Thank you for your valuable feedback. It will be reviewed by our team shortly.",
      className: "bg-green-500 text-white"
    });
  }, [addReviewToOrder, toast, currentUser]);

  const addAdminReply = useCallback((reviewId: string, reply: string) => {
    setReviews(prevReviews => 
      prevReviews.map(r => (r.id === reviewId ? { ...r, adminReply: reply } : r))
    );
    toast({
      title: "Reply Sent",
      description: "Your reply has been saved.",
    });
  }, [toast]);

  const togglePublishStatus = useCallback((reviewId: string) => {
    let publishedState = false;
    setReviews(prevReviews =>
      prevReviews.map(r => {
        if (r.id === reviewId) {
          publishedState = !r.isPublished;
          return { ...r, isPublished: !r.isPublished };
        }
        return r;
      })
    );
    toast({
      title: "Review Updated",
      description: `Review has been ${publishedState ? 'published' : 'unpublished'}.`,
    });
  }, [toast]);

  const deleteReview = useCallback((reviewId: string) => {
    const reviewToDelete = reviews.find(r => r.id === reviewId);
    if (!reviewToDelete) return;

    setReviews(prevReviews => prevReviews.filter(r => r.id !== reviewId));
    removeReviewIdFromOrder(reviewToDelete.orderId);

    toast({
      title: "Review Deleted",
      description: "The review has been permanently deleted.",
      variant: "destructive",
    });
  }, [reviews, removeReviewIdFromOrder, toast]);


  return (
    <ReviewContext.Provider value={{ reviews, addReview, addAdminReply, togglePublishStatus, deleteReview }}>
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
