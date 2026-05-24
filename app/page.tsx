import { IntroNote } from '@/components/IntroNote';
import { content } from '@/lib/content';

export default function Page() {
  return (
    <main className="min-h-screen pb-24">
      <IntroNote markdown={content.introNote} />
    </main>
  );
}
