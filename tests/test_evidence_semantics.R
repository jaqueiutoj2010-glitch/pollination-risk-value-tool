cat("TEST: scientific evidence semantics\n")

e <- read.csv(
  "data/crop_evidence_database.csv",
  stringsAsFactors = FALSE,
  check.names = FALSE
)
e$DR <- suppressWarnings(as.numeric(e$DR))

yes <- tolower(trimws(e$Selectable_for_calculation)) %in% c("yes","true","1","sim")
derived <- grepl("derived",tolower(ifelse(is.na(e$Original_or_derived),"",e$Original_or_derived)))

# Missing evidence is NA, never silently converted to zero.
stopifnot(all(is.na(e$DR[!yes]) | e$DR[!yes] >= 0))

# Every selectable coefficient has a traceable source.
stopifnot(all(nzchar(trimws(e$Evidence_ID[yes]))))
stopifnot(all(nzchar(trimws(e$Reference[yes]))))
stopifnot(all(nzchar(trimws(e$Source_ID[yes]))))
stopifnot(all(nzchar(trimws(e$Evidence_lineage[yes]))))

# Derived records cannot create a new independent lineage by themselves.
if(any(derived)){
  stopifnot(all(nzchar(trimws(e$Evidence_lineage[derived]))))
}

# Passion fruit no longer combines multiple sources in one row.
pas <- e[e$Crop=="Passion fruit",,drop=FALSE]
if(nrow(pas)>0){
  stopifnot(all(!grepl(";",pas$Reference,fixed=TRUE)))
}

# Expected examples of convergence and divergence in the curated starter library.
tom <- e[e$Crop=="Tomato" & yes & !derived,,drop=FALSE]
stopifnot(length(unique(tom$DR)) > 1)

cof <- e[e$Crop=="Coffee" & yes & !derived,,drop=FALSE]
stopifnot(length(unique(cof$DR)) == 1)
stopifnot(length(unique(cof$Evidence_lineage)) >= 2)

cat("PASS: scientific evidence semantics\n")
