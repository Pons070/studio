
"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { Review } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useOrders } from './orders';
import { useAuth } from './auth';

type ReviewContextType = {
  reviews: Review[];
  addReview: (orderId: string, rating: number, comment: string) => Promise<void>;
  addAdminReply: (reviewId: string, reply: string) => Promise<void>;
  togglePublishStatus: (reviewId: string) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  isLoading: boolean;
};

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'culina-preorder-reviews';

export function ReviewProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addReviewToOrder, removeReviewIdFromOrder } = useOrders();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    async function loadReviews() {
        setIsLoading(true);
        try {
            const cachedReviews = window.localStorage.getItem(LOCAL_STORAGE_KEY);
            if (cachedReviews) {
                setReviews(JSON.parse(cachedReviews));
            }

            const response = await fetch('/api/reviews');
            const data = await response.json();

            if (data.success) {
                setReviews(data.reviews);
                window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.reviews));
            } else {
                if (!cachedReviews) {
                    toast({ title: 'Error', description: 'Could not fetch the latest reviews.', variant: 'destructive' });
                }
            }
        } catch (error) {
             console.error("Failed to fetch reviews from API", error);
             if (!window.localStorage.getItem(LOCAL_STORAGE_KEY)) {
                toast({ title: 'Network Error', description: 'Could not connect to the server.', variant: 'destructive' });
             }
        } finally {
            setIsLoading(false);
        }
    }
    loadReviews();
  }, [toast]);
  
  useEffect(() => {
    if (!isLoading) {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reviews));
    }
  }, [reviews, isLoading]);


  const addReview = useCallback(async (orderId: string, rating: number, comment: string) => {
    const reviewData = {
      orderId,
      rating,
      comment,
      customerName: currentUser?.name || 'Guest User',
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
        addReviewToOrder(orderId, newReview.id);
        toast({
          title: "Review Submitted!",
          description: "Thank you for your valuable feedback. It will be reviewed by our team shortly.",
          variant: "success",
        });
    } catch (error) {
        toast({ title: 'Network Error', description: 'Could not connect to the server to submit review.', variant: 'destructive' });
    }
  }, [addReviewToOrder, toast, currentUser]);

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
        toast({
          title: "Reply Sent",
          description: "Your reply has been saved.",
        });
    } catch (error) {
        toast({ title: 'Network Error', description: 'Could not connect to the server to add reply.', variant: 'destructive' });
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
            toast({ title: "Error", description: result.message || "Failed to update review status.", variant: "destructive" });
            return;
        }

        setReviews(prevReviews =>
          prevReviews.map(r => (r.id === reviewId ? result.review : r))
        );
        toast({
          title: "Review Updated",
          description: `Review has been ${updatedReview.isPublished ? 'published' : 'unpublished'}.`,
        });
    } catch (error) {
        toast({ title: 'Network Error', description: 'Could not connect to the server to update status.', variant: 'destructive' });
    }
  }, [reviews, toast]);

  const deleteReview = useCallback(async (reviewId: string) => {
    const reviewToDelete = reviews.find(r => r.id === reviewId);
    if (!reviewToDelete) return;
    
    try {
        const response = await fetch('/api/reviews', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: reviewId }),
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            toast({ title: "Error", description: result.message || "Failed to delete review.", variant: "destructive" });
            return;
        }

        setReviews(prevReviews => prevReviews.filter(r => r.id !== reviewId));
        removeReviewIdFromOrder(reviewToDelete.orderId);
        toast({
          title: "Review Deleted",
          description: "The review has been permanently deleted.",
          variant: "destructive",
        });
    } catch (error) {
        toast({ title: 'Network Error', description: 'Could not connect to the server to delete review.', variant: 'destructive' });
    }
  }, [reviews, removeReviewIdFromOrder, toast]);


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
