import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { useCreateContent } from './hooks/useCreateContent';
import { ActionButtons } from './components/ActionButtons';

const CreateContent: React.FC = () => {
  const [preview, setPreview] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const { title, content, isLoading, setTitle, setContent, handleSubmit } = useCreateContent();

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    // h1タグまたは#で始まる行があるかチェック
    const hasH1 = newContent.toLowerCase().includes('<h1') ||
                  newContent.split('\n').some(line => line.trim().startsWith('# '));
    setShowWarning(hasH1);
  };

  const components = {
    // divやiframeなどのHTMLをそのまま扱えるようにする
    p: ({ children }) => {
      if (typeof children === 'string' && (
        children.includes('<h') ||
        children.includes('<a') ||
        children.includes('<iframe') || 
        children.includes('<div') || 
        children.includes('<span')
      )) {
        return <div dangerouslySetInnerHTML={{ __html: children }} />;
      }
      return <p>{children}</p>;
    }
  };

  return (
    <div className="content-wrapper">
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
          <div className="relative">
            <textarea
              value={content}
              onChange={handleContentChange}
              placeholder="Content (Markdown supported)"
              className="p-2 bg-gray-800 text-white rounded min-h-[400px] font-mono w-full"
              required
            />
            {showWarning && (
              <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 rounded m-2 text-sm">
                Please use the title field for main headings instead of # or &lt;h1&gt;
              </div>
            )}
          </div>
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