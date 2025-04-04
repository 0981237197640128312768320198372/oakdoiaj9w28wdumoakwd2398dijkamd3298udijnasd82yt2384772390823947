import Link from 'next/link';
import React from 'react';

interface Email {
  uid: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  body: string;
}

interface EmailListProps {
  emails: Email[];
}

const EmailList: React.FC<EmailListProps> = ({ emails }) => {
  if (emails.length === 0) {
    return (
      <div className="items-center justify-center w-full border-[1px] border-dark-500 h-full flex flex-col px-10 text-center">
        <span>
          Resend Link Or Code, And Try again.
          <br />
          or <Link href={'https://lin.ee/Ovlixv5'}>Contact Admin</Link>
        </span>
      </div>
    );
  }

  return (
    <div className="border-[1px] border-dark-500 w-full overflow-auto px-5 mt-2 flex gap-10 h-full flex-col-reverse">
      {emails.map((email) => (
        <div key={email.uid} className="border-b-[1px] border-dark-500 py-5">
          <div dangerouslySetInnerHTML={{ __html: email.body }} className="bg-white text-black" />
        </div>
      ))}
    </div>
  );
};

export default EmailList;
