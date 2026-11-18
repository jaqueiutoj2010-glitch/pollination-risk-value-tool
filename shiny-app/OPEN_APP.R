# Pollination Risk and Value Tool | Open the application in RStudio
# Open the .Rproj file first, then run this script with Source.
required <- c("shiny", "DT", "readxl")
missing <- required[!vapply(required, requireNamespace, logical(1), quietly = TRUE)]
if (length(missing)) {
  message("Installing required packages: ", paste(missing, collapse = ", "))
  install.packages(missing, repos = "https://cloud.r-project.org")
}
if (!file.exists("app.R") || !dir.exists("data")) {
  stop("Open PollinationRiskTool.Rproj in RStudio first. The project folder must contain app.R and data/.")
}
shiny::runApp(appDir = ".", launch.browser = TRUE)
