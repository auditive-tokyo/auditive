import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { useContent } from '../../../hooks/useContent';
import { Content } from '../../../types/content';

interface ShowContentProps {
  id: string;
}

const ShowContent: React.FC<ShowContentProps> = ({ id }) => {
  const [content, setContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getContent } = useContent();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await getContent(id);
        setContent(data);
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!content) {
    return <div>Content not found</div>;
  }

  return (
    <div className="p-5 bg-black/50 rounded-lg">
      <h1 className="text-2xl mb-4 text-white">{content.title}</h1>
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown
          rehypePlugins={[rehypeRaw]}
          remarkPlugins={[remarkGfm]}
        >
          {content.content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default ShowContent;