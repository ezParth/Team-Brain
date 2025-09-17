import pathway as pw
from pathway.xpacks.llm import embedders, vectorstores

# Schema for incoming Slack messages
class SlackMessage(pw.Schema):
    text: str
    user: str
    ts: str

# Read Slack messages from HTTP ingestion
slack_stream = pw.io.http.read(SlackMessage)

# Embed messages
embedder = embedders.OpenAIEmbedder()
embedded = embedder(slack_stream.text)

# Store in vector index
vs = vectorstores.InMemoryVectorStore(embedded, slack_stream)

# Expose retriever for queries
retriever = vs.as_retriever()
