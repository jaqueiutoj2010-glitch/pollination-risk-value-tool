# Public review deployment checklist

- [ ] Freeze Git tag `v2.41-review`
- [ ] Confirm 4M benchmark results locally
- [ ] Run `source("run_tests.R")`
- [ ] Confirm 2,054 catalogue UIDs are unique
- [ ] Test Portuguese and English interfaces
- [ ] Test common-name and scientific-name catalogue searches
- [ ] Deploy the frozen app to shinyapps.io
- [ ] Test the public URL in a private/incognito browser window
- [ ] Confirm no tokens, passwords, local paths, or private files are committed
- [ ] Add public URL to reviewer documentation/manuscript as appropriate
- [ ] Keep V2.41 immutable during peer review
- [ ] After acceptance, create a new final release and archive it with a DOI
- [ ] Choose and add a software license before declaring an openly licensed final release
