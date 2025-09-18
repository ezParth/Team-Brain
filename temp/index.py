import pathway as pw

class InputSchema(pw.Schema):
    colA: int
    colB: float
    colC: str

# Read the CSV file from the './data/' directory
input_table = pw.io.csv.read('./data/', schema=InputSchema)

# Filter the table to keep only rows where colA is greater than 0
filtered_table = input_table.filter(input_table.colA > 0)

# Group the filtered data by colB and calculate the sum of colC for each group.
# Note: For strings, `sum` performs a concatenation.
result_table = (
    filtered_table
    .groupby(filtered_table.colB)
    .reduce(sum_val=pw.reducers.sum(pw.this.colC))
)

# Write the final result to the './output/' directory
pw.io.csv.write(result_table, './output/')

# Run the entire Pathway computation graph
pw.run()