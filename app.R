library(shiny)
library(DT)
library(readxl)

article_data <- read.csv("data/article_4M.csv", stringsAsFactors=FALSE, check.names=FALSE)
evidence_db <- read.csv("data/crop_evidence_database.csv", stringsAsFactors=FALSE, check.names=FALSE)
evidence_db$DR <- suppressWarnings(as.numeric(evidence_db$DR))
management_evidence <- read.csv("data/management_evidence_database.csv", stringsAsFactors=FALSE, check.names=FALSE)
management_rules <- read.csv("data/management_decision_rules.csv", stringsAsFactors=FALSE, check.names=FALSE)
exposure_bands <- read.csv("data/exposure_priority_bands.csv", stringsAsFactors=FALSE, check.names=FALSE)
management_priority <- read.csv("data/management_priority_matrix.csv", stringsAsFactors=FALSE, check.names=FALSE)
management_actions <- read.csv("data/management_actions.csv", stringsAsFactors=FALSE, check.names=FALSE)
# Catálogo V30: consulta separada; NUNCA combinado com evidence_db ou article_data.
catalogo_v30 <- read.csv("data/catalogo_evidencias_v30.csv", stringsAsFactors=FALSE, check.names=FALSE, fileEncoding="UTF-8-BOM")
catalogo_cols <- c("UID","Fonte","Nome literal","Tipo","Valor literal","Estado bibliográfico","Estado taxonômico","Elegível cálculo automático")
stopifnot(all(catalogo_cols %in% names(catalogo_v30)), !anyNA(catalogo_v30$UID), !anyDuplicated(catalogo_v30$UID))
stopifnot(!any(catalogo_v30[["Elegível cálculo automático"]] == "SIM", na.rm=TRUE))

management_rules$Context_score <- suppressWarnings(as.numeric(management_rules$Context_score))

for(.nm in c("Evidence_ID","DOI","Source_ID","Source_database","Original_or_derived",
             "Evidence_lineage","Validation_status","Selectable_for_calculation")){
  if(!.nm %in% names(evidence_db)) evidence_db[[.nm]] <- NA_character_
}

`%||%` <- function(x,y) if(is.null(x) || length(x)==0 || is.na(x[1])) y else x
money <- function(x) paste0("US$ ",format(round(x,1),nsmall=1,trim=TRUE)," M")
pct <- function(x) paste0(format(round(100*x,1),nsmall=1,trim=TRUE),"%")

yes_flag <- function(x){
  tolower(trimws(as.character(x))) %in% c("yes","true","1","sim")
}

selectable_evidence <- function(q){
  if(nrow(q)==0) return(q)
  ok <- !is.na(q$DR)
  if("Selectable_for_calculation" %in% names(q)){
    ok <- ok & yes_flag(q$Selectable_for_calculation)
  }
  if("Evidence_type" %in% names(q)){
    ok <- ok & tolower(trimws(q$Evidence_type)) == "quantitative"
  }
  q[ok,,drop=FALSE]
}

independent_lineages <- function(q){
  if(nrow(q)==0) return(character())
  x <- q
  if("Original_or_derived" %in% names(x)){
    derived <- grepl("derived",tolower(ifelse(is.na(x$Original_or_derived),"",x$Original_or_derived)))
    x <- x[!derived,,drop=FALSE]
  }
  if(nrow(x)==0) return(character())
  lin <- if("Evidence_lineage" %in% names(x)) x$Evidence_lineage else x$Reference
  unique(lin[!is.na(lin) & nzchar(trimws(lin))])
}

evidence_state <- function(q,current_dr,user_only=FALSE){
  quant <- selectable_evidence(q)
  if(isTRUE(user_only) || nrow(quant)==0) return("user")
  current_matches <- is.finite(current_dr) && any(abs(quant$DR-current_dr) < 1e-9,na.rm=TRUE)
  if(!current_matches) return("user")

  lineages <- independent_lineages(quant)
  if(length(lineages) <= 1) return("registered")

  independent_q <- quant
  if("Original_or_derived" %in% names(independent_q)){
    derived <- grepl("derived",tolower(ifelse(is.na(independent_q$Original_or_derived),"",independent_q$Original_or_derived)))
    independent_q <- independent_q[!derived,,drop=FALSE]
  }
  vals <- unique(round(independent_q$DR[is.finite(independent_q$DR)],10))
  if(length(vals) > 1) "divergent" else "convergent"
}


calc_metrics <- function(d, reduction=0){
  pv <- sum(d$Production_Value,na.rm=TRUE)
  xv <- sum(d$Export_Value,na.rm=TRUE)
  evp <- sum(d$Production_Value*d$Pollination_Dependence,na.rm=TRUE)
  epv <- sum(d$Export_Value*d$Pollination_Dependence,na.rm=TRUE)
  list(pv=pv,xv=xv,evp=evp,epv=epv,
       pedr=if(pv>0)evp/pv else 0, epdr=if(xv>0)epv/xv else 0,
       pl=evp*reduction,xl=epv*reduction)
}

tr_pt <- list(
 title="Pollination Risk and Value Tool",subtitle="Valoração econômica dos serviços de polinização — aplicação ao sistema 4M",
 article="Dados do artigo",template="Modelo de dados",dashboard="Painel",scenarios="Cenários",evidence="Evidências",method="Método",
 results="Principais resultados",results_sub="Resultados atualizados automaticamente a partir dos dados e da evidência selecionada.",
 system="Sistema 4M · 4 culturas",prodvalue="Valor da produção",evp="Valor econômico da polinização (EVP)",
 exportvalue="Valor das exportações",epv="Valor da polinização nas exportações (EPV)",
 composition="Composição do valor da produção",composition_sub="Participação do valor dependente da polinização no sistema 4M",
 dependence="Dependência econômica",pollination="Polinização",other="Outros fatores",
 compare="Valor da produção e da polinização",compare_sub="Comparação entre o valor total e o valor dependente da polinização",
 restore="Restaurar cenário do manuscrito",modified="Base modificada",
 article_intro="Base 4M utilizada no manuscrito. Os valores podem ser editados; o cenário original pode ser restaurado a qualquer momento.",
 choose_crop="Cultura",choose_evidence="Escolha da evidência quantitativa",apply="Aplicar evidência",
 current="DR atualmente em uso",supporting="Evidência ecológica de apoio",
 scenarios_note="Os cenários são testes padronizados de sensibilidade e não previsões climáticas.",
 reduction="Redução simulada do serviço de polinização (%)",prodloss="Exposição econômica — produção",
 exploss="Exposição econômica — exportações",remain_evp="EVP remanescente",remain_epv="EPV remanescente",
 scencompare="Cenários padronizados de redução",scenario_summary="Resumo dos cenários",
 sourcecompare="Comparação das evidências",evidence_help="Quando houver divergência, a escolha do coeficiente permanece explícita.",
 divergence="Evidência divergente",convergent="Evidência convergente",registered="Evidência cadastrada",user_evidence="Evidência não validada",
 divergence_note="Há mais de um coeficiente quantitativo disponível para esta cultura.",
 quantitative="Evidências quantitativas",available="Disponível",applied="DR selecionado",in_use="DR em uso",
 support_note="Evidências sem coeficiente formal são informativas e não entram no cálculo.",
 method_title="Método de cálculo",method_note="A ferramenta estima valor econômico, dependência e exposição sob reduções especificadas do serviço de polinização.",
 method_body="EVP = valor da produção × coeficiente de dependência. EPV = valor das exportações × coeficiente de dependência. PEDR = EVP / valor total da produção. EPDR = EPV / valor total das exportações. As perdas dos cenários são calculadas proporcionalmente ao percentual de redução informado.",
 round_note="A soma dos valores por cultura exibidos com uma casa decimal é US$ 230,1 M; o total agregado reportado no manuscrito é US$ 230,2 M.",
 template_title="Modelo de tabela para novos cultivos",
 template_intro="Baixe o modelo, preencha uma linha por cultivo e mantenha os nomes das colunas. A planilha contém um guia de preenchimento e os campos necessários para calcular EVP, EPV, PEDR, EPDR e os cenários de exposição econômica.",
 template_xlsx="Baixar modelo Excel (.xlsx)",template_csv="Baixar modelo CSV (.csv)",
 template_fields="Informações necessárias",template_fields_note="Os campos econômicos devem usar as mesmas unidades indicadas no modelo. O coeficiente de dependência deve variar de 0 a 1 e deve ser acompanhado, sempre que possível, pela referência utilizada.",
 template_preview="Estrutura do arquivo",required="Obrigatório",recommended="Recomendado",optional="Opcional",
 upload_title="Importar tabela preenchida",upload_intro="Selecione o modelo preenchido em Excel (.xlsx) ou CSV (.csv). A ferramenta valida os campos antes de permitir que os dados sejam aplicados à análise.",
 upload_file="Selecionar arquivo",validate_status="Validação do arquivo",valid_file="Arquivo válido para análise",invalid_file="O arquivo contém problemas que precisam ser corrigidos",
 imported_preview="Pré-visualização dos dados importados",apply_import="Aplicar dados à análise",clear_import="Limpar importação",
 import_applied="Dados importados aplicados ao Painel e aos Cenários.",evidence_alert="Atenção às evidências",no_evidence_alert="Nenhuma divergência quantitativa identificada para as culturas reconhecidas.",
 imported_source="Base importada",analysis_mode_article="Modo Artigo 4M",analysis_mode_user="Modo Análise do Usuário",
 user_subtitle="Valoração econômica dos serviços de polinização — análise dos dados importados",
 user_composition="Participação do valor dependente da polinização na base importada",
 field="Campo",requirement="Requisito",unit="Unidade / formato",description="Descrição",
 manuscript="Cenário do manuscrito",production="Produção",exports="Exportações"
)
tr_en <- list(
 title="Pollination Risk and Value Tool",subtitle="Economic valuation of pollination services — application to the 4M system",
 article="Article data",template="Data template",dashboard="Dashboard",scenarios="Scenarios",evidence="Evidence",method="Method",
 results="Key results",results_sub="Results update automatically from the data and selected evidence.",
 system="4M system · 4 crops",prodvalue="Production value",evp="Economic value of pollination (EVP)",
 exportvalue="Export value",epv="Export pollination value (EPV)",
 composition="Composition of production value",composition_sub="Share of pollination-dependent value in the 4M system",
 dependence="Economic dependence",pollination="Pollination",other="Other factors",
 compare="Production and pollination value",compare_sub="Comparison between total and pollination-dependent value",
 restore="Restore manuscript scenario",modified="Modified base",
 article_intro="4M dataset used in the manuscript. Values can be edited and the original scenario can be restored at any time.",
 choose_crop="Crop",choose_evidence="Select quantitative evidence",apply="Apply evidence",
 current="DR currently in use",supporting="Supporting ecological evidence",
 scenarios_note="Scenarios are standardized sensitivity tests, not climate projections.",
 reduction="Simulated reduction in pollination service (%)",prodloss="Economic exposure — production",
 exploss="Economic exposure — exports",remain_evp="Remaining EVP",remain_epv="Remaining EPV",
 scencompare="Standardized reduction scenarios",scenario_summary="Scenario summary",
 sourcecompare="Evidence comparison",evidence_help="When evidence diverges, coefficient selection remains explicit.",
 divergence="Divergent evidence",convergent="Convergent evidence",registered="Registered evidence",user_evidence="Evidence not validated",
 divergence_note="More than one quantitative coefficient is available for this crop.",
 quantitative="Quantitative evidence",available="Available",applied="Selected DR",in_use="DR in use",
 support_note="Evidence without a formal coefficient is informative and is not used in calculations.",
 method_title="Calculation method",method_note="The tool estimates economic value, dependence, and exposure under specified pollination-service reductions.",
 method_body="EVP = production value × dependence coefficient. EPV = export value × dependence coefficient. PEDR = EVP / total production value. EPDR = EPV / total export value. Scenario losses are calculated proportionally to the specified reduction.",
 round_note="The sum of crop values displayed to one decimal place is US$ 230.1 M; the aggregate total reported in the manuscript is US$ 230.2 M.",
 template_title="Data table template for new crops",
 template_intro="Download the template, fill one row per crop, and keep the column names unchanged. The workbook includes a filling guide and the fields required to calculate EVP, EPV, PEDR, EPDR, and economic-exposure scenarios.",
 template_xlsx="Download Excel template (.xlsx)",template_csv="Download CSV template (.csv)",
 template_fields="Required information",template_fields_note="Economic fields must use the units specified in the template. The pollination-dependence coefficient must range from 0 to 1 and should be accompanied by its source whenever possible.",
 template_preview="File structure",required="Required",recommended="Recommended",optional="Optional",
 upload_title="Import completed table",upload_intro="Select the completed Excel (.xlsx) or CSV (.csv) template. The tool validates the fields before allowing the data to be applied to the analysis.",
 upload_file="Select file",validate_status="File validation",valid_file="File is valid for analysis",invalid_file="The file contains issues that must be corrected",
 imported_preview="Imported data preview",apply_import="Apply data to analysis",clear_import="Clear import",
 import_applied="Imported data applied to Dashboard and Scenarios.",evidence_alert="Evidence attention",no_evidence_alert="No quantitative divergence identified for recognized crops.",
 imported_source="Imported dataset",analysis_mode_article="4M Article Mode",analysis_mode_user="User Analysis Mode",
 user_subtitle="Economic valuation of pollination services — analysis of imported data",
 user_composition="Share of pollination-dependent value in the imported dataset",
 field="Field",requirement="Requirement",unit="Unit / format",description="Description",
 manuscript="Manuscript scenario",production="Production",exports="Exports"
)

crop_svg <- function(crop,size=52){
  svg <- switch(crop,
    "Melon"='<svg viewBox="0 0 100 100" width="SIZE" height="SIZE"><circle cx="50" cy="52" r="30" fill="#B8DF5A"/><path d="M30 27c9 15 9 35 0 50M45 23c6 18 6 40 0 58M60 23c-6 18-6 40 0 58M74 29c-9 14-9 33 0 46" fill="none" stroke="#F7F2C9" stroke-width="4"/></svg>',
    "Watermelon"='<svg viewBox="0 0 100 100" width="SIZE" height="SIZE"><path d="M14 30 Q50 88 86 30 Z" fill="#4EAD61"/><path d="M20 31 Q50 76 80 31 Z" fill="#F7E8B5"/><path d="M25 32 Q50 68 75 32 Z" fill="#F25F67"/><ellipse cx="41" cy="45" rx="2.2" ry="4" fill="#2D4739"/><ellipse cx="58" cy="45" rx="2.2" ry="4" fill="#2D4739"/></svg>',
    "Mango"='<svg viewBox="0 0 100 100" width="SIZE" height="SIZE"><path d="M51 20 C74 16 86 37 76 61 C67 82 45 88 31 71 C18 55 26 34 41 25 C44 23 48 21 51 20Z" fill="#F3A13B"/><path d="M35 40 C43 27 58 23 70 30 C60 31 48 38 41 51 C36 59 34 66 35 72 C27 63 27 50 35 40Z" fill="#F8C84A" opacity=".72"/><path d="M52 21 C61 8 76 9 82 18 C69 19 59 23 52 30Z" fill="#47A75D"/></svg>',
    "Papaya"='<svg viewBox="0 0 100 100" width="SIZE" height="SIZE"><ellipse cx="50" cy="52" rx="25" ry="36" fill="#F7A43B"/><ellipse cx="50" cy="54" rx="12" ry="24" fill="#FFD45A"/></svg>',
    '<svg viewBox="0 0 100 100" width="SIZE" height="SIZE"><circle cx="50" cy="53" r="27" fill="#E7F6F0"/><path d="M50 72V38M50 48C39 44 34 35 35 27C45 28 51 34 52 43M50 50C61 46 67 37 66 29C57 30 51 36 49 44" fill="none" stroke="#0D6A53" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  )
  HTML(gsub("SIZE",as.character(size),svg,fixed=TRUE))
}

css <- "
:root{--green:#0D6A53;--dark:#083F35;--ink:#082F49;--muted:#6F8194;--bg:#F5F8F7;--line:#D9E3DF}
*{box-sizing:border-box}html,body{max-width:100%;overflow-x:hidden}body{margin:0;background:var(--bg);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif}
.wrap{max-width:1440px;width:100%;margin:auto;padding:16px 18px 30px}
.hero{background:linear-gradient(120deg,#0D6A53,#075342);border-radius:0 0 26px 26px;padding:26px 34px;color:white;display:flex;justify-content:space-between;align-items:center;gap:20px;box-shadow:0 16px 35px rgba(6,72,58,.13)}
.brand{display:flex;align-items:center;gap:20px}.logo{width:72px;height:72px;border-radius:50%;background:#E7FAF0;display:flex;align-items:center;justify-content:center;font-size:34px}
.hero h1{margin:0;font-size:37px;line-height:1.05;font-weight:900}.hero p{margin:10px 0 0;font-size:15px}.review-badge{display:inline-block;margin-top:10px;padding:5px 10px;border:1px solid rgba(255,255,255,.65);border-radius:999px;font-size:12px;font-weight:800;letter-spacing:.02em;background:rgba(255,255,255,.12)}.lang{display:flex;gap:10px}.lang .btn{min-width:112px}
.navbar{display:flex;gap:14px;border-bottom:1px solid #D5DFDB;padding:18px 12px 4px;flex-wrap:wrap}.navbtn{background:transparent;border:0;color:#1265A9;font-size:16px;font-weight:800;padding:12px 18px;border-radius:14px}.navbtn.active{background:#0D6A53;color:white}
.title{font-size:32px;font-weight:900;margin:18px 0 4px}.subtitle{color:var(--muted);font-size:14px;margin-bottom:16px}
.box{background:white;border:1px solid var(--line);border-radius:18px;padding:24px;margin-top:18px;box-shadow:0 7px 18px rgba(20,60,50,.035)}
.crop-strip{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:18px 0}.crop{background:white;border:1px solid var(--line);border-radius:15px;padding:14px 18px;display:flex;align-items:center;gap:14px}.crop b{font-size:15px}.crop em{display:block;color:#6F8194;font-size:12px;margin-top:4px}
.grid4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.kpi{border-radius:18px;padding:22px;min-height:155px}.kpi .lab{font-size:13px}.kpi .val{font-size:34px;font-weight:900;margin-top:22px}.kpi .sub{font-size:12px;color:#60758A;margin-top:7px}.k1{background:#E7F6F0}.k2{background:#EAF4FC}.k3{background:#FFF2D8}.k4{background:#F2EDFF}
.chartgrid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px;margin-top:16px}.chartbox{background:white;border:1px solid var(--line);border-radius:17px;padding:20px;overflow:hidden}.charttitle{font-size:21px;font-weight:900;margin-bottom:4px}.chartsub{font-size:12px;color:var(--muted);margin-bottom:10px}
.warning{background:#FFF1D9;border:1px solid #F1C77A;color:#7A4B00;border-radius:14px;padding:13px 15px;margin:14px 0;display:flex;justify-content:space-between;align-items:center;gap:12px}
.note{background:#F7FAF9;border:1px solid var(--line);border-radius:12px;padding:12px 14px;font-size:12px;color:#526B7B;margin:12px 0}
.scenario-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin:16px 0}.scard{border-radius:15px;padding:17px;min-height:118px}.scard .lab{font-size:12px;color:#526B7B}.scard .val{font-size:28px;font-weight:900;margin-top:12px}.s1{background:#E7F6F0}.s2{background:#FFF2D8}.s3{background:#EAF4FC}.s4{background:#F2EDFF}
.evhead{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}.badge{padding:7px 11px;border-radius:999px;font-size:12px;font-weight:800}.badgewarn{background:#FFF0D9;color:#945A00}.badgeok{background:#E5F5EE;color:#0D6A53}
.evgrid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;margin:14px 0}.evcard{background:#F8FBFA;border:1px solid var(--line);border-radius:13px;padding:16px}.evref{font-weight:800;margin-top:7px}.evmeta{font-size:12px;color:#6F8194;margin-top:5px}
table.dataTable{width:100%!important}.dataTables_wrapper{width:100%;overflow-x:auto}table.dataTable thead th{background:#EDF5F2!important;color:#16344E!important}
.irs--shiny .irs-bar{background:#2F8A6E;border-color:#2F8A6E}.irs--shiny .irs-single{background:#2F8A6E}.irs--shiny .irs-handle{border-color:#2F8A6E}
@media(max-width:1050px){.grid4{grid-template-columns:repeat(2,minmax(0,1fr))}.crop-strip{grid-template-columns:repeat(2,minmax(0,1fr))}.chartgrid,.evgrid{grid-template-columns:1fr}.scenario-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:650px){.hero{padding:20px;align-items:flex-start;flex-direction:column}.hero h1{font-size:29px}.grid4,.crop-strip,.scenario-grid{grid-template-columns:1fr}.wrap{padding:10px}.navbtn{padding:10px 12px}}

.crop-selector{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:16px 0 20px}
.crop-select-card{background:#fff;border:2px solid #E2EAE6;border-radius:15px;padding:14px 14px;display:flex;align-items:center;gap:12px;cursor:pointer;transition:.18s ease;min-height:82px}
.crop-select-card:hover{border-color:#77B9A6;transform:translateY(-1px);box-shadow:0 5px 13px rgba(13,106,83,.08)}
.crop-select-card.active{border-color:#0D6A53;background:#F0F9F5;box-shadow:0 5px 13px rgba(13,106,83,.10)}
.crop-select-card .cname{font-size:14px;font-weight:900;color:#082F49}.crop-select-card .csc{font-size:11px;color:#6F8194;font-style:italic;margin-top:3px}
.evhero{display:flex;align-items:center;gap:18px;background:linear-gradient(90deg,#F4FAF7,#FFFFFF);border:1px solid var(--line);border-radius:16px;padding:18px;margin:14px 0}
.evhero .fruitbox{width:82px;height:82px;display:flex;align-items:center;justify-content:center;background:#fff;border-radius:16px;border:1px solid #E5ECE8}
.evhero .ename{font-size:21px;font-weight:900}.evhero .esc{font-size:13px;color:#6F8194;font-style:italic;margin-top:4px}
.evidence-list-card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:14px;margin:10px 0}
.evidence-list-card.applied{border-color:#0D6A53;background:#F0F9F5}
.evidence-list-top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
.evidence-dr{font-size:22px;font-weight:900;color:#0D6A53}.evidence-source{font-size:13px;font-weight:800}.evidence-details{font-size:12px;color:#6F8194;margin-top:4px}
@media(max-width:1050px){.crop-selector{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:650px){.crop-selector{grid-template-columns:1fr}}


.template-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin:18px 0}
.download-card{border:1px solid var(--line);border-radius:16px;padding:20px;background:linear-gradient(135deg,#F2FAF6,#FFFFFF)}
.download-card h3{font-size:18px;font-weight:900;margin:0 0 6px}.download-card p{font-size:12px;color:#6F8194;min-height:35px}
.download-card .btn{margin-top:8px;background:#0D6A53;color:#fff;border-color:#0D6A53;font-weight:800;border-radius:10px;padding:10px 16px}
.field-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:14px 0}
.field-card{border:1px solid var(--line);border-radius:13px;padding:14px;background:#FBFDFC}
.field-card .fname{font-size:13px;font-weight:900}.field-card .freq{font-size:11px;font-weight:800;color:#0D6A53;margin-top:4px}
.field-card .fdesc{font-size:11px;color:#6F8194;margin-top:5px}
.index-box{background:linear-gradient(90deg,#E8F5F0,#F6FBF9);border-left:5px solid #0D6A53;border-radius:13px;padding:15px;margin-top:16px}
@media(max-width:900px){.field-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:650px){.template-actions,.field-grid{grid-template-columns:1fr}}


.upload-zone{border:2px dashed #9BC7B8;border-radius:16px;padding:20px;background:#F8FCFA;margin:18px 0}
.upload-zone .form-group{margin-bottom:8px}.validation-ok{background:#E7F6F0;border:1px solid #9BC7B8;border-radius:13px;padding:14px;color:#0D6A53;margin:12px 0}
.validation-bad{background:#FFF0ED;border:1px solid #E7A99C;border-radius:13px;padding:14px;color:#8A3427;margin:12px 0}
.validation-warn{background:#FFF6E5;border:1px solid #E8C779;border-radius:13px;padding:14px;color:#795000;margin:12px 0}
.user-mode-note{background:#EEF8F4;border:1px solid #B8DCCE;border-radius:13px;padding:14px;color:#0D6A53;margin:12px 0}
.import-actions{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0}.import-actions .btn-success{background:#0D6A53;border-color:#0D6A53;font-weight:800}

.management-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin:16px 0}
.context-card{background:#FBFDFC;border:1px solid var(--line);border-radius:14px;padding:16px}
.rec-card{background:#fff;border:1px solid var(--line);border-left:5px solid #0D6A53;border-radius:14px;padding:18px;margin:12px 0}
.rec-top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.priority{font-weight:900;color:#0D6A53}.evidence-chip{font-size:11px;background:#E7F6F0;color:#0D6A53;padding:5px 9px;border-radius:999px;font-weight:800}.rec-explain{margin-top:12px;padding:12px 14px;background:#F7FBF9;border-radius:10px}.rec-label{font-weight:800;color:#123B52}.rec-caveat{margin-top:8px;font-size:12px;color:#617383}.evidence-item{margin:9px 0}.evidence-doi{font-size:12px}.rec-meta-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}.priority-chip{font-size:11px;background:#EEF4FA;color:#123B52;padding:5px 9px;border-radius:999px;font-weight:800}.evidence-toggle-btn{margin-top:8px;border:1px solid #0D6A53;background:#fff;color:#0D6A53;border-radius:8px;padding:8px 12px;font-weight:800;cursor:pointer}.evidence-toggle-btn:hover{background:#E7F6F0}.evidence-expand-panel{margin-top:10px;padding:12px 14px;background:#FBFDFC;border:1px solid #D9E9E2;border-radius:10px}.diagnostic-summary{margin:10px 0 18px;padding:11px 14px;background:#EEF8F4;border-left:4px solid #0D6A53;border-radius:8px;font-weight:700;color:#123B52}
@media(max-width:850px){.management-grid{grid-template-columns:1fr}}
.about-lead{font-size:16px;line-height:1.75;color:#29485A;max-width:1080px}.about-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin:18px 0}.about-card{background:#FBFDFC;border:1px solid var(--line);border-radius:15px;padding:20px}.about-card h3{margin:0 0 10px;font-size:18px}.about-card p{line-height:1.65;color:#405D6C}.institution-strip{display:grid;grid-template-columns:1.2fr 1fr 1fr;gap:14px;margin:18px 0}.institution-card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:18px;min-height:135px}.institution-role{text-transform:uppercase;letter-spacing:.08em;font-size:10px;font-weight:900;color:#6F8194}.institution-name{font-size:21px;font-weight:900;color:#0D6A53;margin:9px 0 4px}.institution-full{font-size:12px;color:#526B7B;line-height:1.45}.science-note{background:#EEF8F4;border-left:4px solid #0D6A53;border-radius:10px;padding:14px 16px;line-height:1.6}.meta-table{display:grid;grid-template-columns:180px 1fr;gap:8px 16px;font-size:13px;margin-top:12px}.meta-key{font-weight:800;color:#123B52}.about-links a{display:inline-block;margin:5px 12px 5px 0;font-weight:800;color:#1265A9}.funding-note{font-size:11px;color:#6F8194;margin-top:12px;line-height:1.55}@media(max-width:850px){.about-grid,.institution-strip{grid-template-columns:1fr}.meta-table{grid-template-columns:1fr}}
"

ui <- fluidPage(
  tags$head(tags$style(HTML(css))),
  div(class="wrap",
    uiOutput("hero"),
    uiOutput("nav"),
    uiOutput("page")
  )
)

server <- function(input,output,session){
  rv <- reactiveValues(lang="pt",tab="dashboard",d=article_data,source="article",import_data=NULL,import_errors=character(),import_warnings=character(),import_ok=FALSE)
  T <- reactive(if(rv$lang=="pt") tr_pt else tr_en)

  observeEvent(input$pt,{rv$lang <- "pt"})
  observeEvent(input$en,{rv$lang <- "en"})
  observeEvent(input$tab_article,{rv$tab <- "article"})
  observeEvent(input$tab_template,{rv$tab <- "template"})
  observeEvent(input$tab_dashboard,{rv$tab <- "dashboard"})
  observeEvent(input$tab_scenarios,{rv$tab <- "scenarios"})
  observeEvent(input$tab_evidence,{rv$tab <- "evidence"})
  observeEvent(input$tab_management,{rv$tab <- "management"})
  observeEvent(input$tab_method,{rv$tab <- "method"})
  observeEvent(input$tab_about,{rv$tab <- "about"})
  observeEvent(input$tab_catalogo,{rv$tab <- "catalogo"})

  modification_state <- reactive({
    if(!identical(rv$source,"article")) return("imported")
    if(nrow(rv$d)!=nrow(article_data) ||
       !identical(as.character(rv$d$Crop),as.character(article_data$Crop))) return("structure")
    dr_changed <- any(abs(rv$d$Pollination_Dependence-article_data$Pollination_Dependence)>1e-9)
    ref_changed <- any(as.character(rv$d$Evidence_Reference) != as.character(article_data$Evidence_Reference))
    if(dr_changed) return("coefficient")
    if(ref_changed) return("reference")
    "original"
  })
  modified <- reactive(modification_state() != "original")
  modified_title <- reactive({
    state <- modification_state()
    if(state == "reference") return(if(rv$lang=="pt") "Referência científica alterada" else "Scientific reference changed")
    T()$modified
  })
  modified_detail <- reactive({
    state <- modification_state()
    if(state == "imported") return(if(rv$lang=="pt")
      "Tabela preenchida pelo usuário aplicada à análise." else
      "User-completed table applied to the analysis.")
    if(state == "structure") return(if(rv$lang=="pt")
      "A estrutura da base atual difere do cenário do manuscrito." else
      "The current dataset structure differs from the manuscript scenario.")
    if(state == "reference") return(if(rv$lang=="pt")
      "A referência científica selecionada difere da registrada no manuscrito, mas os coeficientes e os resultados econômicos permanecem inalterados." else
      "The selected scientific reference differs from the manuscript record, but coefficients and economic results remain unchanged.")
    if(state != "coefficient") return("")
    idx <- which(abs(rv$d$Pollination_Dependence-article_data$Pollination_Dependence)>1e-9)
    paste(vapply(idx,function(i){
      nm <- if(rv$lang=="pt") rv$d$Crop_PT[i] else rv$d$Crop[i]
      paste0(nm,": DR ",sprintf("%.2f",article_data$Pollination_Dependence[i])," → ",sprintf("%.2f",rv$d$Pollination_Dependence[i]))
    },character(1)),collapse="; ")
  })
  metrics <- reactive(calc_metrics(rv$d,(input$reduction %||% 25)/100))

  warning_ui <- function(id){
    if(identical(rv$source,"import")){
      return(div(class="note",
        div(strong(T()$analysis_mode_user),br(),
            span(if(rv$lang=="pt")
              "Base do usuário ativa — resultados calculados a partir dos dados importados."
            else
              "User dataset active — results calculated from imported data.")),
        actionButton(id,T()$restore)
      ))
    }
    if(!modified()) return(NULL)
    div(class="warning",
        div(strong(modified_title()),br(),span(modified_detail())),
        actionButton(id,T()$restore))
  }

  output$hero <- renderUI({
    div(class="hero",
      div(class="brand",div(class="logo","🌼"),
          div(h1(T()$title),p(if(identical(rv$source,"import")) T()$user_subtitle else T()$subtitle), div(class="review-badge", if(rv$lang=="pt") "V2.41 · Versão pública para revisão" else "V2.41 · Public peer-review release"))),
      div(class="lang",
          actionButton("pt","Português",class=if(rv$lang=="pt")"btn btn-light" else "btn btn-outline-light"),
          actionButton("en","English",class=if(rv$lang=="en")"btn btn-light" else "btn btn-outline-light"))
    )
  })

  output$nav <- renderUI({
    nav_button <- function(id,label,key) actionButton(id,label,class=paste("navbtn",if(rv$tab==key)"active" else ""))
    div(class="navbar",
        nav_button("tab_article",T()$article,"article"),nav_button("tab_template",T()$template,"template"),nav_button("tab_dashboard",T()$dashboard,"dashboard"),
        nav_button("tab_scenarios",T()$scenarios,"scenarios"),nav_button("tab_evidence",T()$evidence,"evidence"),
        nav_button("tab_catalogo",if(rv$lang=="pt") "Catálogo científico" else "Scientific catalog","catalogo"),
        nav_button("tab_management",if(rv$lang=="pt") "Recomendações" else "Management","management"),
        nav_button("tab_method",T()$method,"method"),
        nav_button("tab_about",if(rv$lang=="pt") "Sobre" else "About","about"))
  })

  output$page <- renderUI({
    switch(rv$tab,
      article=uiOutput("article_ui"), template=uiOutput("template_ui"), dashboard=uiOutput("dashboard_ui"),
      scenarios=uiOutput("scenarios_ui"), evidence=uiOutput("evidence_ui"),
      management=uiOutput("management_ui"), catalogo=uiOutput("catalogo_ui"), method=uiOutput("method_ui"), about=uiOutput("about_ui"))
  })


  output$template_ui <- renderUI({
    fields <- if(rv$lang=="pt"){
      list(
        c("Crop",T()$required,"Texto","Nome da cultura em inglês; identificador principal."),
        c("Crop_PT",T()$optional,"Texto","Nome comum em português."),
        c("Scientific_name",T()$recommended,"Texto","Nome científico da cultura."),
        c("Year",T()$recommended,"AAAA","Ano de referência."),
        c("Location",T()$recommended,"Texto","Localidade ou região produtiva."),
        c("Production_1000_t",T()$required,"10³ t","Produção total."),
        c("Production_Value_USD_M",T()$required,"US$ M","Valor econômico total da produção."),
        c("Export_Volume_1000_t",T()$optional,"10³ t","Volume exportado; use 0 quando não houver."),
        c("Export_Value_USD_M",T()$optional,"US$ M","Valor exportado; use 0 quando não houver."),
        c("Pollination_Dependence",T()$required,"0–1","Coeficiente de dependência da polinização."),
        c("Evidence_Reference",T()$recommended,"Texto","Referência utilizada para o coeficiente."),
        c("Notes",T()$optional,"Texto","Observações adicionais.")
      )
    } else {
      list(
        c("Crop",T()$required,"Text","Crop name in English; main identifier."),
        c("Crop_PT",T()$optional,"Text","Common name in Portuguese."),
        c("Scientific_name",T()$recommended,"Text","Scientific name."),
        c("Year",T()$recommended,"YYYY","Reference year."),
        c("Location",T()$recommended,"Text","Production location or region."),
        c("Production_1000_t",T()$required,"10³ t","Total crop production."),
        c("Production_Value_USD_M",T()$required,"US$ M","Total economic production value."),
        c("Export_Volume_1000_t",T()$optional,"10³ t","Export volume; use 0 when not applicable."),
        c("Export_Value_USD_M",T()$optional,"US$ M","Export value; use 0 when not applicable."),
        c("Pollination_Dependence",T()$required,"0–1","Pollination-dependence coefficient."),
        c("Evidence_Reference",T()$recommended,"Text","Source used for the coefficient."),
        c("Notes",T()$optional,"Text","Additional notes.")
      )
    }

    field_cards <- lapply(fields,function(x)
      div(class="field-card",
          div(class="fname",x[1]),
          div(class="freq",paste0(x[2]," · ",x[3])),
          div(class="fdesc",x[4]))
    )

    tagList(
      div(class="box",
        h2(class="title",T()$template_title),
        div(class="subtitle",T()$template_intro),

        div(class="template-actions",
          div(class="download-card",
              h3("Excel"),
              p(if(rv$lang=="pt")
                  "Planilha completa com aba de dados, guia de preenchimento, unidades e descrição dos índices."
                else
                  "Complete workbook with a data sheet, filling guide, units, and index descriptions."),
              downloadButton("download_template_xlsx",T()$template_xlsx)),
          div(class="download-card",
              h3("CSV"),
              p(if(rv$lang=="pt")
                  "Versão simples para preenchimento, integração com outros sistemas e futura importação na plataforma."
                else
                  "Simple version for data entry, integration with other systems, and future platform import."),
              downloadButton("download_template_csv",T()$template_csv))
        ),

        h3(class="charttitle",T()$template_fields),
        div(class="subtitle",T()$template_fields_note),
        do.call(div,c(list(class="field-grid"),field_cards)),

        div(class="index-box",
          strong(if(rv$lang=="pt")"Índices derivados pela ferramenta" else "Indices derived by the tool"),
          br(),
          span(if(rv$lang=="pt")
            "EVP = valor da produção × DR; PEDR = EVP total / valor total da produção; EPV = valor das exportações × DR; EPDR = EPV total / valor total das exportações; perdas dos cenários = EVP ou EPV × redução simulada."
          else
            "EVP = production value × DR; PEDR = total EVP / total production value; EPV = export value × DR; EPDR = total EPV / total export value; scenario losses = EVP or EPV × simulated reduction.")
        ),

        div(class="upload-zone",
          h3(class="charttitle",T()$upload_title),
          div(class="subtitle",T()$upload_intro),
          fileInput("crop_upload",T()$upload_file,accept=c(".xlsx",".csv")),
          uiOutput("import_validation_ui"),
          conditionalPanel(
            condition="output.importReady",
            h3(class="charttitle",style="margin-top:18px",T()$imported_preview),
            DTOutput("import_preview_table"),
            uiOutput("import_evidence_ui"),
            div(class="import-actions",
              actionButton("apply_import",T()$apply_import,class="btn btn-success"),
              actionButton("clear_import",T()$clear_import)
            )
          )
        ),

        h3(class="charttitle",style="margin-top:20px",T()$template_preview),
        DTOutput("template_preview_table")
      )
    )
  })


  output$importReady <- reactive({isTRUE(rv$import_ok) && !is.null(rv$import_data)})
  outputOptions(output,"importReady",suspendWhenHidden=FALSE)

  observeEvent(input$crop_upload,{
    req(input$crop_upload)
    rv$import_data <- NULL
    rv$import_errors <- character()
    rv$import_warnings <- character()
    rv$import_ok <- FALSE

    ext <- tolower(tools::file_ext(input$crop_upload$name))
    raw <- tryCatch({
      if(ext=="xlsx"){
        as.data.frame(readxl::read_excel(input$crop_upload$datapath,sheet="Dados_dos_cultivos"))
      } else if(ext=="csv"){
        read.csv(input$crop_upload$datapath,stringsAsFactors=FALSE,check.names=FALSE)
      } else stop("Unsupported file type")
    },error=function(e)e)

    if(inherits(raw,"error")){
      rv$import_errors <- if(rv$lang=="pt")
        paste0("Não foi possível ler o arquivo: ",conditionMessage(raw)) else
        paste0("Could not read file: ",conditionMessage(raw))
      return()
    }

    raw <- raw[rowSums(!is.na(raw) & trimws(as.matrix(raw))!="")>0,,drop=FALSE]

    required_cols <- c("Crop","Production_1000_t","Production_Value_USD_M","Pollination_Dependence")
    missing_cols <- setdiff(required_cols,names(raw))
    if(length(missing_cols)){
      rv$import_errors <- c(rv$import_errors,
        if(rv$lang=="pt") paste0("Colunas obrigatórias ausentes: ",paste(missing_cols,collapse=", "))
        else paste0("Missing required columns: ",paste(missing_cols,collapse=", ")))
      return()
    }

    # Add optional columns when absent.
    defaults <- list(
      Crop_PT="",Scientific_name="",Year=NA,Location="",
      Export_Volume_1000_t=0,Export_Value_USD_M=0,
      Evidence_Reference="",Notes=""
    )
    for(nm in names(defaults)) if(!nm %in% names(raw)) raw[[nm]] <- defaults[[nm]]

    numeric_cols <- c("Production_1000_t","Production_Value_USD_M",
                      "Export_Volume_1000_t","Export_Value_USD_M",
                      "Pollination_Dependence")
    for(nm in numeric_cols) raw[[nm]] <- suppressWarnings(as.numeric(raw[[nm]]))

    raw$Crop <- trimws(as.character(raw$Crop))
    raw$Crop_PT <- trimws(as.character(raw$Crop_PT))
    raw$Scientific_name <- trimws(as.character(raw$Scientific_name))
    raw$Evidence_Reference <- trimws(as.character(raw$Evidence_Reference))
    raw$Crop_PT[is.na(raw$Crop_PT) | raw$Crop_PT==""] <- raw$Crop[is.na(raw$Crop_PT) | raw$Crop_PT==""]
    raw$Evidence_Reference[is.na(raw$Evidence_Reference) | raw$Evidence_Reference==""] <- "User supplied"

    if(any(is.na(raw$Crop) | raw$Crop==""))
      rv$import_errors <- c(rv$import_errors,if(rv$lang=="pt")"Há linhas sem identificação da cultura (Crop)." else "Some rows have no crop identifier (Crop).")
    if(any(!is.finite(raw$Production_1000_t) | raw$Production_1000_t<0))
      rv$import_errors <- c(rv$import_errors,if(rv$lang=="pt")"Production_1000_t deve conter apenas valores numéricos ≥ 0." else "Production_1000_t must contain numeric values ≥ 0.")
    if(any(!is.finite(raw$Production_Value_USD_M) | raw$Production_Value_USD_M<0))
      rv$import_errors <- c(rv$import_errors,if(rv$lang=="pt")"Production_Value_USD_M deve conter apenas valores numéricos ≥ 0." else "Production_Value_USD_M must contain numeric values ≥ 0.")
    if(any(!is.finite(raw$Export_Volume_1000_t) | raw$Export_Volume_1000_t<0))
      rv$import_errors <- c(rv$import_errors,if(rv$lang=="pt")"Export_Volume_1000_t deve conter apenas valores numéricos ≥ 0." else "Export_Volume_1000_t must contain numeric values ≥ 0.")
    if(any(!is.finite(raw$Export_Value_USD_M) | raw$Export_Value_USD_M<0))
      rv$import_errors <- c(rv$import_errors,if(rv$lang=="pt")"Export_Value_USD_M deve conter apenas valores numéricos ≥ 0." else "Export_Value_USD_M must contain numeric values ≥ 0.")
    if(any(!is.finite(raw$Pollination_Dependence) | raw$Pollination_Dependence<0 | raw$Pollination_Dependence>1))
      rv$import_errors <- c(rv$import_errors,if(rv$lang=="pt")"Pollination_Dependence deve variar de 0 a 1." else "Pollination_Dependence must range from 0 to 1.")

    # Evidence warnings: inform, never overwrite user coefficients.
    for(i in seq_len(nrow(raw))){
      q <- evidence_db[evidence_db$Crop==raw$Crop[i] & !is.na(evidence_db$DR),,drop=FALSE]
      if(nrow(q)>0){
        vals <- sort(unique(round(q$DR,4)))
        if(length(vals)>1){
          nm <- if(rv$lang=="pt") raw$Crop_PT[i] else raw$Crop[i]
          rv$import_warnings <- c(rv$import_warnings,
            paste0(nm,": ",if(rv$lang=="pt")"há divergência na base de evidências (DR disponíveis: " else "evidence database contains divergent DR values (available: ",
                   paste(sprintf("%.2f",vals),collapse=", "),")."))
        }
        if(!any(abs(q$DR-raw$Pollination_Dependence[i])<1e-9)){
          nm <- if(rv$lang=="pt") raw$Crop_PT[i] else raw$Crop[i]
          rv$import_warnings <- c(rv$import_warnings,
            paste0(nm,": DR ",sprintf("%.2f",raw$Pollination_Dependence[i]),
                   if(rv$lang=="pt")" não coincide com os coeficientes quantitativos cadastrados; o valor importado será mantido até decisão do usuário."
                   else " does not match registered quantitative coefficients; the imported value will be retained until the user decides."))
        }
      }
    }

    internal <- data.frame(
      Crop=raw$Crop,
      Crop_PT=raw$Crop_PT,
      Scientific_name=raw$Scientific_name,
      Production=raw$Production_1000_t,
      Production_Value=raw$Production_Value_USD_M,
      Export_Volume=raw$Export_Volume_1000_t,
      Export_Value=raw$Export_Value_USD_M,
      Pollination_Dependence=raw$Pollination_Dependence,
      Evidence_Reference=raw$Evidence_Reference,
      stringsAsFactors=FALSE
    )
    # Keep metadata for later extensions.
    internal$Year <- raw$Year
    internal$Location <- raw$Location
    internal$Notes <- raw$Notes

    rv$import_data <- internal
    rv$import_ok <- length(rv$import_errors)==0
  })

  output$import_validation_ui <- renderUI({
    if(is.null(input$crop_upload)) return(NULL)
    if(length(rv$import_errors)){
      return(div(class="validation-bad",
        tags$b(T()$invalid_file),tags$ul(lapply(rv$import_errors,tags$li))))
    }
    if(isTRUE(rv$import_ok)){
      return(div(class="validation-ok",
        tags$b(T()$valid_file),br(),
        span(if(rv$lang=="pt")
          paste0(nrow(rv$import_data)," cultura(s) reconhecida(s). Os dados ainda não foram aplicados à análise.")
        else
          paste0(nrow(rv$import_data)," crop(s) recognized. Data have not yet been applied to the analysis."))))
    }
    NULL
  })

  output$import_preview_table <- renderDT({
    req(rv$import_data)
    d <- rv$import_data[,c("Crop_PT","Scientific_name","Production","Production_Value",
                           "Export_Volume","Export_Value","Pollination_Dependence","Evidence_Reference")]
    names(d) <- if(rv$lang=="pt")
      c("Cultura","Nome científico","Produção (10³ t)","Valor produção (US$ M)",
        "Exportação (10³ t)","Valor exportação (US$ M)","DR","Referência")
    else
      c("Crop","Scientific name","Production (10³ t)","Production value (US$ M)",
        "Exports (10³ t)","Export value (US$ M)","DR","Reference")
    datatable(d,rownames=FALSE,options=list(dom="t",ordering=FALSE,scrollX=TRUE))
  })

  output$import_evidence_ui <- renderUI({
    req(rv$import_data)
    if(length(rv$import_warnings)){
      div(class="validation-warn",tags$b(T()$evidence_alert),
          tags$ul(lapply(unique(rv$import_warnings),tags$li)))
    } else {
      div(class="note",tags$b(T()$evidence_alert),br(),T()$no_evidence_alert)
    }
  })

  observeEvent(input$apply_import,{
    req(isTRUE(rv$import_ok),rv$import_data)
    rv$d <- rv$import_data
    rv$source <- "import"
    rv$tab <- "dashboard"
    updateSelectizeInput(session,"evidence_crop",
                         choices=setNames(rv$d$Crop,rv$d$Crop),
                         selected=rv$d$Crop[1],
                         server=FALSE)
    showNotification(T()$import_applied,type="message",duration=4)
  })

  observeEvent(input$clear_import,{
    rv$import_data <- NULL
    rv$import_errors <- character()
    rv$import_warnings <- character()
    rv$import_ok <- FALSE
  })


  output$template_preview_table <- renderDT({
    preview <- data.frame(
      Crop=c("Melon","Watermelon"),
      Crop_PT=c("Melão","Melancia"),
      Scientific_name=c("Cucumis melo","Citrullus lanatus"),
      Year=c(2024,2024),
      Location=c("Rio Grande do Norte, Brazil","Rio Grande do Norte, Brazil"),
      Production_1000_t=c(505.2,142.6),
      Production_Value_USD_M=c(159.2,24.2),
      Export_Volume_1000_t=c(171.3,92.5),
      Export_Value_USD_M=c(120.1,53.0),
      Pollination_Dependence=c(0.95,0.95),
      Evidence_Reference=c("Giannini et al. (2015)","Giannini et al. (2015)"),
      Notes=c("Exemplo do sistema 4M","Exemplo do sistema 4M"),
      check.names=FALSE
    )
    datatable(preview,rownames=FALSE,options=list(dom="t",ordering=FALSE,scrollX=TRUE))
  })

  output$download_template_xlsx <- downloadHandler(
    filename=function(){
      if(rv$lang=="pt") "modelo_dados_cultivos.xlsx" else "crop_data_template.xlsx"
    },
    content=function(file){
      ok <- file.copy("data/modelo_dados_cultivos.xlsx",file,overwrite=TRUE)
      if(!ok) stop("Template XLSX not found.")
    },
    contentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  )

  output$download_template_csv <- downloadHandler(
    filename=function(){
      if(rv$lang=="pt") "modelo_dados_cultivos.csv" else "crop_data_template.csv"
    },
    content=function(file){
      ok <- file.copy("data/modelo_dados_cultivos.csv",file,overwrite=TRUE)
      if(!ok) stop("Template CSV not found.")
    },
    contentType="text/csv"
  )


  output$article_ui <- renderUI({
    crop_choices <- if(rv$lang=="pt") setNames(rv$d$Crop,rv$d$Crop_PT) else setNames(rv$d$Crop,rv$d$Crop)
    crop <- input$article_crop %||% rv$d$Crop[1]
    q <- evidence_db[evidence_db$Crop==crop & !is.na(evidence_db$DR),,drop=FALSE]
    labs <- if(nrow(q)) setNames(seq_len(nrow(q)),paste0(q$Reference," | DR=",sprintf("%.2f",q$DR)," | ",q$Geographic_scope)) else character()
    tagList(
      warning_ui("restore_article"),
      div(class="box",h2(class="title",T()$article),div(class="subtitle",T()$article_intro),
          DTOutput("article_table"),
          div(class="note",T()$round_note),
          hr(),
          div(class="note",style="margin-bottom:16px",
          strong(if(rv$lang=="pt") "Estados das evidências" else "Evidence states"),br(),
          span(if(rv$lang=="pt")
            "Convergente = fontes cadastradas concordam; Divergente = fontes cadastradas apresentam DRs distintos; Não validada = DR fornecido pelo usuário e ainda não confrontado com a biblioteca científica."
          else
            "Convergent = registered sources agree; Divergent = registered sources report different DR values; Not validated = DR supplied by the user and not yet checked against the scientific library.")
        ),

        h3(T()$choose_crop),
          div(style="display:none",selectizeInput("article_crop",NULL,choices=crop_choices,selected=crop)),
          uiOutput("article_crop_cards"),
          selectInput("article_evidence",T()$choose_evidence,choices=labs),
          actionButton("apply_article",T()$apply,class="btn btn-success"))
    )
  })


  output$article_crop_cards <- renderUI({
    cards <- lapply(seq_len(nrow(rv$d)), function(i){
      cr <- rv$d$Crop[i]
      active <- identical(input$article_crop %||% rv$d$Crop[1], cr)
      nm <- if(rv$lang=="pt") rv$d$Crop_PT[i] else rv$d$Crop[i]
      div(
        class=paste("crop-select-card",if(active)"active" else ""),
        onclick=sprintf("Shiny.setInputValue('article_crop_card','%s',{priority:'event'})",cr),
        crop_svg(cr,54),
        div(div(class="cname",nm),div(class="csc",rv$d$Scientific_name[i]))
      )
    })
    do.call(div,c(list(class="crop-selector"),cards))
  })
  observeEvent(input$article_crop_card,{
    updateSelectizeInput(session,"article_crop",selected=input$article_crop_card)
  })

  output$article_table <- renderDT({
    shown <- rv$d[,c("Crop_PT","Scientific_name","Production","Production_Value","Export_Volume","Export_Value","Pollination_Dependence")]
    names(shown) <- if(rv$lang=="pt") c("Cultura","Nome científico","Produção (10³ t)","Valor produção (US$ M)","Exportação (10³ t)","Valor exportação (US$ M)","DR") else c("Crop","Scientific name","Production (10³ t)","Production value (US$ M)","Exports (10³ t)","Export value (US$ M)","DR")
    datatable(shown,rownames=FALSE,editable=list(target="cell",disable=list(columns=c(0,1))),
              options=list(scrollX=TRUE,pageLength=10,dom="ftip",ordering=FALSE))
  })

  observeEvent(input$article_table_cell_edit,{
    info <- input$article_table_cell_edit
    # displayed cols 3:7 correspond to data cols 4:8
    map <- c(NA,NA,4,5,6,7,8)
    col <- map[info$col+1]
    if(!is.na(col)){
      val <- suppressWarnings(as.numeric(info$value))
      if(is.finite(val)){
        if(col==8) val <- max(0,min(1,val))
        rv$d[info$row,col] <- val
      }
    }
  })
  observeEvent(input$apply_article,{
    crop <- input$article_crop %||% "Mango"
    q <- evidence_db[evidence_db$Crop==crop & !is.na(evidence_db$DR),,drop=FALSE]
    j <- suppressWarnings(as.integer(input$article_evidence))
    if(length(j)==1 && is.finite(j) && j>=1 && j<=nrow(q)){
      i <- which(rv$d$Crop==crop)
      rv$d$Pollination_Dependence[i] <- q$DR[j]
      rv$d$Evidence_Reference[i] <- q$Reference[j]
    }
  })
  observeEvent(input$restore_article,{rv$d <- article_data; rv$source <- "article"})

  dashboard_crop <- reactiveVal("")
  observeEvent(input$dashboard_crop_card, {
    selected <- input$dashboard_crop_card
    if(identical(selected,"__all__") || !(selected %in% rv$d$Crop)) selected <- ""
    dashboard_crop(selected)
  })
  observeEvent(rv$d, {
    if(nzchar(dashboard_crop()) && !(dashboard_crop() %in% rv$d$Crop)) dashboard_crop("")
  })
  output$dashboard_crop_detail <- renderUI({
    selected <- dashboard_crop()
    if(!nzchar(selected)) return(NULL)
    row <- rv$d[rv$d$Crop == selected,,drop=FALSE]
    if(nrow(row)!=1) return(NULL)
    m <- calc_metrics(row)
    name <- if(rv$lang=="pt") row$Crop_PT[1] else row$Crop[1]
    div(class="box",style="margin:4px 0 20px;border:2px solid #0D6A53;",
      h3(style="margin:0 0 4px;color:#082F49;",name),
      div(class="subtitle",tags$em(row$Scientific_name[1])),
      div(class="subtitle",paste0("DR ",sprintf("%.2f",row$Pollination_Dependence[1])," · ",row$Evidence_Reference[1])),
      div(class="grid4",style="margin-top:14px;",
        div(class="kpi k1",div(class="lab",T()$prodvalue),div(class="val",money(m$pv))),
        div(class="kpi k2",div(class="lab",T()$evp),div(class="val",money(m$evp)),div(class="sub",pct(m$pedr))),
        div(class="kpi k3",div(class="lab",T()$exportvalue),div(class="val",money(m$xv))),
        div(class="kpi k4",div(class="lab",T()$epv),div(class="val",money(m$epv)),div(class="sub",pct(m$epdr)))
      )
    )
  })
  output$dashboard_ui <- renderUI({
    m <- metrics()
    crop_cards <- lapply(seq_len(nrow(rv$d)),function(i){
      cr <- rv$d$Crop[i]
      div(class=paste("crop-select-card",if(identical(dashboard_crop(),cr))"active" else ""),
        role="button",tabindex="0",
        onclick=sprintf("Shiny.setInputValue('dashboard_crop_card','%s',{priority:'event'})",cr),
        onkeydown=sprintf("if(event.key==='Enter'||event.key===' '){event.preventDefault();Shiny.setInputValue('dashboard_crop_card','%s',{priority:'event'});}",cr),
        crop_svg(cr,48),div(tags$b(if(rv$lang=="pt")rv$d$Crop_PT[i] else cr),em(rv$d$Scientific_name[i])))
    })
    tagList(
      warning_ui("restore_dashboard"),
      h2(class="title",T()$results),div(class="subtitle",T()$results_sub),
      div(style="text-align:right",
  span(class="badge badgeok",if(identical(rv$source,"import")) paste0(T()$imported_source," · ",nrow(rv$d)," ",if(rv$lang=="pt")"culturas" else "crops") else T()$system),
  span(class="badge",style="margin-left:8px;background:#EEF4F2;color:#0D6A53",
       if(identical(rv$source,"import")) T()$analysis_mode_user else T()$analysis_mode_article)
),
      div(style="margin-top:12px;",actionButton("dashboard_all_crops",if(rv$lang=="pt") "Todas as culturas" else "All crops")),
      do.call(div,c(list(class="crop-strip"),crop_cards)),
      uiOutput("dashboard_crop_detail"),
      div(class="grid4",
        div(class="kpi k1",div(class="lab",T()$prodvalue),div(class="val",money(m$pv)),div(class="sub",if(identical(rv$source,"article") && !modified())T()$round_note else "")),
        div(class="kpi k2",div(class="lab",T()$evp),div(class="val",money(m$evp)),div(class="sub",pct(m$pedr))),
        div(class="kpi k3",div(class="lab",T()$exportvalue),div(class="val",money(m$xv))),
        div(class="kpi k4",div(class="lab",T()$epv),div(class="val",money(m$epv)),div(class="sub",pct(m$epdr)))
      ),
      div(class="chartgrid",
        div(class="chartbox",div(class="charttitle",T()$composition),div(class="chartsub",if(identical(rv$source,"import")) T()$user_composition else T()$composition_sub),plotOutput("donut",height="260px")),
        div(class="chartbox",div(class="charttitle",T()$compare),div(class="chartsub",T()$compare_sub),plotOutput("valueplot",height="260px")))
    )
  })
  observeEvent(input$dashboard_all_crops,{dashboard_crop("")})
  observeEvent(input$restore_dashboard,{rv$d <- article_data; rv$source <- "article"; dashboard_crop("")})

  output$donut <- renderPlot({
    m <- metrics(); vals <- c(m$evp,max(m$pv-m$evp,0)); if(sum(vals)<=0) vals <- c(1,0)
    par(mar=c(1,1,1,1)); pie(vals,col=c("#168A68","#F3A344"),border="white",labels=NA,radius=.78)
    symbols(0,0,circles=.39,inches=FALSE,add=TRUE,bg="white",fg="white")
    text(0,.05,pct(m$pedr),font=2,cex=1.25,col="#082F49"); text(0,-.08,T()$dependence,cex=.65,col="#6F8194")
    legend("bottom",legend=c(paste0(T()$pollination," — ",money(m$evp)),paste0(T()$other," — ",money(max(m$pv-m$evp,0)))),
           fill=c("#168A68","#F3A344"),bty="n",horiz=TRUE,cex=.68,xpd=NA)
  })
  output$valueplot <- renderPlot({
    m <- metrics(); vals <- c(m$pv,m$evp); labs <- c(T()$prodvalue,T()$evp)
    par(mar=c(4,13,1,2)); bp <- barplot(rev(vals),horiz=TRUE,col=rev(c("#3E9FDE","#4DBE73")),border=NA,
      names.arg=rev(labs),las=1,xlim=c(0,max(vals,1)*1.16),xlab="US$ M",cex.names=.78)
    abline(v=pretty(c(0,max(vals))),col="#E7EEEB",lwd=.8); text(rev(vals),bp,labels=round(rev(vals),1),pos=4,font=2,cex=.85)
  })

  output$scenarios_ui <- renderUI({
    tagList(warning_ui("restore_scenarios"),
      div(class="box",h2(class="title",T()$scenarios),div(class="subtitle",T()$scenarios_note),
          sliderInput("reduction",T()$reduction,min=0,max=100,value=25,step=1),
          uiOutput("scenario_cards"),
          div(class="chartbox",div(class="charttitle",T()$scencompare),plotOutput("scenario_plot",height="315px")),
          h3(T()$scenario_summary),DTOutput("scenario_table"))
    )
  })
  observeEvent(input$restore_scenarios,{rv$d <- article_data; rv$source <- "article"})

  output$scenario_cards <- renderUI({
    m <- metrics(); r <- (input$reduction %||% 25)/100
    div(class="scenario-grid",
      div(class="scard s1",div(class="lab",T()$prodloss),div(class="val",money(m$pl)),tags$small(paste0(round(r*100),"%"))),
      div(class="scard s2",div(class="lab",T()$remain_evp),div(class="val",money(max(m$evp-m$pl,0))),tags$small(paste0("EVP: ",money(m$evp)))),
      div(class="scard s3",div(class="lab",T()$exploss),div(class="val",money(m$xl)),tags$small(paste0(round(r*100),"%"))),
      div(class="scard s4",div(class="lab",T()$remain_epv),div(class="val",money(max(m$epv-m$xl,0))),tags$small(paste0("EPV: ",money(m$epv)))))
  })
  output$scenario_plot <- renderPlot({
    ds <- lapply(c(.10,.25,.50),function(x) calc_metrics(rv$d,x))
    mat <- rbind(vapply(ds,function(x)x$pl,numeric(1)),vapply(ds,function(x)x$xl,numeric(1)))
    colnames(mat) <- c("10%","25%","50%"); rownames(mat) <- c(T()$production,T()$exports)
    par(mar=c(4,4,1,1)); bp <- barplot(mat,beside=TRUE,col=c("#168A68","#4F8FD3"),border=NA,ylab="US$ M",ylim=c(0,max(mat)*1.18))
    abline(h=pretty(c(0,max(mat))),col="#E7EEEB",lwd=.8); legend("topleft",rownames(mat),fill=c("#168A68","#4F8FD3"),bty="n",horiz=TRUE,cex=.8)
    text(bp,mat,labels=round(mat,1),pos=3,cex=.8,font=2)
  })
  output$scenario_table <- renderDT({
    reds <- c(.10,.25,.50); ds <- lapply(reds,function(x) calc_metrics(rv$d,x))
    tab <- data.frame(
      Scenario=paste0(reds*100,"%"),
      Production_loss=round(vapply(ds,function(x)x$pl,numeric(1)),1),
      Remaining_EVP=round(vapply(ds,function(x)x$evp-x$pl,numeric(1)),1),
      Export_loss=round(vapply(ds,function(x)x$xl,numeric(1)),1),
      Remaining_EPV=round(vapply(ds,function(x)x$epv-x$xl,numeric(1)),1))
    names(tab) <- if(rv$lang=="pt") c("Cenário","Perda produção (US$ M)","EVP remanescente (US$ M)","Perda exportações (US$ M)","EPV remanescente (US$ M)") else c("Scenario","Production loss (US$ M)","Remaining EVP (US$ M)","Export loss (US$ M)","Remaining EPV (US$ M)")
    datatable(tab,rownames=FALSE,options=list(dom="t",ordering=FALSE,scrollX=TRUE))
  })

  output$evidence_ui <- renderUI({
    req(nrow(rv$d) > 0)
    crop <- input$evidence_crop
    if(is.null(crop) || length(crop) != 1 || is.na(crop) || !crop %in% rv$d$Crop){
      crop <- rv$d$Crop[1]
    }
    q <- evidence_db[!is.na(evidence_db$Crop) & evidence_db$Crop==crop,,drop=FALSE]
    user_only_evidence <- FALSE
    if(nrow(q)==0 && isTRUE(any(rv$d$Crop==crop, na.rm=TRUE))){
      cur0 <- rv$d[rv$d$Crop==crop,,drop=FALSE][1,]
      user_only_evidence <- TRUE
      q <- data.frame(
        Crop=crop,
        Crop_PT=cur0$Crop_PT,
        Scientific_name=cur0$Scientific_name,
        Dependence_class=if(rv$lang=="pt") "Coeficiente importado" else "Imported coefficient",
        DR=cur0$Pollination_Dependence,
        Geographic_scope=if(rv$lang=="pt") "Fornecida pelo usuário" else "User supplied",
        Reference=cur0$Evidence_Reference,
        Notes=if(rv$lang=="pt")
          "Evidência informada na planilha importada; ainda não validada pela base bibliográfica da ferramenta."
        else
          "Evidence supplied in the imported spreadsheet; not yet validated against the tool literature database.",
        Evidence_type="User supplied",
        stringsAsFactors=FALSE
      )
    }
    quant <- selectable_evidence(q)
    support <- q[!seq_len(nrow(q)) %in% which(rownames(q) %in% rownames(quant)),,drop=FALSE]
    support <- q[is.na(q$DR) | !yes_flag(if("Selectable_for_calculation" %in% names(q)) q$Selectable_for_calculation else rep("Yes",nrow(q))),,drop=FALSE]
    cur <- rv$d[rv$d$Crop==crop,,drop=FALSE]
    base <- if(isTRUE(any(article_data$Crop==crop, na.rm=TRUE))) {
      article_data[article_data$Crop==crop,,drop=FALSE][1,]
    } else {
      cur[1,]
    }
    evidence_status <- evidence_state(
      q,
      current_dr=cur$Pollination_Dependence[1],
      user_only=user_only_evidence
    )
    divergent <- identical(evidence_status,"divergent")

    labs <- if(nrow(quant)) {
      setNames(seq_len(nrow(quant)),
               paste0(quant$Evidence_ID," | ",quant$Reference," | ",quant$Dependence_class,
                      " | DR=",sprintf("%.2f",quant$DR),
                      " | ",quant$Geographic_scope))
    } else character()

    crop_cards <- lapply(seq_len(nrow(rv$d)), function(i){
      cr <- rv$d$Crop[i]
      active <- identical(crop,cr)
      nm <- if(rv$lang=="pt") rv$d$Crop_PT[i] else rv$d$Crop[i]
      div(
        class=paste("crop-select-card",if(active)"active" else ""),
        onclick=sprintf("Shiny.setInputValue('evidence_crop_card','%s',{priority:'event'})",cr),
        crop_svg(cr,56),
        div(div(class="cname",nm),div(class="csc",rv$d$Scientific_name[i]))
      )
    })

    ev_cards <- lapply(seq_len(nrow(quant)), function(i){
      same_dr <- isTRUE(
        is.finite(quant$DR[i]) &&
        is.finite(cur$Pollination_Dependence[1]) &&
        abs(quant$DR[i]-cur$Pollination_Dependence[1]) < 1e-9
      )
      same_ref <- isTRUE(
        !is.na(quant$Reference[i]) &&
        !is.na(cur$Evidence_Reference[1]) &&
        identical(as.character(quant$Reference[i]), as.character(cur$Evidence_Reference[1]))
      )
      applied <- isTRUE(same_dr && same_ref)
      div(class=paste("evidence-list-card",if(isTRUE(applied))"applied" else ""),
        div(class="evidence-list-top",
          div(
            div(class="evidence-source",
                paste0(ifelse(is.na(quant$Evidence_ID[i]),"—",quant$Evidence_ID[i]),
                       " · ",quant$Reference[i])),
            div(class="evidence-details",
                paste0(quant$Dependence_class[i]," · ",quant$Geographic_scope[i]))
          ),
          div(class="evidence-dr",paste0("DR ",sprintf("%.2f",quant$DR[i]))),

        div(class="evidence-meta", style="margin-top:6px;font-size:12px;color:#64748b",
            paste0(
              "ID: ", ifelse(is.na(quant$Evidence_ID[i]) || !nzchar(quant$Evidence_ID[i]), "—", quant$Evidence_ID[i]),
              if(!is.na(quant$DOI[i]) && nzchar(quant$DOI[i])) paste0(" · DOI: ", quant$DOI[i]) else "",
              if(!is.na(quant$Source_ID[i]) && nzchar(quant$Source_ID[i]))
                paste0(" · ",if(rv$lang=="pt") "Fonte: " else "Source: ",quant$Source_ID[i]) else "",
              if(!is.na(quant$Evidence_lineage[i]) && nzchar(quant$Evidence_lineage[i]))
                paste0(" · ",if(rv$lang=="pt") "Linhagem: " else "Lineage: ",quant$Evidence_lineage[i]) else ""
            )),
        ),
        if(isTRUE(applied)) span(class="badge badgeok",
                         if(user_only_evidence) T()$in_use else T()$applied) else NULL
      )
    })

    tagList(
      warning_ui("restore_evidence"),
      div(class="box",
        div(class="evhead",
          div(h2(class="title",T()$sourcecompare),div(class="subtitle",T()$evidence_help)),
          span(
            class=paste("badge",
              if(evidence_status=="divergent") "badgewarn"
              else if(evidence_status=="user") "badgewarn"
              else "badgeok"),
            if(evidence_status=="divergent") T()$divergence
            else if(evidence_status=="user") T()$user_evidence
            else if(evidence_status=="registered") T()$registered
            else T()$convergent
          )
        ),

        h3(T()$choose_crop),
        div(style="display:none",
            selectizeInput("evidence_crop",NULL,
              choices=setNames(rv$d$Crop,rv$d$Crop),
              selected=crop)),
        do.call(div,c(list(class="crop-selector"),crop_cards)),

        div(class="evhero",
          div(class="fruitbox",crop_svg(crop,72)),
          div(
            div(class="ename",if(rv$lang=="pt")base$Crop_PT else base$Crop),
            div(class="esc",base$Scientific_name),
            div(style="margin-top:9px",
              span(class="badge badgeok",
                   paste0(
                     T()$current,
                     ": ",sprintf("%.2f",cur$Pollination_Dependence[1])
                   ))
            )
          )
        ),

        if(identical(evidence_status,"user")) div(class="warning",
          div(strong(T()$user_evidence),br(),
              span(if(rv$lang=="pt")
                "O DR exibido foi fornecido na planilha do usuário. Ele está sendo utilizado nos cálculos, mas ainda não foi validado ou comparado com evidências bibliográficas cadastradas na ferramenta."
              else
                "The displayed DR was supplied in the user's spreadsheet. It is being used in the calculations, but has not yet been validated or compared with bibliographic evidence registered in the tool."))),
        if(isTRUE(divergent)) div(class="warning",
          div(strong(T()$divergence),br(),span(T()$divergence_note))),

        h3(T()$quantitative),
        do.call(div,ev_cards),

        if(nrow(quant)>0) div(class="evcard",style="margin-top:16px",
          strong(T()$choose_evidence),
          selectInput("evidence_choice",NULL,choices=labs),
          actionButton("apply_evidence",T()$apply,class="btn btn-success")
        ) else div(class="note",
          strong(if(rv$lang=="pt") "Coeficiente atual preservado" else "Current coefficient preserved"),br(),
          if(rv$lang=="pt")
            "A ferramenta não substitui automaticamente o DR informado pelo usuário."
          else
            "The tool does not automatically replace the DR supplied by the user."
        ),

        if(isTRUE(nrow(support) > 0)) div(class="note",
          strong(T()$supporting),br(),
          paste0(support$Reference[1],": ",support$Notes[1]),br(),
          T()$support_note)
      )
    )
  })

  observeEvent(input$evidence_crop_card,{
    updateSelectizeInput(session,"evidence_crop",selected=input$evidence_crop_card)
  })

  observeEvent(input$restore_evidence,{rv$d <- article_data; rv$source <- "article"})
  observeEvent(input$apply_evidence,{
    crop <- input$evidence_crop
    if(is.null(crop) || length(crop) != 1 || is.na(crop) || !crop %in% rv$d$Crop){
      crop <- rv$d$Crop[1]
    }
    q <- selectable_evidence(evidence_db[!is.na(evidence_db$Crop) & evidence_db$Crop==crop,,drop=FALSE])
    if(nrow(q)==0) return()
    j <- suppressWarnings(as.integer(input$evidence_choice))
    if(length(j)==1 && is.finite(j) && j>=1 && j<=nrow(q)){
      i <- which(rv$d$Crop==crop)
      if(length(i)==1){
        rv$d$Pollination_Dependence[i] <- q$DR[j]
        rv$d$Evidence_Reference[i] <- q$Reference[j]
        if(!"Evidence_ID" %in% names(rv$d)) rv$d$Evidence_ID <- NA_character_
        if(!"Evidence_DOI" %in% names(rv$d)) rv$d$Evidence_DOI <- NA_character_
        if(!"Evidence_Source_ID" %in% names(rv$d)) rv$d$Evidence_Source_ID <- NA_character_
        if(!"Evidence_Scope" %in% names(rv$d)) rv$d$Evidence_Scope <- NA_character_
        rv$d$Evidence_ID[i] <- q$Evidence_ID[j]
        rv$d$Evidence_DOI[i] <- q$DOI[j]
        rv$d$Evidence_Source_ID[i] <- q$Source_ID[j]
        rv$d$Evidence_Scope[i] <- q$Geographic_scope[j]
      }
    }
  })
  output$evidence_table <- renderDT({
    req(nrow(rv$d) > 0)
    crop <- input$evidence_crop
    if(is.null(crop) || length(crop) != 1 || is.na(crop) || !crop %in% rv$d$Crop){
      crop <- rv$d$Crop[1]
    }
    q <- selectable_evidence(evidence_db[!is.na(evidence_db$Crop) & evidence_db$Crop==crop,,drop=FALSE])
    cur <- rv$d[rv$d$Crop==crop,,drop=FALSE]
    if(nrow(q)==0 && nrow(cur)==1){
      shown <- data.frame(
        Reference=cur$Evidence_Reference,
        Scope=if(rv$lang=="pt") "Fornecida pelo usuário" else "User supplied",
        Class=if(rv$lang=="pt") "Coeficiente importado" else "Imported coefficient",
        DR=sprintf("%.2f",cur$Pollination_Dependence),
        Status=if(rv$lang=="pt") "DR em uso · não validada" else "DR in use · not validated",
        stringsAsFactors=FALSE
      )
    } else {
      same_dr <- is.finite(q$DR) &
                 is.finite(cur$Pollination_Dependence[1]) &
                 abs(q$DR-cur$Pollination_Dependence[1]) < 1e-9
      same_ref <- !is.na(q$Reference) &
                  !is.na(cur$Evidence_Reference[1]) &
                  as.character(q$Reference) == as.character(cur$Evidence_Reference[1])
      same_dr[is.na(same_dr)] <- FALSE
      same_ref[is.na(same_ref)] <- FALSE
      status <- ifelse(same_dr & same_ref,T()$applied,T()$available)
      shown <- data.frame(
        Evidence_ID=ifelse(is.na(q$Evidence_ID),"—",q$Evidence_ID),
        Reference=q$Reference,
        DOI=ifelse(is.na(q$DOI) | !nzchar(q$DOI),"—",q$DOI),
        Source_ID=ifelse(is.na(q$Source_ID),"—",q$Source_ID),
        Scope=q$Geographic_scope,
        Class=q$Dependence_class,
        DR=sprintf("%.2f",q$DR),
        Lineage=ifelse(is.na(q$Evidence_lineage),"—",q$Evidence_lineage),
        Status=status,
        stringsAsFactors=FALSE
      )
    }
    if(ncol(shown)==5){
      names(shown) <- if(rv$lang=="pt") c("Referência","Escopo","Classe de dependência","DR","Status") else c("Reference","Scope","Dependence class","DR","Status")
    } else {
      names(shown) <- if(rv$lang=="pt")
        c("ID da evidência","Referência","DOI","ID da fonte","Escopo","Classe de dependência","DR","Linhagem","Status")
      else
        c("Evidence ID","Reference","DOI","Source ID","Scope","Dependence class","DR","Lineage","Status")
    }
    datatable(shown,rownames=FALSE,options=list(dom="tip",ordering=FALSE,scrollX=TRUE,pageLength=10))
  })


  management_context <- reactive({
    vals <- c(Q01=input$mg_q01 %||% "Unknown", Q02=input$mg_q02 %||% "Unknown",
              Q03=input$mg_q03 %||% "Unknown", Q04=input$mg_q04 %||% "Unknown",
              Q05=input$mg_q05 %||% "Unknown", Q06=input$mg_q06 %||% "Unknown")
    vals
  })

  exposure_id <- reactive({
    r <- input$reduction %||% 25
    if(r < 10) "E0" else if(r < 25) "E1" else if(r < 50) "E2" else "E3"
  })

  management_results <- reactive({
    ctx <- management_context()
    out <- lapply(management_actions$Management_ID,function(mid){
      rr <- management_rules[management_rules$Management_ID==mid,,drop=FALSE]
      hit <- rr[vapply(seq_len(nrow(rr)),function(i){
        q <- rr$Context_variable[i]; identical(as.character(ctx[[q]]),as.character(rr$Context_response[i]))
      },logical(1)),,drop=FALSE]
      score <- if(nrow(hit)) max(hit$Context_score,na.rm=TRUE) else 0
      pm <- management_priority[as.character(management_priority$Context_score)==as.character(score) & management_priority$Exposure_ID==exposure_id(),,drop=FALSE]
      a <- management_actions[management_actions$Management_ID==mid,,drop=FALSE]
      rationale_pt <- if(nrow(hit)) hit$Rationale_PT[which.max(hit$Context_score)] else "Nenhuma limitação contextual específica foi informada para esta ação."
      rationale_en <- if(nrow(hit)) hit$Rationale_EN[which.max(hit$Context_score)] else "No specific contextual limitation was reported for this action."
      data.frame(Management_ID=mid,Action=a$Action,Action_PT=a$Action_PT,Evidence_strength=a$Evidence_strength,
                 Context_score=score,Priority=if(nrow(pm)) pm$Management_priority[1] else "Maintain",
                 Priority_PT=if(nrow(pm)) pm$Management_priority_PT[1] else "Manter",
                 Rationale_PT=rationale_pt,Rationale_EN=rationale_en,stringsAsFactors=FALSE)
    })
    do.call(rbind,out)
  })

  output$management_ui <- renderUI({
    pt <- rv$lang=="pt"
    ch_q01 <- if(pt) c("Abundante"="Abundant","Alguma"="Some","Escassa"="Scarce","Não informado"="Unknown") else c("Abundant"="Abundant","Some"="Some","Scarce"="Scarce","Unknown"="Unknown")
    ch_q02 <- if(pt) c("Sim"="Yes","Não"="No","Não informado"="Unknown") else c("Yes"="Yes","No"="No","Unknown"="Unknown")
    ch_q04 <- if(pt) c("Alta"="High","Moderada"="Moderate","Baixa"="Low","Não informado"="Unknown") else c("High"="High","Moderate"="Moderate","Low"="Low","Unknown"="Unknown")
    ch_q05 <- if(pt) c("Frequentemente"="Frequently","Ocasionalmente"="Occasionally","Não"="No","Não informado"="Unknown") else c("Frequently"="Frequently","Occasionally"="Occasionally","No"="No","Unknown"="Unknown")
    ch_q06 <- ch_q04
    # Preserve the current internal values when language changes; Unknown is only the initial default.
    cur <- lapply(c("mg_q01","mg_q02","mg_q03","mg_q04","mg_q05","mg_q06"), function(id) isolate(input[[id]]) %||% "Unknown")
    names(cur) <- c("mg_q01","mg_q02","mg_q03","mg_q04","mg_q05","mg_q06")
    div(class="box",
        h2(class="title",if(pt) "Recomendações de manejo baseadas em evidências" else "Evidence-based management recommendations"),
        div(class="subtitle",if(pt) "A exposição econômica define a urgência; o contexto informado e a literatura definem a prioridade das ações." else "Economic exposure scales urgency; user-reported context and scientific evidence determine action priority."),
        div(class="note",strong(if(pt) "Salvaguarda científica: " else "Scientific safeguard: "),
            if(pt) "os cenários de 10%, 25% e 50% são testes de estresse do serviço de polinização, não probabilidades de risco ou previsões climáticas. As recomendações não implicam compensação de uma porcentagem específica de perda." else "10%, 25% and 50% are pollination-service stress tests, not risk probabilities or climate forecasts. Recommendations do not imply compensation for a specific percentage loss."),
        h3(if(pt) "Contexto ecológico da área" else "Ecological context"),
        div(class="management-grid",
          div(class="context-card",selectInput("mg_q01",if(pt) "Vegetação natural/seminatural no entorno" else "Natural/semi-natural vegetation around the production area",ch_q01,selected=cur$mg_q01)),
          div(class="context-card",selectInput("mg_q02",if(pt) "Há áreas degradadas disponíveis para restauração?" else "Degraded areas available for restoration?",ch_q02,selected=cur$mg_q02)),
          div(class="context-card",selectInput("mg_q03",if(pt) "Recursos florais fora da floração da cultura" else "Floral resources outside crop flowering",ch_q01,selected=cur$mg_q03)),
          div(class="context-card",selectInput("mg_q04",if(pt) "Diversificação da paisagem agrícola" else "Agricultural landscape diversification",ch_q04,selected=cur$mg_q04)),
          div(class="context-card",selectInput("mg_q05",if(pt) "Uso de inseticidas durante/próximo à floração" else "Insecticide use during/near flowering",ch_q05,selected=cur$mg_q05)),
          div(class="context-card",selectInput("mg_q06",if(pt) "Conectividade entre manchas de habitat" else "Connectivity among habitat patches",ch_q06,selected=cur$mg_q06))
        ),
        uiOutput("management_results_ui")
    )
  })

  output$management_results_ui <- renderUI({
    pt <- rv$lang=="pt"
    res <- management_results()
    ord <- match(res$Priority,c("Very high","High","Moderate","Maintain")); ord[is.na(ord)] <- 99
    res <- res[order(ord),,drop=FALSE]

    strength_label <- function(x){
      if(!pt) return(x)
      map <- c("High"="Alta","Moderate-High"="Moderada–alta","Moderate"="Moderada",
               "High / context-dependent"="Alta / dependente do contexto")
      if(x %in% names(map)) unname(map[x]) else x
    }
    benefit_text <- function(mid){
      z <- list(
        M01=c("Manutenção de habitat e recursos associados à diversidade de polinizadores.","Maintenance of habitat and resources associated with pollinator diversity."),
        M02=c("Recuperação de habitat pode beneficiar abundância e riqueza de abelhas silvestres.","Habitat restoration can benefit wild-bee abundance and richness."),
        M03=c("Maior heterogeneidade pode sustentar biodiversidade e a provisão de serviços ecossistêmicos.","Greater heterogeneity can support biodiversity and ecosystem-service delivery."),
        M04=c("Recursos florais diversos e persistentes podem favorecer polinizadores e o serviço de polinização.","Diverse, persistent floral resources can support pollinators and pollination service."),
        M05=c("A conectividade pode ser considerada para reduzir isolamento, mas seus benefícios dependem do contexto da paisagem.","Connectivity can be considered to reduce isolation, but benefits depend on landscape context."),
        M06=c("O IPPM integra controle de pragas com medidas para reduzir a exposição e proteger polinizadores.","IPPM integrates pest control with measures to reduce exposure and protect pollinators.")
      )[[mid]]
      if(pt) z[1] else z[2]
    }
    caveat_text <- function(mid){
      z <- list(
        M01=c("Não implica aumento garantido de produtividade ou retorno econômico.","Does not imply guaranteed increases in yield or economic return."),
        M02=c("A evidência é mais direta para respostas de abelhas do que para produtividade agrícola.","Evidence is more direct for bee responses than for crop yield."),
        M03=c("Os efeitos variam entre paisagens e sistemas agrícolas.","Effects vary among landscapes and farming systems."),
        M04=c("A efetividade depende da diversidade floral, idade/perenidade e distância; ganhos de produtividade não são garantidos.","Effectiveness depends on floral diversity, age/permanence and distance; yield gains are not guaranteed."),
        M05=c("Não se deve assumir benefício universal de corredores ou da configuração da paisagem.","Universal benefits of corridors or landscape configuration should not be assumed."),
        M06=c("O framework orienta decisões de manejo, mas não fornece uma redução quantitativa universal do risco aos polinizadores.","The framework guides management decisions but does not provide a universal quantitative reduction in pollinator risk.")
      )[[mid]]
      if(pt) z[1] else z[2]
    }

    ev_type_label <- function(x){
      if(!pt) return(x)
      z <- c("Global quantitative synthesis"="Síntese quantitativa global","Global synthesis"="Síntese global","Meta-analysis"="Meta-análise","Quantitative synthesis"="Síntese quantitativa","Review / conceptual framework"="Revisão / estrutura conceitual","Review / decision framework"="Revisão / estrutura de decisão","Brazilian review / policy synthesis"="Revisão brasileira / síntese de políticas")
      ifelse(x %in% names(z),unname(z[x]),x)
    }
    ev_scope_label <- function(x){
      if(!pt) return(x)
      z <- c("Global"="Global","Multi-region"="Multirregional","North America; Europe; New Zealand"="América do Norte; Europa; Nova Zelândia","General agricultural systems"="Sistemas agrícolas em geral","Brazil"="Brasil")
      ifelse(x %in% names(z),unname(z[x]),x)
    }
    ev_caveat_label <- function(id,x){
      if(!pt) return(x)
      z <- c(
        "ME01"="Forte suporte para qualidade do habitat e diversificação local; conectividade ou configuração da paisagem, isoladamente, não devem ser interpretadas como garantia de benefício.",
        "ME02"="Síntese ampla sobre polinização e controle biológico; os tamanhos de efeito dependem do contexto e não devem ser convertidos diretamente em retorno econômico.",
        "ME03"="A meta-análise avaliou principalmente abundância e riqueza de abelhas silvestres em habitats restaurados, e não diretamente produtividade agrícola ou retorno econômico.",
        "ME04"="Priorizar recursos florais de alta qualidade, e não simplesmente 'plantar flores'. A efetividade varia com diversidade, idade/permanência e distância, e ganhos de produtividade não são garantidos.",
        "ME05"="A estrutura apoia a integração do manejo de pragas e polinizadores, mas não fornece uma redução quantitativa universal da exposição ou do risco aos polinizadores.",
        "ME06"="Utilizar como estrutura de manejo; não inferir um tamanho de efeito ecológico ou econômico fixo.",
        "ME07"="Possui forte relevância contextual para o Brasil, mas constitui uma síntese de políticas/revisão, e não uma estimativa quantitativa do efeito de uma intervenção.")
      if(id %in% names(z)) unname(z[id]) else x
    }

    cards <- lapply(seq_len(nrow(res)),function(i){
      ev <- management_evidence[grepl(res$Management_ID[i],management_evidence$Management_ID,fixed=TRUE),,drop=FALSE]
      ev <- ev[!is.na(ev$Reference) & nzchar(ev$Reference),,drop=FALSE]
      ev <- ev[!duplicated(ev$Evidence_ID),,drop=FALSE]
      evidence_items <- if(nrow(ev)) lapply(seq_len(min(nrow(ev),6)),function(j){
        doi <- as.character(ev$DOI[j]); url <- as.character(ev$Source_URL[j])
        div(class="evidence-item",
            strong(ev$Reference[j]),
            div(class="evmeta",paste0(if(pt) "Tipo: " else "Type: ",ev_type_label(ev$Evidence_type[j])," · ",if(pt) "Abrangência: " else "Scope: ",ev_scope_label(ev$Geographic_scope[j]))),
            if(!is.na(doi) && nzchar(doi)) div(class="evidence-doi",paste0("DOI: ",doi)," · ",tags$a(href=url,target="_blank",if(pt) "Abrir artigo" else "Open article")) else NULL,
            div(class="rec-caveat",ev_caveat_label(ev$Evidence_ID[j],ev$Caveats[j])))
      }) else NULL
      div(class="rec-card",
          div(class="rec-top",
              div(strong(if(pt) res$Action_PT[i] else res$Action[i]),
                  div(class="priority",paste0(if(pt) "Prioridade de manejo: " else "Management priority: ",if(pt) res$Priority_PT[i] else res$Priority[i]))),
              span(class="evidence-chip",paste0(if(pt) "Força da evidência: " else "Evidence strength: ",strength_label(res$Evidence_strength[i])))),
          div(class="rec-explain",
              div(strong(class="rec-label",if(pt) "Por que foi recomendado: " else "Why this was recommended: "),if(pt) res$Rationale_PT[i] else res$Rationale_EN[i]),
              div(style="margin-top:6px",strong(class="rec-label",if(pt) "O que a literatura sustenta: " else "What the literature supports: "),benefit_text(res$Management_ID[i])),
              div(class="rec-caveat",strong(if(pt) "Importante: " else "Important: "),caveat_text(res$Management_ID[i]))),
          div(class="evmeta",paste0(nrow(ev),if(pt) " fontes científicas" else " scientific sources")),
          if(nrow(ev)) {
            panel_id <- paste0("mg_evidence_panel_",res$Management_ID[i])
            tagList(
              tags$button(
                type="button", class="evidence-toggle-btn",
                onclick=sprintf("var p=document.getElementById('%s'); var open=p.style.display==='block'; p.style.display=open?'none':'block'; this.setAttribute('aria-expanded', open?'false':'true'); this.innerHTML=open?'%s':'%s';", panel_id,
                                if(pt) "Ver evidências científicas" else "View scientific evidence",
                                if(pt) "Ocultar evidências científicas" else "Hide scientific evidence"),
                `aria-expanded`="false",
                if(pt) "Ver evidências científicas" else "View scientific evidence"
              ),
              div(id=panel_id,class="evidence-expand-panel",style="display:none;",evidence_items)
            )
          } else NULL)
    })
    pressure_count <- sum(res$Context_score > 0,na.rm=TRUE)
    priority_count <- sum(res$Priority %in% c("Very high","High"),na.rm=TRUE)
    exposure_lab <- switch(exposure_id(),E0=if(pt) "Muito baixa/personalizada" else "Very low/custom",E1=if(pt) "Menor" else "Lower",E2=if(pt) "Intermediária" else "Intermediate",E3=if(pt) "Maior" else "Higher")
    diagnostic <- if(pt)
      paste0("Exposição ",tolower(exposure_lab)," (",input$reduction %||% 25,"%) · ",pressure_count," pressões de manejo identificadas · ",priority_count," ações com prioridade alta ou muito alta")
    else paste0(exposure_lab," exposure (",input$reduction %||% 25,"%) · ",pressure_count," management pressures identified · ",priority_count," actions with high or very high priority")
    tagList(
      div(class="note",paste0(if(pt) "Cenário econômico ativo: " else "Active economic scenario: ",input$reduction %||% 25,"% · ",exposure_id())),
      div(class="diagnostic-summary",diagnostic),
      h3(if(pt) "Ações priorizadas" else "Prioritized actions"),
      do.call(tagList,cards),
      div(class="note",if(pt) "Força da evidência e prioridade de manejo são dimensões independentes. 'Não informado' permanece desconhecido. As recomendações são opções de adaptação baseadas em evidências, não previsões de recuperação ecológica ou econômica." else "Evidence strength and management priority are independent dimensions. 'Unknown' remains unknown. Recommendations are evidence-based adaptation options, not predictions of ecological or economic recovery.")
    )
  })

  output$about_ui <- renderUI({
    pt <- rv$lang=="pt"
    div(class="box",
      h2(class="title",if(pt) "Sobre a plataforma" else "About the platform"),
      div(class="subtitle",if(pt) "Informação científica, institucional e de transparência" else "Scientific, institutional and transparency information"),
      p(class="about-lead",if(pt)
        "O Pollination Risk and Value Tool é uma plataforma científica de código aberto desenvolvida para apoiar a avaliação transparente, reproduzível e transferível da importância econômica dos serviços de polinização em sistemas agrícolas."
        else "The Pollination Risk and Value Tool is an open-source scientific platform developed to support transparent, reproducible, and transferable assessment of the economic importance of pollination ecosystem services in agricultural systems."),
      div(class="science-note",strong(if(pt) "Status desta versão. " else "Release status. "), if(pt) "Esta V2.41 é uma versão pública congelada que acompanha um manuscrito em revisão por pares. O conjunto analítico 4M está congelado para reprodutibilidade. O catálogo científico ampliado é complementar, permanece separado do cálculo econômico e poderá receber refinamentos após a aceitação do artigo." else "This V2.41 is a frozen public release accompanying a manuscript under peer review. The 4M analytical dataset is frozen for reproducibility. The expanded scientific catalog is complementary, remains separate from economic calculations, and may receive refinements after article acceptance."),
      div(class="about-grid",
        div(class="about-card",h3(if(pt) "Finalidade científica" else "Scientific purpose"),
          p(if(pt) "A plataforma integra dados de produção e exportação agrícola, evidências científicas sobre dependência de polinizadores, indicadores de valor e dependência econômica, cenários padronizados de redução do serviço de polinização e recomendações de manejo baseadas em evidências. Sua arquitetura preserva a rastreabilidade das informações utilizadas, incluindo fonte bibliográfica, abrangência geográfica, linhagem da evidência e limitações associadas."
            else "The platform integrates agricultural production and export data, scientific evidence on pollinator dependence, indicators of economic value and dependence, standardized pollination-service reduction scenarios, and evidence-based management recommendations. Its architecture preserves traceability of the information used, including bibliographic source, geographic scope, evidence lineage, and associated limitations.")),
        div(class="about-card",h3(if(pt) "Escopo e interpretação" else "Scope and interpretation"),
          p(if(pt) "Quando diferentes estimativas científicas estão disponíveis para uma mesma cultura, a plataforma mantém explicitamente a divergência e não substitui automaticamente o coeficiente selecionado pelo usuário. As recomendações de manejo combinam exposição econômica, contexto ecológico informado e literatura científica, sendo apresentadas como opções de adaptação apoiadas por evidências, e não como previsões de recuperação ecológica ou econômica."
            else "When different scientific estimates are available for the same crop, the platform explicitly retains the divergence and does not automatically replace the coefficient selected by the user. Management recommendations combine economic exposure, reported ecological context, and scientific literature and are presented as evidence-supported adaptation options rather than predictions of ecological or economic recovery."))
      ),
      div(class="science-note",strong(if(pt) "Princípio de transparência científica. " else "Scientific transparency principle. "),
        if(pt) "Dependência de polinizadores, limitação atual da polinização, resposta dos polinizadores, produtividade agrícola e retorno econômico são dimensões distintas. A ferramenta não converte automaticamente evidência de uma dimensão em efeito quantitativo sobre outra."
        else "Pollinator dependence, current pollination limitation, pollinator responses, crop yield, and economic return are distinct dimensions. The tool does not automatically convert evidence from one dimension into a quantitative effect on another."),
      h3(if(pt) "Desenvolvimento, financiamento e apoio institucional" else "Development, funding and institutional support"),
      div(class="institution-strip",
        div(class="institution-card",div(class="institution-role",if(pt) "Desenvolvimento e apoio institucional" else "Development and institutional support"),div(class="institution-name","UFRN"),div(class="institution-full",if(pt) "Universidade Federal do Rio Grande do Norte · Brasil" else "Federal University of Rio Grande do Norte · Brazil")),
        div(class="institution-card",div(class="institution-role",if(pt) "Fomento à pesquisa" else "Research funding"),div(class="institution-name","CAPES"),div(class="institution-full",if(pt) "Coordenação de Aperfeiçoamento de Pessoal de Nível Superior · Governo Federal do Brasil" else "Coordination for the Improvement of Higher Education Personnel · Brazilian Federal Government")),
        div(class="institution-card",div(class="institution-role",if(pt) "Fomento à pesquisa" else "Research funding"),div(class="institution-name","CNPq"),div(class="institution-full",if(pt) "Conselho Nacional de Desenvolvimento Científico e Tecnológico · Governo Federal do Brasil" else "National Council for Scientific and Technological Development · Brazilian Federal Government"))
      ),
      p(if(pt) "A pesquisa associada ao desenvolvimento desta plataforma recebeu apoio do Governo Federal do Brasil, por meio da CAPES e do CNPq, com apoio institucional da Universidade Federal do Rio Grande do Norte (UFRN)."
        else "The research associated with the development of this platform received support from the Brazilian Federal Government through CAPES and CNPq, with institutional support from the Federal University of Rio Grande do Norte (UFRN)."),
      p(class="funding-note",if(pt) "As instituições financiadoras e de apoio não determinam a seleção das evidências científicas, os coeficientes aplicados, os resultados produzidos pela plataforma ou sua interpretação. Durante o período de defeso eleitoral de 2026, esta versão utiliza identificação institucional textual; a aplicação de marcas oficiais deve seguir as normas vigentes de cada instituição."
        else "Funding and supporting institutions do not determine the scientific evidence selected, the coefficients applied, the results generated by the platform, or their interpretation. During Brazil's 2026 electoral communication restriction period, this version uses textual institutional identification; application of official marks must follow each institution's current rules."),
      h3(if(pt) "Informações do software" else "Software information"),
      div(class="meta-table",
        div(class="meta-key",if(pt) "Versão" else "Version"),div("2.41 · Public Review Release"),
        div(class="meta-key",if(pt) "Status" else "Status"),div(if(pt) "Manuscrito em revisão por pares · conjunto 4M congelado" else "Manuscript under peer review · frozen 4M dataset"),
        div(class="meta-key",if(pt) "Natureza" else "Nature"),div(if(pt) "Software científico de código aberto para apoio à decisão baseado em evidências" else "Open-source scientific software for evidence-based decision support"),
        div(class="meta-key",if(pt) "Desenvolvimento" else "Development"),div(if(pt) "Jaqueiuto S. Jorge e colaboradores" else "Jaqueiuto S. Jorge and collaborators"),
        div(class="meta-key","ORCID"),div(tags$a(href="https://orcid.org/0000-0003-4887-3647",target="_blank","Jaqueiuto S. Jorge · 0000-0003-4887-3647")),
        div(class="meta-key",if(pt) "Aplicação inicial" else "Initial application"),div(if(pt) "Sistemas irrigados de produção de frutas no semiárido brasileiro" else "Irrigated fruit production systems in the Brazilian semiarid region"),
        div(class="meta-key",if(pt) "Licença" else "License"),div(if(pt) "A definir antes da publicação pública" else "To be defined before public release"),
        div(class="meta-key",if(pt) "Citação" else "Citation"),div(if(pt) "A citação formal e o DOI do software serão disponibilizados após o depósito da versão pública no Zenodo." else "The formal citation and software DOI will be provided after deposition of the public release in Zenodo.")
      ),
      div(class="about-links",
        tags$a(href="https://github.com/jaqueiutoj2010-glitch/Pollination-Risk-and-Value-Tool",target="_blank","GitHub"),
        tags$a(href="https://ufrn.br",target="_blank","UFRN"),
        tags$a(href="https://www.gov.br/capes/pt-br",target="_blank","CAPES"),
        tags$a(href="https://www.gov.br/cnpq/pt-br",target="_blank","CNPq")
      )
    )
  })

  # Nomes editoriais de culturas: exibicao e busca, sem alterar a fonte literal.
  catalogo_nomes <- read.csv("data/catalogo_nomes_comuns.csv", stringsAsFactors=FALSE, check.names=FALSE, fileEncoding="UTF-8-BOM")
  stopifnot(nrow(catalogo_nomes)==nrow(catalogo_v30), identical(catalogo_nomes$UID, catalogo_v30$UID))
  catalogo_v30[["Nome comum (PT)"]] <- catalogo_nomes[["Nome comum (PT)"]]
  catalogo_v30[["Common name (EN)"]] <- catalogo_nomes[["Common name (EN)"]]
  # Alias editoriais para pesquisa; nao alteram a taxonomia nem os coeficientes.
  catalogo_alias <- function(nomes) {
    n <- tolower(iconv(nomes, to="ASCII//TRANSLIT"))
    a <- rep("", length(n))
    regras <- list(
      "cucumis melo"="melao melon cantaloupe",
      "citrullus lanatus"="melancia watermelon",
      "mangifera indica"="manga mango",
      "carica papaya"="mamao papaya",
      "glycine max"="soja soybean",
      "coffea arabica"="cafe coffee",
      "coffea canephora"="cafe coffee robusta",
      "lycopersicon esculentum"="tomate tomato solanum lycopersicum",
      "solanum lycopersicum"="tomate tomato lycopersicon esculentum",
      "capsicum annuum"="pimentao pimenta pepper",
      "gossypium hirsutum"="algodao cotton",
      "phaseolus vulgaris"="feijao bean",
      "citrus"="citros citrus",
      "cucurbita"="abobora pumpkin squash",
      "euterpe oleracea"="acai acai berry",
      "myrciaria dubia"="camu camu"
    )
    for (chave in names(regras)) {
      hit <- grepl(chave, n, fixed=TRUE) & !is.na(n)
      a[hit] <- paste(a[hit], regras[[chave]])
    }
    a
  }
  catalogo_normalizar <- function(x) {
    x <- iconv(as.character(x), to="ASCII//TRANSLIT", sub="")
    tolower(ifelse(is.na(x), "", x))
  }
  # V2.35: metadados brutos independentes para interpretar a heterogeneidade.
  siopa_meta <- read.csv("data/siopa_metadados_fontes.csv",stringsAsFactors=FALSE,check.names=FALSE,fileEncoding="UTF-8-BOM")
  # Consulta isolada: correspondência exata com nomes populares prevalece.

  catalogo_filtrado <- reactive({
    x <- catalogo_v30
    q <- catalogo_normalizar(trimws(input$catalogo_busca %||% ""))
    if(nzchar(q)) {
      pt <- catalogo_normalizar(x[["Nome comum (PT)"]])
      en <- catalogo_normalizar(x[["Common name (EN)"]])
      literal <- catalogo_normalizar(x[["Nome literal"]])
      aliases <- catalogo_normalizar(catalogo_alias(x[["Nome literal"]]))
      # Busca por palavras completas nos nomes comuns e aliases, sem regex do usuário.
      palavra <- function(v) {
        v <- gsub("[^[:alnum:]]+", " ", v)
        grepl(paste0(" ",q," "),paste0(" ",v," "),fixed=TRUE)
      }
      comum <- palavra(pt) | palavra(en)
      outros <- grepl(q,literal,fixed=TRUE) | grepl(q,catalogo_normalizar(x$UID),fixed=TRUE) | palavra(aliases)
      exato <- pt==q | en==q
      # Modo padrão: havendo correspondência popular exata, não misturar outras culturas.
      if(any(exato) && !isTRUE(input$catalogo_relacionadas)) {
        x <- x[exato,,drop=FALSE]
      } else {
        x <- x[comum | outros,,drop=FALSE]
        if(nrow(x)) {
          ptx <- catalogo_normalizar(x[["Nome comum (PT)"]]); enx <- catalogo_normalizar(x[["Common name (EN)"]])
          score <- ifelse(ptx==q | enx==q,0L,ifelse(startsWith(ptx,q) | startsWith(enx,q),1L,2L))
          x <- x[order(score,seq_len(nrow(x))),,drop=FALSE]
        }
      }
    }
    if(!is.null(input$catalogo_fonte) && input$catalogo_fonte != "Todas") x <- x[x$Fonte==input$catalogo_fonte,,drop=FALSE]
    if(!is.null(input$catalogo_tipo) && input$catalogo_tipo != "Todos") x <- x[x$Tipo==input$catalogo_tipo,,drop=FALSE]
    x
  })
  # V2.34: síntese descritiva, SEM média de resultados experimentais heterogêneos.
  catalogo_sintese <- reactive({
    x <- catalogo_filtrado()
    if(!nrow(x)) return(data.frame())
    pt <- ifelse(is.na(x[["Nome comum (PT)"]]) | !nzchar(x[["Nome comum (PT)"]]), "Sem nome comum", x[["Nome comum (PT)"]])
    en <- ifelse(is.na(x[["Common name (EN)"]]) | !nzchar(x[["Common name (EN)"]]), "Common name unavailable", x[["Common name (EN)"]])
    # Nomes literais podem conter autoria; agrupar variantes de autoria apenas por binômio.
    sci <- trimws(x[["Nome literal"]]); bin <- regmatches(sci, regexpr("^[A-Z][a-z]+\\s+[a-z]+", sci, perl=TRUE))
    bin[!nzchar(bin)] <- sci[!nzchar(bin)]
    grupo <- paste(pt, en, bin, sep="|||", collapse=NULL)
    indices <- split(seq_len(nrow(x)), factor(grupo, levels=unique(grupo)))
    linhas <- lapply(indices, function(ii) {
      y <- x[ii,,drop=FALSE]; gg <- y[y$Fonte=="Giannini",,drop=FALSE]
      kk <- y[y$Fonte=="Klein",,drop=FALSE]; ss <- y[y$Fonte=="Siopa",,drop=FALSE]
      numeros <- suppressWarnings(as.numeric(ss[["Valor numérico"]])); numeros <- numeros[is.finite(numeros)]
      gi <- unique(gg[["Valor literal"]]); gi <- gi[!is.na(gi) & nzchar(gi)]
      kl <- unique(kk[["Valor literal"]]); kl <- kl[!is.na(kl) & nzchar(kl)]
      data.frame(Cultura_PT=pt[ii[1]],Cultura_EN=en[ii[1]],Especie=bin[ii[1]],
        Giannini=if(length(gi)) paste(gi,collapse="; ") else "—",
        Klein=if(length(kl)) paste(kl,collapse="; ") else if(nrow(kk)) "Categoria: consultar registro" else "—",
        Siopa_n=nrow(ss),Siopa_min=if(length(numeros)) min(numeros) else NA_real_,
        Siopa_max=if(length(numeros)) max(numeros) else NA_real_,
        Evidencias=nrow(y),stringsAsFactors=FALSE)
    })
    do.call(rbind, linhas)
  })
  output$catalogo_alerta_negativos <- renderUI({
    x <- catalogo_filtrado(); ss <- x[x$Fonte=="Siopa",,drop=FALSE]
    v <- suppressWarnings(as.numeric(ss[["Valor numérico"]]))
    if(!any(is.finite(v) & v<0)) return(NULL)
    p(style="color:#99540b;font-weight:600",if(rv$lang=="pt")
      paste("Atenção:",sum(is.finite(v) & v<0),"valor(es) experimentais negativos nesta seleção. Preservados como publicados; verificar a variável original e o cálculo antes de interpretar.")
      else paste("Caution:",sum(is.finite(v) & v<0),"negative experimental value(s) in this selection. Preserved as published; inspect the original outcome and calculation before interpreting."))
  })
  output$catalogo_sintese <- DT::renderDT({
    x <- catalogo_sintese(); pt <- rv$lang=="pt"
    if(!nrow(x)) return(DT::datatable(data.frame(Mensagem=if(pt) "Nenhuma cultura encontrada" else "No matching crops"),options=list(dom="t"),rownames=FALSE))
    intervalo <- ifelse(x$Siopa_n>0 & is.finite(x$Siopa_min),
      paste0(format(x$Siopa_min,trim=TRUE,digits=3)," a ",format(x$Siopa_max,trim=TRUE,digits=3)),"—")
    z <- data.frame(Cultura=if(pt) x$Cultura_PT else x$Cultura_EN,
      Especie=x$Especie,Giannini=x$Giannini,Klein=x$Klein,
      `Siopa: registros`=x$Siopa_n,`Siopa: mínimo–máximo`=intervalo,
      `Total de registros`=x$Evidencias,check.names=FALSE)
    DT::datatable(z,rownames=FALSE,selection="none",options=list(pageLength=10,scrollX=TRUE,searching=FALSE,
      language=list(emptyTable=if(pt) "Nenhuma cultura encontrada" else "No matching crops")))
  },server=TRUE)
  output$catalogo_siopa_meta <- DT::renderDT({
    x <- catalogo_filtrado(); x <- x[x$Fonte=="Siopa",,drop=FALSE]
    if(!nrow(x)) return(DT::datatable(data.frame(Message="No Siopa records"),rownames=FALSE,options=list(dom="t")))
    sci <- trimws(x[["Nome literal"]]); bin <- regmatches(sci,regexpr("^[A-Z][a-z]+\\s+[a-z]+",sci,perl=TRUE))
    species <- unique(ifelse(nzchar(bin),bin,sci))
    meta_species <- trimws(siopa_meta$species)
    # Only literal binomial matches; spp. and groups require manual inspection.
    y <- siopa_meta[meta_species %in% species,,drop=FALSE]
    if(!nrow(y)) return(DT::datatable(data.frame(Message=if(rv$lang=="pt") "Sem correspondência literal nos dados originais; conferir grafia e sinônimos." else "No literal match in original data; check spelling and synonyms."),rownames=FALSE,options=list(dom="t")))
    y <- y[,c("dataset","study","species","response","treatment","scale","country","pd_value","pd_type"),drop=FALSE]
    names(y) <- if(rv$lang=="pt") c("Arquivo","Estudo","Espécie","Resposta","Tratamento","Escala","País","Valor original","Tipo PD") else c("Dataset","Study","Species","Outcome","Treatment","Scale","Country","Original value","PD type")
    DT::datatable(y,rownames=FALSE,selection="none",options=list(pageLength=8,scrollX=TRUE,searching=TRUE))
  },server=TRUE)
  # V2.37: study-level traceability and protocol overlap flags. This is NOT a pooled estimate.
  catalogo_siopa_estudos <- reactive({
    x <- catalogo_filtrado(); x <- x[x$Fonte=="Siopa",,drop=FALSE]
    if(!nrow(x)) return(data.frame())
    sci <- trimws(x[["Nome literal"]]); bin <- regmatches(sci,regexpr("^[A-Z][a-z]+\\s+[a-z]+",sci,perl=TRUE))
    species <- unique(ifelse(nzchar(bin),bin,sci))
    y <- siopa_meta[trimws(siopa_meta$species) %in% species,,drop=FALSE]
    if(!nrow(y)) return(data.frame())
    keys <- c("dataset","study","species","response","treatment","scale","country")
    ids <- split(seq_len(nrow(y)),interaction(y[,keys],drop=TRUE,lex.order=TRUE))
    z <- lapply(ids,function(ii) {
      a <- y[ii[1],keys,drop=FALSE]
      v <- suppressWarnings(as.numeric(y$pd_value[ii])); v <- v[is.finite(v)]
      a$source_rows <- paste(y$source_row[ii],collapse=", ")
      a$n_source_rows <- length(ii)
      a$minimum <- if(length(v)) min(v) else NA_real_
      a$maximum <- if(length(v)) max(v) else NA_real_
      a$negative_values <- sum(v<0)
      # Stable editorial key for tracing the same study/species across source datasets.
      a$study_key <- paste(catalogo_normalizar(a$study), catalogo_normalizar(a$species), sep="::")
      a
    })
    out <- do.call(rbind,z)
    # Flag studies represented in more than one source dataset; this is a review flag, not proof of duplication.
    nd <- ave(as.character(out$dataset), out$study_key, FUN=function(v) length(unique(v)))
    out$possible_overlap <- ifelse(nd > 1, if(rv$lang=="pt") "REVISAR: mesmo estudo em múltiplos arquivos" else "REVIEW: same study in multiple datasets", "—")
    out
  })
  output$catalogo_siopa_estudos <- DT::renderDT({
    z <- catalogo_siopa_estudos(); pt <- rv$lang=="pt"
    if(!nrow(z)) return(DT::datatable(data.frame(Mensagem=if(pt) "Sem grupos de estudos correspondentes" else "No matching study groups"),options=list(dom="t"),rownames=FALSE))
    # Keep study_key internal; expose the overlap review flag.
    z$study_key <- NULL
    names(z) <- if(pt) c("Arquivo","Estudo","Espécie","Resposta","Tratamento","Escala","País","Linhas de origem","Nº de linhas","Mínimo","Máximo","Valores negativos","Sobreposição potencial") else c("Dataset","Study","Species","Outcome","Treatment","Scale","Country","Source rows","Row count","Minimum","Maximum","Negative values","Potential overlap")
    DT::datatable(z,rownames=FALSE,selection="none",options=list(pageLength=8,scrollX=TRUE,searching=TRUE))
  },server=TRUE)
  output$catalogo_estudo_detalhe <- DT::renderDT({
    z <- catalogo_siopa_estudos(); pt <- rv$lang=="pt"
    req(nrow(z)>0, input$catalogo_estudo)
    q <- as.character(input$catalogo_estudo)
    y <- z[as.character(z$study)==q,,drop=FALSE]
    if(!nrow(y)) return(DT::datatable(data.frame(Mensagem=if(pt) "Selecione um estudo" else "Select a study"),options=list(dom="t"),rownames=FALSE))
    y$study_key <- NULL
    names(y) <- if(pt) c("Arquivo","Estudo","Espécie","Resposta","Tratamento","Escala","País","Linhas de origem","Nº de linhas","Mínimo","Máximo","Valores negativos","Sobreposição potencial") else c("Dataset","Study","Species","Outcome","Treatment","Scale","Country","Source rows","Row count","Minimum","Maximum","Negative values","Potential overlap")
    DT::datatable(y,rownames=FALSE,selection="none",options=list(pageLength=12,scrollX=TRUE,searching=FALSE))
  },server=TRUE)
  observe({
    z <- catalogo_siopa_estudos()
    choices <- if(nrow(z)) sort(unique(as.character(z$study))) else character(0)
    updateSelectInput(session,"catalogo_estudo",choices=choices,selected=if(length(choices)) choices[1] else character(0))
  })
  output$catalogo_ui <- renderUI({
    pt <- rv$lang=="pt"
    div(class="box",
      h2(class="title",if(pt) "Catálogo científico de polinização" else "Scientific pollination catalog"),
      p(if(pt) "Módulo exploratório complementar. Busque pelo nome popular, nome científico ou UID. O catálogo ampliado é disponibilizado para consulta e rastreabilidade e NÃO é incorporado automaticamente aos cálculos econômicos do conjunto 4M congelado." else "Complementary exploratory module. Search common names, scientific names or UID. The expanded catalog is provided for exploration and provenance tracking and is NOT automatically incorporated into economic calculations from the frozen 4M dataset."),
      div(class="science-note", strong(if(pt) "Separação dos módulos. " else "Module separation. "), if(pt) "Dados do artigo = conjunto analítico congelado e reprodutível. Catálogo científico = evidência complementar para exploração e proveniência." else "Article data = frozen, reproducible analytical dataset. Scientific catalog = complementary evidence for exploration and provenance."),
      fluidRow(
        column(3,div(class="context-card",strong(if(pt) "Registros" else "Records"),h3(format(nrow(catalogo_v30),big.mark=".")))),
        column(3,div(class="context-card",strong("Giannini"),h3(sum(catalogo_v30$Fonte=="Giannini")))),
        column(3,div(class="context-card",strong("Klein"),h3(sum(catalogo_v30$Fonte=="Klein")))),
        column(3,div(class="context-card",strong("Siopa"),h3(sum(catalogo_v30$Fonte=="Siopa"))))
      ),hr(),
      fluidRow(
        column(5,textInput("catalogo_busca",if(pt) "Pesquisar cultura, espécie ou UID" else "Search crop, species or UID","")),
        column(3,selectInput("catalogo_fonte",if(pt) "Publicação" else "Publication",c("Todas",sort(unique(catalogo_v30$Fonte))))),
        column(4,selectInput("catalogo_tipo",if(pt) "Tipo de evidência" else "Evidence type",c("Todos",sort(unique(catalogo_v30$Tipo)))))
      ),
      checkboxInput("catalogo_relacionadas",if(pt) "Incluir culturas relacionadas e correspondências parciais" else "Include related crops and partial matches",value=FALSE),
      h4(textOutput("catalogo_total")),
      radioButtons("catalogo_modo",if(pt) "Visualização" else "View",
        choices=if(pt) c("Síntese por espécie"="sintese","Registros individuais"="detalhe")
                else c("Species overview"="sintese","Individual records"="detalhe"),
        selected="sintese",inline=TRUE),
      conditionalPanel("input.catalogo_modo == 'sintese'",
        p(if(pt) "Siopa: número de registros e amplitude descritiva (mínimo–máximo) por espécie. NÃO é média, intervalo de confiança ou coeficiente geral de dependência; experimentos podem ter métodos e respostas diferentes. Registros não são necessariamente estudos independentes." else "Siopa: record count and descriptive range (minimum–maximum) per species. NOT a mean, confidence interval or general dependence coefficient; methods and outcomes may differ. Records are not necessarily independent studies."),
        uiOutput("catalogo_alerta_negativos"),
        DT::DTOutput("catalogo_sintese"),
        h4(if(pt) "Metadados dos estudos de Siopa" else "Siopa study metadata"),
        p(if(pt) "Linhas dos três conjuntos originais, relacionadas por espécie, NÃO vinculadas automaticamente aos UIDs nem interpretadas como estudos independentes. Siglas SUP, OP, BOTH, BH e AH permanecem como nos arquivos originais até a conferência do dicionário metodológico. Examine a variável de resposta, o tratamento e o estudo antes de comparar valores." else "Rows from the three original datasets, matched by species, NOT automatically mapped to catalog UIDs or treated as independent studies. Inspect outcome, treatment and study before comparing values."),
        DT::DTOutput("catalogo_siopa_meta"),
        h4(if(pt) "Comparação por estudo e protocolo" else "Comparison by study and protocol"),
        p(if(pt) "Agrupamento por arquivo, estudo, espécie, resposta, tratamento, escala e país. Mínimo e máximo descrevem linhas de origem, não estudos independentes. Nenhuma média ou coeficiente econômico é calculado." else "Grouped by dataset, study, species, outcome, treatment, scale and country. Ranges describe source rows, not independent studies. No mean or economic coefficient is calculated."),
        DT::DTOutput("catalogo_siopa_estudos"),
        h4(if(pt) "Examinar um estudo" else "Inspect one study"),
        p(if(pt) "Selecione um estudo para reunir seus protocolos e respostas. O marcador de sobreposição apenas indica que o mesmo estudo aparece em mais de um arquivo-fonte e requer conferência; não significa duplicação confirmada." else "Select a study to gather its protocols and outcomes. The overlap flag only indicates that the same study appears in more than one source dataset and requires review; it does not prove duplication."),
        selectInput("catalogo_estudo",if(pt) "Estudo" else "Study",choices=character(0)),
        DT::DTOutput("catalogo_estudo_detalhe")),
      conditionalPanel("input.catalogo_modo == 'detalhe'",DT::DTOutput("catalogo_tabela")),
      hr(),h4(if(pt) "Proveniência de um registro" else "Record provenance"),
      p(if(pt) "Para examinar a proveniência, escolha Registros individuais e selecione uma linha ou UID." else "To inspect provenance, choose Individual records and select a row or UID."),
      conditionalPanel("input.catalogo_modo == 'detalhe' && output.catalogo_tem_resultados",selectInput("catalogo_uid",if(pt) "Selecione o registro" else "Select record",choices=character(0)),tableOutput("catalogo_detalhe")),
      conditionalPanel("input.catalogo_modo == 'detalhe' && !output.catalogo_tem_resultados",p(if(pt) "Nenhum registro selecionado. Ajuste os filtros para consultar a proveniência." else "No record selected. Adjust filters to view provenance.")),
      downloadButton("catalogo_exportar",if(pt) "Exportar seleção (CSV)" else "Export selection (CSV)"),
      hr(),p(if(pt) "Klein: categorias e intervalos; Giannini: coeficientes por linha comercial; Siopa: observações experimentais. Nenhuma transferência automática para espécies ou para o cálculo econômico." else "Klein: qualitative classes and intervals; Giannini: commodity-level coefficients; Siopa: experimental observations. No automatic transfer to individual species or economic calculations.")
    )
  })
  output$catalogo_tem_resultados <- reactive(nrow(catalogo_filtrado())>0)
  outputOptions(output,"catalogo_tem_resultados",suspendWhenHidden=FALSE)
  output$catalogo_total <- renderText({
    paste(if(rv$lang=="pt") "Registros encontrados:" else "Matching records:",nrow(catalogo_filtrado()))
  })
  output$catalogo_tabela <- DT::renderDT({
    x <- catalogo_filtrado()
    comum <- if(rv$lang=="pt") "Nome comum (PT)" else "Common name (EN)"
    cols <- c(comum,"Nome literal","Fonte","Tipo","Valor literal")
    nomes <- if(rv$lang=="pt") c("Cultura","Nome científico","Fonte","Evidência","Valor") else c("Crop","Scientific name","Source","Evidence","Value")
    DT::datatable(x[,cols,drop=FALSE],rownames=FALSE,selection="single",colnames=nomes,
      extensions="Buttons",options=list(pageLength=15,scrollX=TRUE,searching=FALSE,autoWidth=FALSE,
        columnDefs=list(list(width="23%",targets=0),list(width="27%",targets=1),list(width="14%",targets=2),list(width="23%",targets=3),list(width="13%",targets=4)),
        language=list(emptyTable=if(rv$lang=="pt") "Nenhum registro encontrado" else "No matching records")))
  },server=TRUE)
  observe({
    x <- catalogo_filtrado(); choices <- x$UID
    atual <- isolate(input$catalogo_uid)
    escolhido <- if(length(atual) && atual %in% choices) atual else if(length(choices)) choices[1] else character(0)
    updateSelectInput(session,"catalogo_uid",choices=choices,selected=escolhido)
  })
  observeEvent(input$catalogo_tabela_rows_selected, {
    x <- catalogo_filtrado(); i <- input$catalogo_tabela_rows_selected
    if(length(i)==1 && i>=1 && i<=nrow(x)) updateSelectInput(session,"catalogo_uid",selected=x$UID[i])
  })
  output$catalogo_detalhe <- renderTable({
    x <- catalogo_filtrado()
    req(nrow(x)>0, input$catalogo_uid, input$catalogo_uid %in% x$UID)
    x <- x[x$UID==input$catalogo_uid,,drop=FALSE]
    data.frame(Campo=names(x),Informação=as.character(x[1,]),check.names=FALSE)
  },striped=TRUE,spacing="xs")
  output$catalogo_exportar <- downloadHandler(
    filename=function() paste0("catalogo_v235_selecao_",Sys.Date(),".csv"),
    content=function(file) write.csv(catalogo_filtrado(),file,row.names=FALSE,fileEncoding="UTF-8")
  )

  output$method_ui <- renderUI({
    div(class="box",h2(class="title",T()$method_title),div(class="subtitle",T()$method_note),
        p(T()$method_body),div(class="note",T()$scenarios_note))
  })
}

shinyApp(ui,server)
