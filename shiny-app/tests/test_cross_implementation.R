# Cross-implementation test: production R calc_metrics() vs actual JS calc().
# Called from shiny-app/run_tests.R, with working directory shiny-app/.
stopifnot(file.exists("app.R"), file.exists("../site/assets/app.js"))
src <- readLines("app.R", warn=FALSE, encoding="UTF-8")
start <- grep("^calc_metrics <- function", src)
stopifnot(length(start)==1L)
# Function ends at its first top-level closing brace, before tr_pt.
end <- which(seq_along(src)>start & trimws(src)=="}")[1]
stopifnot(length(end)==1L, !is.na(end))
env <- new.env(parent=baseenv())
eval(parse(text=paste(src[start:end], collapse="\n")), envir=env)
stopifnot(is.function(env$calc_metrics))
csv <- normalizePath("data/article_4M.csv", mustWork=TRUE)
d <- read.csv(csv, check.names=FALSE, stringsAsFactors=FALSE, fileEncoding="UTF-8-BOM")
keys <- c("pv","xv","evp","epv","pedr","epdr","pl","xl")
cases <- list(
  list(name="baseline_0", reduction=0, dr=NULL),
  list(name="baseline_10", reduction=.10, dr=NULL),
  list(name="baseline_25", reduction=.25, dr=NULL),
  list(name="baseline_50", reduction=.50, dr=NULL),
  list(name="baseline_100", reduction=1, dr=NULL),
  list(name="sensitivity", reduction=.25, dr=c(.95,.95,.05,.25)),
  list(name="boundary_zero", reduction=.25, dr=rep(0,4)),
  list(name="boundary_one", reduction=.25, dr=rep(1,4))
)
report_rows <- list()
for (case in cases) {
  input <- d
  if (!is.null(case$dr)) input$Pollination_Dependence <- case$dr
  r <- env$calc_metrics(input, case$reduction)
  args <- c("../tools/calc_js_cli.mjs", csv, as.character(case$reduction))
  if (!is.null(case$dr)) args <- c(args, paste(case$dr, collapse=","))
  output <- suppressWarnings(system2("node", args=args, stdout=TRUE, stderr=TRUE))
  status <- attr(output, "status")
  if (!is.null(status) && status != 0) stop(paste(case$name, paste(output,collapse="\n")))
  js <- as.numeric(strsplit(tail(output,1), "\t", fixed=TRUE)[[1]])
  stopifnot(length(js)==length(keys), all(is.finite(js)))
  rv <- unlist(r[keys], use.names=FALSE)
  delta <- abs(rv-js)
  report_rows[[length(report_rows)+1L]] <- data.frame(
    scenario=case$name, reduction=case$reduction, metric=keys,
    r_value=as.numeric(rv), js_value=as.numeric(js),
    absolute_difference=as.numeric(delta), tolerance=rep(1e-9,length(keys)),
    passed=as.logical(delta<=1e-9), stringsAsFactors=FALSE
  )
  if (any(delta>1e-9)) stop(sprintf("%s: maximum difference = %.12g",case$name,max(delta)))
  cat(sprintf("PASS %-18s max absolute difference %.3g\n",case$name,max(delta)))
}
cat("Cross-implementation numeric checks passed (8 cases, 8 metrics each).\n")

# Persist complete scenario-level evidence for CI artifact upload.
report <- do.call(rbind, report_rows)
dir.create("../validation-output", showWarnings=FALSE, recursive=TRUE)
write.csv(report, "../validation-output/cross_implementation_results.csv", row.names=FALSE, na="")
cat("Saved validation-output/cross_implementation_results.csv (", nrow(report), " comparisons).\n", sep="")
