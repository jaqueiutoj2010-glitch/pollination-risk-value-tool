test_files <- list.files(
  "tests",
  pattern = "^test_.*\\.R$",
  full.names = TRUE
)

if (length(test_files) == 0) {
  stop("No tests found.")
}

for (f in test_files) {
  cat("\n--- Running", f, "---\n")
  sys.source(f, envir = new.env(parent = globalenv()))
}

cat("\nALL TESTS PASSED\n")
