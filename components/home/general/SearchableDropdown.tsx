'use client';

import { useState, useEffect, useRef } from 'react';

interface SearchableDropdown {
  emails: string[];
  selectedEmail: string;
  onSelect: (email: string) => void;
}

export default function SearchableDropdown({
  emails,
  selectedEmail,
  onSelect,
}: SearchableDropdown) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(selectedEmail);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredEmails = emails.filter((email) =>
    email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  useEffect(() => {
    setSearchTerm(selectedEmail);
  }, [selectedEmail]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleSelect = (email: string) => {
    onSelect(email);
    setSearchTerm(email);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full h-10" ref={dropdownRef}>
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder="Search for an email..."
        className="px-3 w-full h-full focus:outline-none focus:ring-0 bg-transparent text-sm rounded-sm"
      />
      {isOpen && filteredEmails.length > 0 && (
        <ul className="absolute z-10 w-full mt-2 max-h-60 overflow-y-auto bg-dark-700 border-[1px] border-primary/40 rounded-sm __dokmai_scrollbar">
          {filteredEmails.map((email, index) => (
            <li
              key={index}
              onClick={() => handleSelect(email)}
              className="px-3 py-2 text-sm hover:bg-primary/10 cursor-pointer">
              {email}
            </li>
          ))}
        </ul>
      )}
      {isOpen && filteredEmails.length === 0 && (
        <div className="absolute z-10 w-full bg-dark-700 border-[1px] border-primary/40 rounded-sm mt-1 p-2 text-sm text-gray-500">
          No emails found.
        </div>
      )}
    </div>
  );
}
