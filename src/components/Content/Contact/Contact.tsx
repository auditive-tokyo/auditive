import React, { useState } from 'react';
import { client } from '@/lib/amplify';

const Contact: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await client.graphql({
        query: `
          mutation SendContactForm($input: SendContactFormInput!) {
            sendContactForm(input: $input) {
              success
              message
            }
          }
        `,
        variables: {
          input: { name, email, message }
        }
      });

      const response = (result as { data: { sendContactForm: { success: boolean; message: string } } }).data.sendContactForm;
      
      if (response.success) {
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
    <div className="p-5 rounded-lg"> {/* 背景色を削除 */}
      <h1 className="mb-4">Contact</h1>
      <p className="text-lg text-gray-300 mb-6">
        Contact us for collab, booking, or just to say hi!
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="mb-4">
          <label htmlFor="name" className="block mb-1 text-white">
            Name:
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isLoading}
            className="w-full p-2.5 bg-transparent border border-gray-600 focus:border-cyan-500 text-white rounded text-base outline-none transition-colors"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block mb-1 text-white">
            Email:
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="w-full p-2.5 bg-transparent border border-gray-600 focus:border-cyan-500 text-white rounded text-base outline-none transition-colors"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="message" className="block mb-1 text-white">
            Message:
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            disabled={isLoading}
            className="w-full p-2.5 bg-transparent border border-gray-600 focus:border-cyan-500 text-white rounded text-base h-[150px] resize-y outline-none transition-colors"
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center justify-center min-w-[120px] mx-auto py-3 px-5 bg-cyan-600 text-white rounded-md text-base transition-colors hover:bg-cyan-500 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
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