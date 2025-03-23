import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { useContent } from '../../../hooks/useContent';
import { Content } from '../../../types/content';
import { useAuth } from '../../../auth/AuthContext';
import EditContent from '../EditContent/EditContent'; // 新しく作成する編集用コンポーネント

interface ShowContentProps {
  id: string;
}

const ShowContent: React.FC<ShowContentProps> = ({ id }) => {
  const [content, setContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // 編集モードの状態管理
  const { getContent } = useContent();
  const { isAuthenticated } = useAuth(); // 認証状態を取得

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
  }, [id, getContent]);

  // 編集モードの切り替え
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  // 編集完了後のコールバック
  const handleEditComplete = (updatedContent: Content) => {
    setContent(updatedContent);
    setIsEditing(false);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!content) {
    return <div>Content not found</div>;
  }

  // 編集モードの場合は編集フォームを表示
  if (isEditing) {
    return <EditContent content={content} onComplete={handleEditComplete} onCancel={() => setIsEditing(false)} />;
  }

  return (
    <div className="content-wrapper">
      {/* タイトルとボタンを含むコンテナ */}
      <div className="relative text-center mb-6">
        <h1 className="text-2xl text-white font-bold inline-block">{content.title}</h1>
        
        {/* 認証済みの場合のみ編集ボタンを表示（右上に配置） */}
        {isAuthenticated && (
          <button 
            onClick={toggleEditMode}
            className="absolute right-0 top-0 px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-500 transition-colors"
          >
            Edit
          </button>
        )}
      </div>
      
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