import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LexiGuide — AI-Powered Legal Document Understanding & Assistance',
  description: 'Understand the fine print before it becomes a problem. Plain-language explanations, clause detection, grounded Q&A, and contract comparison.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-emerald-100 selection:text-emerald-900">
        {children}
      </body>
    </html>
  );
}
