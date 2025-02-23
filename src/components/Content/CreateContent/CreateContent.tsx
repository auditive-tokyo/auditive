import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useContent } from '../../../hooks/useContent';

const CreateContent: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [preview, setPreview] = useState(false);
  const { createContent } = useContent();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'published') => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createContent(title, content, status);  // statusを渡す
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
        <form className="flex flex-col gap-4">
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
          <div className="flex gap-4">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'draft')}
              disabled={isLoading}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded disabled:bg-gray-700"
            >
              {isLoading ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'published')}
              disabled={isLoading}
              className="flex-1 bg-cyan-500 text-white px-4 py-2 rounded disabled:bg-gray-700"
            >
              {isLoading ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </form>
      ) : (
        <div className="preview-content bg-gray-800 p-4 rounded">
          <h1 className="text-2xl mb-4 text-white">{title}</h1>
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateContent;