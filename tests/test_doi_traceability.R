cat("TEST: DOI traceability\n")
files <- c("data/crop_evidence_database.csv","data/management_evidence_database.csv")
for (f in files) {
  d <- read.csv(f, stringsAsFactors=FALSE, check.names=FALSE)
  stopifnot("DOI" %in% names(d))
  doi <- trimws(ifelse(is.na(d$DOI), "", d$DOI))
  present <- nzchar(doi)
  stopifnot(all(grepl("^10\\.[0-9]{4,9}/\\S+$", doi[present])))
}
cat("PASS: DOI traceability\n")
