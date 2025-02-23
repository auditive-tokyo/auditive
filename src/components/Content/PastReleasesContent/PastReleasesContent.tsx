import React from 'react';
import '../styles/contentStyles.css';

const PastReleasesContent: React.FC = () => {
  return (
    <div className="w-full">
      <div className="mb-4 content-base">
        <p className="font-bold">Releases from:</p>
        <ul className="list-none p-0 text-left text-[21px]">
          <li className="my-1">Deafmuted Records</li>
          <li className="my-1">Onset Audio</li>
          <li className="my-1">Nyctophilia Recordings</li>
        </ul>
      </div>
      <iframe
        title="AUDITIVE - Switch Dat Break EP on SoundCloud"
        width="100%"
        height="500"
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
        src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/334007637&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"
      ></iframe>
      <iframe
        title="AUDITIVE - Holloway Road EP on SoundCloud"
        width="100%"
        height="500"
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
        src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/639400650&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"
      ></iframe>
      <iframe
        title="NYCT001 :: Keig' - 808or :: PREMIERE! on SoundCloud"
        width="100%"
        height="500"
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
        src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/947367961&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"
      ></iframe>
    </div>
  );
};

export default PastReleasesContent;