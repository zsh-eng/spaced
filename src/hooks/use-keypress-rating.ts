import { Rating, ratings } from '@/schema';
import { useEffect } from 'react';

/**
 * useKeypressRating is a hook that listens for keypresses and calls the `onRating`.
 */
export default function useKeypressRating(onRating: (rating: Rating) => void) {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case '1':
          onRating(ratings[0]);
          break;
        case '2':
          onRating(ratings[1]);
          break;
        case '3':
          onRating(ratings[2]);
          break;
        case '4':
          onRating(ratings[3]);
          break;
        case '5':
          onRating(ratings[4]);
          break;
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [onRating]);
}
