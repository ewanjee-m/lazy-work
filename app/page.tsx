import { content } from '@/lib/content';

export default function Page() {
  return (
    <main className="min-h-screen p-8">
      <pre className="whitespace-pre-wrap">{content.introNote}</pre>
    </main>
  );
}
