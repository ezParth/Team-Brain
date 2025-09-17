import os
from flask import Flask, request, jsonify
import pathway as pw
from pathway.xpacks.llm import embedders, vectorstores

app = Flask(__name__)

# Schema for Slack messages
class SlackMessage(pw.Schema):
    text: str
    user: str
    ts: str

# Pathway pipeline
slack_stream = pw.io.http.read(SlackMessage)

embedder = embedders.OpenAIEmbedder(api_key=os.getenv("OPENAI_API_KEY"))
embedded = embedder(slack_stream.text)
vs = vectorstores.InMemoryVectorStore(embedded, slack_stream)

retriever = vs.as_retriever()

@app.route("/ingest", methods=["POST"])
def ingest():
    # Just acknowledge, Pathway pipeline handles data ingestion automatically
    return jsonify({"status": "received"}), 200

@app.route("/query", methods=["POST"])
def query():
    question = request.json["question"]
    results = retriever.retrieve(question, k=5)
    context = [{"text": r.payload["text"], "user": r.payload["user"]} for r in results]
    return jsonify({"context": context})

if __name__ == "__main__":
    app.run(port=8000)
