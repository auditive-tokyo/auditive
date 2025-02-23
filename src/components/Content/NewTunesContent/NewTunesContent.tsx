import React from 'react';
import '../styles/contentStyles.css';

const NewTunesContent: React.FC = () => {
  return (
    <div className="w-full">
      <div className="mb-4 content-base">
        <p className="font-bold">
          AUDITIVE is Tokyo based Japanese Drum&Bass Producer.
        </p>
        <p className="description-text">
          Focusing on mainly dark, minimal side of Drum&Bass.
        </p>
        <p className="description-text">
          Developing some VST plugins as one of my hobby too.
        </p>
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