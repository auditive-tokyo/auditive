import React, { useState } from 'react';
import './Contact.css';

function Contact() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);  // 追加
    const apiUrl = process.env.REACT_APP_CONTACT_FORM_API_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!apiUrl) {
            alert('API URL is not set. Please check your configuration.');
            return;
        }

        setIsLoading(true);  // 送信開始時にローディング開始

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, message }),
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
            setIsLoading(false);  // 処理完了時にローディング終了
        }
    };

    return (
        <div className="contact-content">
            <h2>Contact</h2>
            <p className="contact-description">Contact us for collab, booking, or just to say hi!</p>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Name:</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={isLoading}  // 送信中は入力を無効化
                    />
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}  // 送信中は入力を無効化
                    />
                </div>
                <div>
                    <label htmlFor="message">Message:</label>
                    <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        disabled={isLoading}  // 送信中は入力を無効化
                    ></textarea>
                </div>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send'}  {/* 送信中はテキストを変更 */}
                    {isLoading && <span className="spinner" />}  {/* ローディング中はスピナーを表示 */}
                </button>
            </form>
        </div>
    );
}

export default Contact;