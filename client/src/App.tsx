import { useState } from "react";
import QueryBox from "./components/QueryBox";
import Results from "./components/Results";

function App() {
  const [results, setResults] = useState("");

  return (
    <div className="p-6 bg-gray-900 text-white h-screen">
      <h1 className="text-2xl mb-4">🧠 Team Brain Dashboard</h1>
      <QueryBox setResults={setResults} />
      <Results results={results} />
    </div>
  );
}

export default App;
