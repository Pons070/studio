
"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { Review } from '@/lib/types';
import { reviews as mockReviews } from '@/lib/mock-data';
import { useToast } from "@/hooks/use-toast";
import { useOrders } from './orders';

type ReviewContextType = {
  reviews: Review[];
  addReview: (orderId: string, rating: number, comment: string) => void;
  addAdminReply: (reviewId: string, reply: string) => void;
};

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export function ReviewProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const { addReviewToOrder } = useOrders();
  const { toast } = useToast();

  const addReview = useCallback((orderId: string, rating: number, comment: string) => {
    const newReview: Review = {
      id: `REV-${Date.now()}`,
      orderId,
      customerName: 'Guest User',
      rating,
      comment,
      date: new Date().toISOString().split('T')[0],
    };
    setReviews(prevReviews => [newReview, ...prevReviews]);
    addReviewToOrder(orderId, newReview.id);
    toast({
      title: "Review Submitted!",
      description: "Thank you for your valuable feedback.",
      className: "bg-green-500 text-white"
    });
  }, [addReviewToOrder, toast]);

  const addAdminReply = useCallback((reviewId: string, reply: string) => {
    setReviews(prevReviews => 
      prevReviews.map(r => (r.id === reviewId ? { ...r, adminReply: reply } : r))
    );
    toast({
      title: "Reply Sent",
      description: "Your reply has been saved.",
    });
  }, [toast]);

  return (
    <ReviewContext.Provider value={{ reviews, addReview, addAdminReply }}>
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
