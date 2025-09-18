import os
from flask import Flask, request, jsonify
import pathway as pw
from pathway.xpacks.llm import embedders, splitters, llms, parsers
from pathway.xpacks.llm.vector_store import VectorStoreServer
from pathway.xpacks.llm.question_answering import AdaptiveRAGQuestionAnswerer
from pathway.udfs import DiskCache, ExponentialBackoffRetryStrategy
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# --- Pathway RAG setup ---

parser = parsers.UnstructuredParser()
text_splitter = splitters.TokenCountSplitter(max_tokens=400)

# Lazy Gemini Embedder to avoid API call on startup
class LazyGeminiEmbedder(embedders.GeminiEmbedder):
    def get_embedding_dimension(self):
        return 1536

embedder = LazyGeminiEmbedder(
    api_key=os.getenv("GOOGLE_API_KEY"),
    cache_strategy=DiskCache()
)

# ✅ No docs argument, since we'll insert dynamically
vector_server = VectorStoreServer(
    embedder=embedder,
    splitter=text_splitter,
    parser=parser
)

# LLM setup using Gemini
chat = llms.GeminiChat(
    model=os.getenv("GEMINI_MODEL", "gemini-1.5"),
    retry_strategy=ExponentialBackoffRetryStrategy(max_retries=6),
    cache_strategy=DiskCache(),
    temperature=0.05
)

# Adaptive RAG Question Answerer
rag_app = AdaptiveRAGQuestionAnswerer(
    llm=chat,
    indexer=vector_server
)

# --- Flask endpoints ---

@app.route("/ingest", methods=["POST"])
def ingest():
    """
    Ingest new messages/documents into the VectorStoreServer
    """
    data = request.get_json()
    text = data.get("text")
    user = data.get("user")
    ts = data.get("ts")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    # Insert into vector server dynamically
    vector_server.insert({"text": text, "user": user, "ts": ts})
    return jsonify({"status": "received"}), 200


@app.route("/query", methods=["POST"])
def query():
    """
    Query the RAG system for answers
    """
    data = request.get_json()
    question = data.get("question", "")
    if not question:
        return jsonify({"error": "No question supplied"}), 400

    answer = rag_app.ask(question)
    return jsonify({"answer": answer}), 200


if __name__ == "__main__":
    port = int(os.getenv("PATHWAY_FLASK_PORT", 8000))
    print("✅ Pathway RAG server starting...")
    print(f"🚀 Flask API running on port {port}")
    app.run(host="0.0.0.0", port=port)
