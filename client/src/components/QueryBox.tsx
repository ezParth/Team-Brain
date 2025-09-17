import { useState } from "react";
import axios from "axios";

interface Props {
  setResults: (r: string) => void;
}

export default function QueryBox({ setResults }: Props) {
  const [query, setQuery] = useState("");

  const handleAsk = async () => {
    const { data } = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/query`,
      { question: query }
    );
    setResults(data.answer);
  };

  return (
    <div className="flex gap-2">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask something..."
        className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded"
      />
      <button onClick={handleAsk} className="px-4 py-2 bg-blue-600 rounded">
        Ask
      </button>
    </div>
  );
}
