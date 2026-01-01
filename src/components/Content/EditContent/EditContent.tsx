import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { useContent } from "@/hooks/useContent";
import { Content } from "@/types/content";

interface EditContentProps {
  content: Content;
  onComplete: (updatedContent: Content) => void;
  onCancel: () => void;
}

const EditContent: React.FC<EditContentProps> = ({
  content,
  onComplete,
  onCancel,
}) => {
  const [title, setTitle] = useState(content.title);
  const [contentText, setContentText] = useState(content.content || "");
  const [preview, setPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const { updateContent } = useContent();

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContentText(newContent);

    // h1タグまたは#で始まる行があるかチェック
    const hasH1 =
      newContent.toLowerCase().includes("<h1") ||
      newContent.split("\n").some((line) => line.trim().startsWith("# "));
    setShowWarning(hasH1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // 現在のステータスを維持
      const status = content.status || "PUBLISHED";
      const updatedContent = await updateContent(
        content.id,
        contentText,
        status,
        title
      );
      onComplete(updatedContent);
    } catch (error) {
      console.error("Error updating content:", error);
      alert("Failed to update content");
    } finally {
      setIsLoading(false);
    }
  };

  const components = {
    // CreateContentと同じコンポーネント定義
    p: ({ children }) => {
      if (
        typeof children === "string" &&
        (children.includes("<h") ||
          children.includes("<a") ||
          children.includes("<iframe") ||
          children.includes("<div") ||
          children.includes("<span"))
      ) {
        return <div dangerouslySetInnerHTML={{ __html: children }} />;
      }
      return <p>{children}</p>;
    },
  };

  return (
    <div className="content-wrapper">
      <h2 className="text-2xl mb-4 text-white">Edit Page</h2>
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setPreview(false)}
          className={`px-4 py-2 rounded ${
            !preview ? "bg-cyan-500" : "bg-gray-700"
          }`}
        >
          Edit
        </button>
        <button
          onClick={() => setPreview(true)}
          className={`px-4 py-2 rounded ${
            preview ? "bg-cyan-500" : "bg-gray-700"
          }`}
        >
          Preview
        </button>
      </div>

      {!preview ? (
        <div className="flex flex-col gap-4">
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
              value={contentText}
              onChange={handleContentChange}
              placeholder="Content (Markdown supported)"
              className="p-2 bg-gray-800 text-white rounded min-h-[400px] font-mono w-full"
              required
            />
            {showWarning && (
              <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 rounded m-2 text-sm">
                Please use the title field for main headings instead of # or
                &lt;h1&gt;
              </div>
            )}
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 bg-cyan-500 text-white px-4 py-2 rounded disabled:bg-gray-700"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded disabled:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
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
                {contentText}
              </ReactMarkdown>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 bg-cyan-500 text-white px-4 py-2 rounded disabled:bg-gray-700"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded disabled:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditContent;
