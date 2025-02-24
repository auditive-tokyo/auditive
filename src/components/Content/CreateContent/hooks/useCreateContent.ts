import { useState } from 'react';
import { useContent } from '../../../../hooks/useContent';

interface UseCreateContentReturn {
  title: string;
  content: string;
  isLoading: boolean;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  handleSubmit: (status: 'draft' | 'published') => Promise<void>;
}

export const useCreateContent = (): UseCreateContentReturn => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { createContent } = useContent();

  const handleSubmit = async (status: 'draft' | 'published') => {
    setIsLoading(true);
    try {
      await createContent(title, content, status);
      alert(`Content ${status === 'draft' ? 'saved as draft' : 'published'} successfully!`);
      setTitle('');
      setContent('');
    } catch (error) {
      console.error('Error creating content:', error);
      alert('Failed to create content');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    title,
    content,
    isLoading,
    setTitle,
    setContent,
    handleSubmit
  };
};