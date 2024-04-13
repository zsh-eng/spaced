import { State } from '@/schema';

export default function FlashcardState({ state }: { state: State }) {
  switch (state) {
    case 'New':
      return <p className='text-accentblue'>{state}</p>;
    case 'Learning':
      return <p className='text-destructive'>{state}</p>;
    case 'Relearning':
      return <p className='text-destructive'>{state}</p>;
    case 'Review':
      return <p className='text-success'>{state}</p>;
    default:
      return <p>{state}</p>;
  }
}
