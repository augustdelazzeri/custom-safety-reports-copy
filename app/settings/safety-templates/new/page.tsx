"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewTemplate() {
  const router = useRouter();

  useEffect(() => {
    // In a real app, this would probably create a draft first or just open a blank editor
    // For the prototype, we'll just redirect to the editor with a mock "new" ID
    router.push('/settings/safety-templates/new-template-id');
  }, [router]);

  return <div className="p-8 text-center text-gray-500 font-medium italic">Redirecting to template editor...</div>;
}
