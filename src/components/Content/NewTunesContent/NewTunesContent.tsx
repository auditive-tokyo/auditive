import React, { useState, useEffect } from 'react';
import { useContent } from '../../../hooks';
import '../styles/contentStyles.css';

const NewTunesContent: React.FC = () => {
  const { getContent, updateContent } = useContent();
  const [description, setDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // テスト用のコンテンツID（実際にはDBに存在するIDを使用）
    const contentId = 'test-content-id';
    const fetchContent = async () => {
      try {
        const content = await getContent(contentId);
        if (content) {
          setDescription(content.content || '');
        }
      } catch (error) {
        console.error('Error fetching content:', error);
      }
    };
    fetchContent();
  }, []);

  const handleSave = async () => {
    try {
      await updateContent('test-content-id', description);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating content:', error);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4 content-base">
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="font-bold">
              AUDITIVE is Tokyo based Japanese Drum&Bass Producer.
            </p>
            <p className="description-text">
              {description || 'Focusing on mainly dark, minimal side of Drum&Bass.'}
            </p>
            <p className="description-text">
              Developing some VST plugins as one of my hobby too.
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              Edit
            </button>
          </>
        )}
      </div>
      <iframe
        title="AUDITIVE - New Tunes (Unreleased) on SoundCloud"
        width="100%"
        height="500"
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
        src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/1850456031&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"
      ></iframe>
    </div>
  );
};

export default NewTunesContent;