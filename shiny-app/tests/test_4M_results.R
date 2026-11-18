cat("TEST: 4M calculations\n")

d <- read.csv(
  "data/article_4M.csv",
  stringsAsFactors = FALSE,
  check.names = FALSE
)

num <- function(x) suppressWarnings(as.numeric(x))

pv <- sum(num(d$Production_Value), na.rm = TRUE)
xv <- sum(num(d$Export_Value), na.rm = TRUE)

evp <- sum(
  num(d$Production_Value) *
    num(d$Pollination_Dependence),
  na.rm = TRUE
)

epv <- sum(
  num(d$Export_Value) *
    num(d$Pollination_Dependence),
  na.rm = TRUE
)

stopifnot(abs(pv - 230.1) < 0.2)
stopifnot(abs(xv - 196.8) < 0.2)
stopifnot(abs(evp - 175.8) < 0.2)
stopifnot(abs(epv - 165.3) < 0.2)

pedr <- 100 * evp / pv
epdr <- 100 * epv / xv

stopifnot(abs(pedr - 76.4) < 0.2)
stopifnot(abs(epdr - 84.0) < 0.2)

cat("PASS: 4M calculations\n")
