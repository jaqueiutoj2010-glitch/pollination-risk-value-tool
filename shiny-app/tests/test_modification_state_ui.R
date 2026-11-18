# Regression check for the reference-only modification warning.
source_code <- paste(readLines("app.R", warn=FALSE, encoding="UTF-8"),collapse="\n")
stopifnot(grepl('modification_state <- reactive',source_code,fixed=TRUE))
stopifnot(grepl('if(ref_changed) return("reference")',source_code,fixed=TRUE))
stopifnot(grepl('if(dr_changed) return("coefficient")',source_code,fixed=TRUE))
stopifnot(grepl('div(strong(modified_title()),br(),span(modified_detail()))',source_code,fixed=TRUE))
stopifnot(grepl('resultados econômicos permanecem inalterados',source_code,fixed=TRUE))
cat("Reference-only warning checks passed.\n")
