import pathway as pw

t = pw.io.csv.read(
    "./data/",
    ["value"],
    types = {"value": pw.type.int},
    mode = "streaming"
)

t = t.reduce(sum=pw.reducers.sum(t.value))

pw.io.csv.write(t, "output.csv")

pw.run()
