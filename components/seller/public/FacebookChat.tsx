import React from 'react';
import { FacebookProvider, CustomChat } from 'react-facebook';

const FacebookChat = () => {
  return (
    <FacebookProvider appId="1002173678726517" chatSupport>
      <CustomChat pageId="367994969741279" minimized={false} />
    </FacebookProvider>
  );
};

export default FacebookChat;
