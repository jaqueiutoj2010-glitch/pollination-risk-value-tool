# Dashboard card selection: static wiring and preservation of original data
a <- paste(readLines("app.R",warn=FALSE),collapse="\n")
stopifnot(grepl("dashboard_crop_card",a,fixed=TRUE))
stopifnot(grepl("dashboard_crop_detail",a,fixed=TRUE))
stopifnot(grepl("dashboard_all_crops",a,fixed=TRUE))
stopifnot(grepl("calc_metrics(row)",a,fixed=TRUE))
cat("Dashboard crop selection wiring checks passed.\n")
