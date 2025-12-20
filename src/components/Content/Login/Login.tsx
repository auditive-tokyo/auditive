import React, { useState } from "react";
import { useAuth } from "../../../auth/AuthContext";

const Login: React.FC = () => {
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const success = await login(apiKey);
      if (!success) {
        setError("Invalid API key");
      } else {
        // ログイン成功時、単純にホームに戻す
        // App.tsx のルーティングロジックがデフォルトページを適切に処理
        window.location.hash = "";
      }
    } catch {
      setError("An error occurred during login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black/50">
      <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Login
        </h2>
        {error && (
          <div className="bg-red-500/50 backdrop-blur-sm text-white p-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter Your Pass Baby!!!"
            className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
            required
          />
          <button
            type="submit"
            className="w-full mt-4 bg-cyan-500 text-white py-2 rounded hover:bg-cyan-600 transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
