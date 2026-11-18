/* Textos explicativos do site — baseados no manuscrito
   "Assessing the Economic Value and Climate-Related Exposure of Pollination Ecosystem Services in Tropical Drylands" (V2.41). */
window.ARTICLE = {
pt:{
  careful:{
    artigo:"Os DRs do artigo são conservadores: 0,95 para melão e melancia, 0,05 para mamão e 0,00 para manga. Uma análise de sensibilidade testa 0,25 para mamão e 0,05 para manga. O que você muda aqui vale só para esta sessão e não altera os resultados publicados.",
    modelo:"Antes de usar um DR, confira se ele vale para a sua cultura e região. A ferramenta avisa quando o seu valor difere da biblioteca científica, mas nunca o substitui sozinha.",
    cenarios:"São testes de estresse proporcionais, não previsões climáticas nem probabilidades. Preços, área plantada, comércio e manejo ficam constantes. Calor, seca, perda de habitat e agrotóxicos podem reduzir os polinizadores, mas nenhuma porcentagem é atribuída a uma causa específica.",
    evidencias:"Bases derivadas que apenas reproduzem uma publicação não contam como evidência independente. Quando as fontes divergem, a ferramenta não escolhe por você: a decisão fica registrada e visível.",
    catalogo:"Os três tipos de evidência têm significados diferentes e não são somados nem transformados em média. A faixa mínimo–máximo descreve registros, que não são necessariamente estudos independentes.",
    recomendacoes:"Força da evidência (o quanto a literatura sustenta a ação) e prioridade (o quanto ela importa para a sua área) são coisas diferentes. A ferramenta não estima quanto cada ação recupera em produção ou em dinheiro.",
    jogo:"Os jogos usam os dados da plataforma, mas suas regras de pontuação, dificuldade e percentuais da cesta são didáticas. Use-os para entender conceitos, não para estimar perdas reais.",
  },

  sources_title:"As três fontes do catálogo",
  sources:[
    ["Giannini et al. (2015)","Coeficientes de dependência por cultura comercial no Brasil. É a fonte dos DRs do artigo."],
    ["Klein et al. (2007)","Classes qualitativas de dependência (de “essencial” a “sem aumento”) para as principais culturas do mundo."],
    ["Siopa et al. (2024)","Observações de experimentos sobre a resposta das culturas à polinização. Métodos e variáveis variam entre estudos."]
  ],
  states_title:"O que significa cada estado",

  method:{
    framework_title:"Quatro entradas, quatro indicadores",
    framework:"O método é uma avaliação econômica de primeiro nível: estima dependência e exposição por cultura e por região sem exigir medições de abelhas em campo. Combina estatísticas de produção, dados de exportação, coeficientes de dependência publicados e cenários padronizados de redução do serviço.",
    data_title:"De onde vêm os dados",
    data:[
      "Produção e valor da produção: painel de produção de frutas da Abrafrutas (Associação Brasileira dos Produtores Exportadores de Frutas e Derivados), ano de 2024.",
      "Exportações (volume e receita): plataforma de dados estatísticos da Abrafrutas, 2024. A receita já vem em dólares.",
      "Valores de produção, informados em milhares de reais, foram convertidos para dólares com a taxa média de 2024."
    ],
    conv:"Valor em US$ = valor em mil R$ × 1.000 ÷ 5,39",
    dr_title:"Coeficientes usados no artigo",
    dr_note:"Fonte: Giannini et al. (2015), com a classificação internacional de Klein et al. (2007) como referência. Os coeficientes conservadores definem a base congelada; os de sensibilidade servem apenas para testar a incerteza das classes mais baixas.",
    dr_head:["Cultura","Classe de dependência","DR (base)","DR (sensibilidade)"],
    dr_rows:[["Melão","Essencial","0,95","0,95"],["Melancia","Essencial","0,95","0,95"],["Mamão","Pouca","0,05","0,25"],["Manga","Sem aumento","0,00","0,05"]],
    scen_title:"Cenários de redução",
    scen:"As reduções de 10%, 25% e 50% são hipóteses padronizadas. Estudos sobre clima e uso da terra mostram vários caminhos pelos quais os polinizadores podem ser afetados, mas diferem em grupo de insetos, região e horizonte de tempo. Por isso nenhuma porcentagem publicada foi usada como previsão para o Rio Grande do Norte.",
    limits_title:"O que a ferramenta não faz",
    limits:[
      "Não mede abelhas, visitas às flores ou déficit de polinização em campo: os DRs vêm da literatura.",
      "Não distingue diferenças dentro do estado (variedades, manejo, habitat, polinizadores manejados ou silvestres).",
      "Não estima o retorno de uma ação de conservação específica.",
      "Não soma produção e exportação: são contas diferentes.",
      "Não prevê perdas: os cenários são testes lineares condicionais."
    ],
    glossary_title:"Glossário",
    refs_title:"Referências principais"
  },
  about_article_title:"Artigo associado",
  about_article:"A ferramenta acompanha o manuscrito “Assessing the Economic Value and Climate-Related Exposure of Pollination Ecosystem Services in Tropical Drylands: A Reproducible Framework and Interactive Tool for Irrigated Fruit Production”, em revisão por pares. O artigo propõe um método reproduzível que liga produção, exportação, dependência de polinizadores e testes de estresse, aplicado à fruticultura irrigada do semiárido potiguar, na Caatinga.",
  about_findings:"Principais resultados do artigo (2024)",
  about_list:[
    "A polinização respondeu por US$ 175,8 milhões da produção (76,4%) e US$ 165,3 milhões das exportações (84,0%).",
    "Melão e melancia concentram mais de 99% desse valor.",
    "Quedas hipotéticas de 10%, 25% e 50% expõem de US$ 17,6 a 87,9 milhões da produção e de US$ 16,5 a 82,6 milhões das exportações."
  ]
},
en:{
  careful:{
    artigo:"The article's DRs are conservative: 0.95 for melon and watermelon, 0.05 for papaya and 0.00 for mango. A sensitivity analysis tests 0.25 for papaya and 0.05 for mango. Changes made here apply only to this session and do not alter the published results.",
    modelo:"Before using a DR, check that it applies to your crop and region. The tool warns when your value differs from the scientific library, but never replaces it on its own.",
    cenarios:"These are proportional stress tests, not climate forecasts or probabilities. Prices, cultivated area, trade and management are held constant. Heat, drought, habitat loss and pesticides can reduce pollinators, but no percentage is attributed to a specific cause.",
    evidencias:"Derived databases that only reproduce a publication do not count as independent evidence. When sources disagree, the tool does not choose for you: the choice stays recorded and visible.",
    catalogo:"The three evidence types mean different things and are never summed or averaged. A minimum–maximum range describes records, which are not necessarily independent studies.",
    recomendacoes:"Evidence strength (how well the literature supports an action) and priority (how much it matters for your area) are different things. The tool does not estimate how much each action recovers in yield or money.",
    jogo:"The games use the platform's data, but their scoring, difficulty and basket percentages are for teaching. Use them to understand concepts, not to estimate real losses.",
  },

  sources_title:"The catalog's three sources",
  sources:[
    ["Giannini et al. (2015)","Dependence ratios for commercial crops in Brazil. The source of the article's DRs."],
    ["Klein et al. (2007)","Qualitative dependence classes (from “essential” to “no increase”) for the world's leading crops."],
    ["Siopa et al. (2024)","Experimental observations of crop responses to pollination. Methods and outcomes vary across studies."]
  ],
  states_title:"What each state means",

  method:{
    framework_title:"Four inputs, four indicators",
    framework:"The method is a first-tier economic assessment: it estimates dependence and exposure by crop and region without requiring field measurements of bees. It combines production statistics, export data, published dependence ratios, and standardized service-reduction scenarios.",
    data_title:"Where the data come from",
    data:[
      "Production and production value: Abrafrutas (Brazilian Association of Fruit Producers and Exporters) production panel, 2024.",
      "Exports (volume and revenue): Abrafrutas statistical data platform, 2024. Revenue is already in US dollars.",
      "Production values, reported in thousands of reais, were converted to dollars at the 2024 average rate."
    ],
    conv:"Value in US$ = value in thousand BRL × 1,000 ÷ 5.39",
    dr_title:"Ratios used in the article",
    dr_note:"Source: Giannini et al. (2015), with the international classification of Klein et al. (2007) as context. The conservative ratios define the frozen baseline; the sensitivity ratios only test uncertainty in the lower classes.",
    dr_head:["Crop","Dependence class","DR (baseline)","DR (sensitivity)"],
    dr_rows:[["Melon","Essential","0.95","0.95"],["Watermelon","Essential","0.95","0.95"],["Papaya","Little","0.05","0.25"],["Mango","No increase","0.00","0.05"]],
    scen_title:"Reduction scenarios",
    scen:"The 10%, 25% and 50% reductions are standardized assumptions. Climate and land-use studies document several pathways by which pollinators may be affected, but they differ in insect group, region and time horizon. For that reason no published percentage was used as a forecast for Rio Grande do Norte.",
    limits_title:"What the tool does not do",
    limits:[
      "It does not measure bees, flower visits or pollination deficits in the field: DRs come from the literature.",
      "It does not resolve differences within the state (varieties, management, habitat, managed or wild pollinators).",
      "It does not estimate the return of a specific conservation action.",
      "It does not add production and exports: they are separate accounts.",
      "It does not forecast losses: scenarios are conditional linear tests."
    ],
    glossary_title:"Glossary",
    refs_title:"Key references"
  },
  about_article_title:"Associated article",
  about_article:"The tool accompanies the manuscript “Assessing the Economic Value and Climate-Related Exposure of Pollination Ecosystem Services in Tropical Drylands: A Reproducible Framework and Interactive Tool for Irrigated Fruit Production”, under peer review. The article proposes a reproducible method linking production, exports, pollinator dependence and stress tests, applied to irrigated fruit farming in the semiarid Caatinga of Rio Grande do Norte.",
  about_findings:"Main results of the article (2024)",
  about_list:[
    "Pollination accounted for US$ 175.8 million of production (76.4%) and US$ 165.3 million of exports (84.0%).",
    "Melon and watermelon account for more than 99% of that value.",
    "Hypothetical 10%, 25% and 50% declines expose US$ 17.6 to 87.9 million of production and US$ 16.5 to 82.6 million of exports."
  ]
}
};
window.REFS = [
  ["Giannini, T.C., Cordeiro, G.D., Freitas, B.M., Saraiva, A.M., Imperatriz-Fonseca, V.L., 2015. The dependence of crops for pollinators and the economic value of pollination in Brazil. Journal of Economic Entomology 108, 849–857.",""],
  ["Klein, A.M., Vaissière, B.E., Cane, J.H., Steffan-Dewenter, I., Cunningham, S.A., Kremen, C., Tscharntke, T., 2007. Importance of pollinators in changing landscapes for world crops. Proceedings of the Royal Society B 274, 303–313.","https://doi.org/10.1098/rspb.2006.3721"],
  ["Potts, S.G., Biesmeijer, J.C., Kremen, C., Neumann, P., Schweiger, O., Kunin, W.E., 2010. Global pollinator declines: trends, impacts and drivers. Trends in Ecology & Evolution 25, 345–353.","https://doi.org/10.1016/j.tree.2010.01.007"],
  ["Hanley, N., Breeze, T.D., Ellis, C., Goulson, D., 2015. Measuring the economic value of pollination services: Principles, evidence and knowledge gaps. Ecosystem Services 14, 124–132.","https://doi.org/10.1016/j.ecoser.2014.09.013"],
  ["Millard, J.W. et al., 2023. Key tropical crops at risk from pollinator loss due to climate change and land use. Science Advances 9.","https://doi.org/10.1126/sciadv.adh0756"],
  ["Brander, L. et al., 2024. Economic values for ecosystem services: A global synthesis and way forward. Ecosystem Services 66, 101606.","https://doi.org/10.1016/j.ecoser.2024.101606"],
  ["Walther, F. et al., 2025. Uncertainties in ecosystem services assessments and their implications for decision support. Ecosystem Services 74, 101714.","https://doi.org/10.1016/j.ecoser.2025.101714"]
];
