import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { useContent } from '../../../hooks/useContent';
import { ActionButtons } from './components/ActionButtons';

const CreateContent: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [preview, setPreview] = useState(false);
  const { createContent } = useContent();
  const [isLoading, setIsLoading] = useState(false);

  const components = {
    // divやiframeなどのHTMLをそのまま扱えるようにする
    p: ({ children }) => {
      if (typeof children === 'string' && (
        children.includes('<iframe') || 
        children.includes('<div') || 
        children.includes('<span')
      )) {
        return <div dangerouslySetInnerHTML={{ __html: children }} />;
      }
      return <p>{children}</p>;
    }
  };

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

  return (
    <div className="p-5 bg-black/50 rounded-lg">
      <h2 className="text-2xl mb-4 text-black">Create New Page</h2>
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setPreview(false)}
          className={`px-4 py-2 rounded ${!preview ? 'bg-cyan-500' : 'bg-gray-700'}`}
        >
          Edit
        </button>
        <button
          onClick={() => setPreview(true)}
          className={`px-4 py-2 rounded ${preview ? 'bg-cyan-500' : 'bg-gray-700'}`}
        >
          Preview
        </button>
      </div>

      {!preview ? (
        <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Page Title"
            className="p-2 bg-gray-800 text-white rounded"
            required
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Content (Markdown supported)"
            className="p-2 bg-gray-800 text-white rounded min-h-[400px] font-mono"
            required
          />
          <ActionButtons isLoading={isLoading} onSubmit={handleSubmit} />
        </form>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="preview-content bg-gray-800 p-4 rounded">
            <h1 className="text-2xl mb-4 text-white">{title}</h1>
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown 
                rehypePlugins={[rehypeRaw]}
                remarkPlugins={[remarkGfm]}
                components={components}
              >
                {content}
              </ReactMarkdown>
            </div>
          </div>
          <ActionButtons isLoading={isLoading} onSubmit={handleSubmit} />
        </div>
      )}
    </div>
  );
};

export default CreateContent;