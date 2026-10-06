cat("TEST: Shiny app parse/load\n")

stopifnot(file.exists("app.R"))
parse(file = "app.R")

cat("PASS: app.R parses successfully\n")
