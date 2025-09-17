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
embedder = embedders.OpenAIEmbedder(cache_strategy=DiskCache())

# Create a VectorStoreServer (real-time ingestion)
vector_server = VectorStoreServer(
    embedder=embedder,
    splitter=text_splitter,
    parser=parser
)

# LLM setup
chat = llms.OpenAIChat(
    model=os.getenv("OPENAI_MODEL", "gpt-3.5-turbo"),
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
    Ingest new Slack messages or documents into the Pathway VectorStoreServer
    """
    data = request.get_json()
    text = data.get("text")
    user = data.get("user")
    ts = data.get("ts")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    # Insert into vector server
    vector_server.insert({"text": text, "user": user, "ts": ts})
    return jsonify({"status": "received"}), 200


@app.route("/query", methods=["POST"])
def query():
    """
    Query the RAG system for answers based on ingested Slack messages
    """
    data = request.get_json()
    question = data.get("question", "")
    if not question:
        return jsonify({"error": "No question supplied"}), 400

    answer = rag_app.ask(question)
    return jsonify({"answer": answer}), 200


if __name__ == "__main__":
    # Start the RAG server in background (optional)
    rag_app.build_server(
        host="0.0.0.0",
        port=int(os.getenv("PATHWAY_FLASK_PORT", 8000))
    )
    # Start Flask API
    app.run(host="0.0.0.0", port=int(os.getenv("PATHWAY_FLASK_PORT", 8000)))













# import os
# from flask import Flask, request, jsonify
# import pathway as pw
# from pathway.xpacks.llm import embedders
# # from pathway.xpacks.llm.vector_store import VectorStore
# from pathway.xpacks.llm.vector_store import VectorStore
# from dotenv import load_dotenv

# load_dotenv()

# app = Flask(__name__)

# # --- Pathway pipeline ---
# embedder = embedders.OpenAIEmbedder(api_key=os.getenv("OPENAI_API_KEY"))

# # Create a vector store for real-time ingestion
# vs = VectorStore(embedding=embedder)

# # Flask endpoint to ingest messages
# @app.route("/ingest", methods=["POST"])
# def ingest():
#     data = request.get_json()
#     text = data.get("text")
#     user = data.get("user")
#     ts = data.get("ts")

#     if not text:
#         return jsonify({"error": "No text provided"}), 400

#     # Push into vector store
#     vs.insert({"text": text, "user": user, "ts": ts})
#     return jsonify({"status": "received"}), 200

# # Flask endpoint to query top-k results
# @app.route("/query", methods=["POST"])
# def query():
#     data = request.get_json()
#     question = data.get("question", "")
#     if not question:
#         return jsonify({"error": "No question supplied"}), 400

#     # Retrieve top 5 relevant messages
#     results = vs.query(question, k=5)
#     contexts = [{"text": r["text"], "metadata": {"user": r.get("user"), "ts": r.get("ts")}} for r in results]
#     return jsonify({"context": contexts}), 200

# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=int(os.getenv("PATHWAY_FLASK_PORT", 8000)))





# import os
# from flask import Flask, request, jsonify
# import pathway as pw
# from pathway.xpacks.llm import embedders
# from pathway.xpacks.llm.vector_store import VectorStoreServer, VectorStoreClient
# from dotenv import load_dotenv

# load_dotenv()

# app = Flask(__name__)

# # Define schema for incoming Slack messages
# class SlackMessage(pw.Schema):
#     text: str
#     user: str
#     ts: str

# # Read Slack messages via HTTP (ingest endpoint)
# slack_stream = pw.io.http.read(SlackMessage)

# # Use embedder
# embedder = embedders.OpenAIEmbedder(api_key=os.getenv("OPENAI_API_KEY"))

# # Create a VectorStore server pipeline
# # This will embed incoming Slack messages and index them
# vs_server = VectorStoreServer(
#     docs=slack_stream.select(text=pw.this.text, user=pw.this.user, ts=pw.this.ts),
#     embedder=embedder,
#     parser=None,   # None as messages are already text; use parser only for files
#     splitter=None, # None or set if you want to split large texts
#     doc_post_processors=None
# )

# # Start the server in background or separate thread if needed
# # But for simplicity here, we'll just have the pipeline and respond via client
# client = VectorStoreClient(url=f"http://localhost:{os.getenv('VS_SERVER_PORT', '9000')}")

# @app.route("/ingest", methods=["POST"])
# def ingest():
#     # Ingest endpoint: slack messages pushed from backend
#     return jsonify({"status": "received"}), 200

# @app.route("/query", methods=["POST"])
# def query():
#     data = request.get_json()
#     question = data.get("question", "")
#     if not question:
#         return jsonify({"error": "No question supplied"}), 400

#     # Retrieve top-k contexts
#     # using VectorStoreClient
#     results = client.query(query=question, k=5)
#     # results is a list of dict with text, metadata etc. Format depends on server params
#     contexts = []
#     for r in results:
#         # Example fields: r["text"], r["metadata"] maybe includes user / timestamp
#         contexts.append({
#             "text": r.get("text"),
#             "metadata": r.get("metadata", {})
#         })

#     return jsonify({"context": contexts}), 200

# if __name__ == "__main__":
#     # Start the VectorStoreServer pipeline
#     # It has to be running for the client to work
#     # Could run it before or in another process

#     vs_server.run_server(
#         host="0.0.0.0", 
#         port=int(os.getenv("VS_SERVER_PORT", "9000")),
#         with_cache=True
#     )

#     # Also start flask
#     app.run(host="0.0.0.0", port=int(os.getenv("PATHWAY_FLASK_PORT", "8000")))