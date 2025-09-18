import pathway as pw

# Declare the Schema of your tables using pw.Schema.
# There are two input tables: (1) measurements which is 
# live stream and (2) threshold which is a CSV that might be modified over time.
# Both have two columns: a name (str) and a float.
class MeasurementSchema(pw.Schema):
    name: str
    value: float


class ThresholdSchema(pw.Schema):
    name: str
    threshold: float


# Define Kafka configuration to connect to your Kafka instance
rdkafka_settings = {
    "bootstrap.servers": "server-address:9092",
    "security.protocol": "sasl_ssl",
    "sasl.mechanism": "SCRAM-SHA-256",
    "group.id": "$GROUP_NAME",
    "session.timeout.ms": "6000",
    "sasl.username": "username",
    "sasl.password": "********",
}

# Accessing the measurements using the Kafka Connector
measurements_table = pw.io.kafka.read(
    rdkafka_settings,
    topic="topic",
    schema=MeasurementSchema,
    format="json",
    autocommit_duration_ms=1000
)

# Accessing the threshold data stored in CSV files
thresholds_table = pw.io.csv(
    './data/',
    schema=ThresholdSchema,
)
# './threshold-data/',

# Joining tables on the column name
joined_table = (
    # The left table is measurements_table (referred as pw.left)
    measurements_table
    .join(
        # The right table is thresholds_table (referred as pw.right)
        thresholds_table,
        # The join is done on the column name of each table 
        pw.left.name==pw.right.name,
    )
    # The columns of the joined table are chosen using select
    .select(
        # All the columns of measurements are kept
        *pw.left,
        # The threshold column of the threshold table is kept
        pw.right.threshold
    )
)

alerts_table = (
    joined_values
    # Filtering value strictly higher than the threshold.
    .filter(pw.this.value > pw.this.threshold)
    # Only name and value fields are kept
    .select(pw.this.name, pw.this.value)
)

# Sending the results to another Kafka topic, on the same Kafka instance
pw.io.kafka.write(
    alerts_table, rdkafka_settings, topic_name="alerts_topic", format="json"
)

# Launching Pathway computation.
