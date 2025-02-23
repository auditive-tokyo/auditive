import React, { useState } from 'react';

const Contact: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const apiUrl: string | undefined = import.meta.env.VITE_CONTACT_FORM_API_URL;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!apiUrl) {
      alert('API URL is not set. Please check your configuration.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, message })
      });
      if (response.ok) {
        alert('Message sent successfully!');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-5 bg-gray-100 rounded-lg shadow sm:p-4">
      <h2 className="text-center text-gray-800 mb-5">Contact</h2>
      <p className="text-center text-gray-600 mb-5 text-base">
        Contact us for collab, booking, or just to say hi!
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="mb-4">
          <label htmlFor="name" className="block mb-1 text-gray-700 font-bold">
            Name:
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isLoading}
            className="w-full p-2.5 border border-gray-300 rounded text-base"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block mb-1 text-gray-700 font-bold">
            Email:
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="w-full p-2.5 border border-gray-300 rounded text-base"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="message" className="block mb-1 text-gray-700 font-bold">
            Message:
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            disabled={isLoading}
            className="w-full p-2.5 border border-gray-300 rounded text-base h-[150px] resize-y"
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center justify-center min-w-[120px] mx-auto py-3 px-5 bg-blue-600 text-white rounded-md text-base transition-colors duration-300 ease-in-out hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Sending...' : 'Send'}
          {isLoading && (
            <span className="w-5 h-5 border-2 border-white border-t-2 border-t-transparent animate-spin ml-2"></span>
          )}
        </button>
      </form>
    </div>
  );
};

export default Contact;