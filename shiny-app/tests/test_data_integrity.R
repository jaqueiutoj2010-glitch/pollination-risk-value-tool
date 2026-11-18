cat("TEST: data integrity\n")

stopifnot(file.exists("data/article_4M.csv"))
stopifnot(file.exists("data/crop_evidence_database.csv"))
stopifnot(file.exists("data/evidence_source_registry.csv"))

a <- read.csv("data/article_4M.csv", stringsAsFactors=FALSE, check.names=FALSE)
e <- read.csv("data/crop_evidence_database.csv", stringsAsFactors=FALSE, check.names=FALSE)

required_article <- c("Crop","Production_Value","Export_Value","Pollination_Dependence")
required_evidence <- c(
  "Evidence_ID","Crop","Reference","DOI","DR","Geographic_scope",
  "Evidence_type","Source_ID","Source_database","Original_or_derived",
  "Evidence_lineage","Validation_status","Selectable_for_calculation"
)

stopifnot(all(required_article %in% names(a)))
stopifnot(all(required_evidence %in% names(e)))
stopifnot(!anyDuplicated(e$Evidence_ID))
stopifnot(all(nzchar(trimws(e$Evidence_ID))))
stopifnot(all(nzchar(trimws(e$Reference))))
stopifnot(all(nzchar(trimws(e$Source_ID))))
stopifnot(all(nzchar(trimws(e$Evidence_lineage))))

dr <- suppressWarnings(as.numeric(e$DR))
quant <- !is.na(dr)
stopifnot(all(dr[quant] >= 0 & dr[quant] <= 1))

selectable <- tolower(trimws(e$Selectable_for_calculation)) %in% c("yes","true","1","sim")
stopifnot(all(!selectable | quant))
stopifnot(all(!selectable | tolower(trimws(e$Evidence_type)) == "quantitative"))

cat("PASS: data integrity\n")
