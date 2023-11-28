var fileResult

function updateGraphic() {
  if (fileResult) {
    createGraphic(fileResult);
  }
}

function readFile() {
  const [file] = document.querySelector("input[type=file]").files;
  const reader = new FileReader();

  reader.addEventListener("load", () => {
    fileResult = reader.result;
    document.getElementById("button-reload").disabled = false;
    createGraphic(fileResult);
  }, false);

  if (file) {
    reader.readAsText(file);
  }
}

// Função para remover pontuações e caracteres especiais
function removerPontuacao(texto) {
  // Substitui dois traços consecutivos por um único traço
  texto = texto.replace(/--/g, ' ');
  // Remove outros caracteres especiais
  return texto.replace(/[.,\/#!$%\^&\*;:{}=\_`~()?«]/g, '').replace(/\s+/g, ' ');
}

// Função para remover padrões específicos
function removerPadraoEspecifico(texto) {
    // Remover "CAPITULO" seguido por números romanos
    return texto.replace(/CAPITULO\s+[IVXLCDM]+/g, '').replace(/\s+/g, ' ');
}

// Função para remover stop words
function removerStopWords(texto) {
  const stopWords = [
    'que', 'em', 'um', 'com', 'não', 'uma', 'os', 'se', 'na', 'por', 'mais', 'as', 'dos',
    'como', 'mas', 'ao', 'ele', 'das', 'à', 'seu', 'sua', 'ou', 'quando', 'muito', 'nos', 'já', 'eu', 'também',
    'só', 'pelo', 'pela', 'até', 'isso', 'ela', 'entre', 'era', 'depois', 'sem', 'mesmo', 'aos', 'ter', 'seus',
    'quem', 'nas', 'me', 'esse', 'eles', 'está', 'você', 'tinha', 'foram', 'essa', 'num', 'nem', 'suas', 'meu',
    'às', 'minha', 'têm', 'numa', 'pelos', 'elas', 'havia', 'seja', 'qual', 'será', 'nós', 'tenho', 'lhe', 'deles',
    'essas', 'esses', 'pelas', 'este', 'fosse', 'dele', 'tu', 'te', 'vocês', 'vos', 'lhes', 'meus', 'minhas', 'teu',
    'tua', 'teus', 'tuas', 'nosso', 'nossa', 'nossos', 'nossas', 'dela', 'delas', 'esta', 'estes', 'estas', 'aquele',
    'aquela', 'aqueles', 'aquelas', 'isto', 'aquilo', 'estou', 'está', 'estamos', 'estão', 'estive', 'esteve', 'estivemos',
    'estiveram', 'estava', 'estávamos', 'estavam', 'estivera', 'estivéramos', 'esteja', 'estejamos', 'estejam', 'estivesse',
    'estivéssemos', 'estivessem', 'estiver', 'estivermos', 'estiverem', 'hei', 'há', 'havemos', 'hão', 'houve', 'houvemos',
    'houveram', 'houvera', 'houvéramos', 'haja', 'hajamos', 'hajam', 'houvesse', 'houvéssemos', 'houvessem', 'houver', 'houvermos',
    'houverem', 'houverei', 'houverá', 'houveremos', 'houverão', 'houveria', 'houveríamos', 'houveriam', 'sou', 'somos', 'são',
    'era', 'éramos', 'eram', 'fui', 'foi', 'fomos', 'foram', 'fora', 'fôramos', 'seja', 'sejamos', 'sejam', 'fosse', 'fôssemos',
    'fossem', 'for', 'formos', 'forem', 'serei', 'será', 'seremos', 'serão', 'seria', 'seríamos', 'seriam', 'tenho', 'tem', 'temos',
    'tém', 'tinha', 'tínhamos', 'tinham', 'tive', 'teve', 'tivemos', 'tiveram', 'tivera', 'tivéramos', 'tenha', 'tenhamos', 'tenham',
    'tivesse', 'tivéssemos', 'tivessem', 'tiver', 'tivermos', 'tiverem', 'terei', 'terá', 'teremos', 'terão', 'teria', 'teríamos', 'teriam'
];
    const palavras = texto.split(/\s+/);
    const resultado = palavras.filter(palavra => !stopWords.includes(palavra.toLowerCase()));
    return resultado.join(' ');
}

// Funcao para encontrar as palavras1 e 2, com base nas palavras de ligacao. 
function extrairOcorrencias(texto, palavrasDeLigacao) {
  const ocorrencias = {};

  // Divide o texto em palavras
  const palavras = texto.split(/\s+/);

  // Percorre as palavras
  for (let i = 0; i < palavras.length - 2; i++) {
    const palavraAtual = palavras[i];
    const proximaPalavra = palavras[i + 1];
    const palavraSeguinte = palavras[i + 2];

    // Verifica se a palavra do meio é uma palavra de ligação
    if (palavrasDeLigacao.includes(proximaPalavra.toLowerCase())) {
      // Guarda a primeira e a terceira palavra
      const palavra1 = palavraAtual;
      const palavra2 = palavraSeguinte;

      // Gera uma chave única para identificar a ocorrência
      const chaveOcorrencia = `${palavra1}_${palavra2}`;

      // Verifica se já existe uma ocorrência com esse par de palavras
      if (ocorrencias[chaveOcorrencia]) {
        // Incrementa o número de ocorrências
        ocorrencias[chaveOcorrencia]++;
      } else {
        // Adiciona uma nova ocorrência ao objeto
        ocorrencias[chaveOcorrencia] = 1;
      }
    }
  }

  // Converte o objeto de ocorrências para um array
  const resultado = Object.keys(ocorrencias).map((chave) => {
    const [palavra1, palavra2] = chave.split('_');
    const ocorrenciasCount = ocorrencias[chave];

    return { source: palavra1, target: palavra2, value: ocorrenciasCount };
  });

  return resultado;
}

// Função para filtrar linhas com palavras de ligacao e maiores que determinada ocorrencia
function filtrarLinhas(tabela, palavrasDeLigacao, minOcorrencias) {
  // Filtrar tanto pela coluna palavra1 quanto pela coluna palavra2
  const resultadoFinal = tabela.filter((linha) => {
    const palavra1NaoEhLigacao = !palavrasDeLigacao.includes(linha.source.toLowerCase());
    const palavra2NaoEhLigacao = !palavrasDeLigacao.includes(linha.target.toLowerCase());

    // Retorna true apenas se ambas as palavras não forem de ligação e são diferentes
    return palavra1NaoEhLigacao && palavra2NaoEhLigacao && linha.source.toLowerCase() !== linha.target.toLowerCase();
  })
  .filter((linha) => linha.value > minOcorrencias);

  return resultadoFinal;
}

//Função para criar tabela de frequencias 
function criarTabelaFrequencia(texto) {
  const palavras = texto.split(/\s+/);

  // Cria um objeto para armazenar a contagem de palavras
  const frequencia = {};

  // Percorre as palavras
  palavras.forEach((palavra) => {
    // Converte a palavra para minúsculas
    const palavraLowerCase = palavra.toLowerCase();

    // Se a palavra já existe no objeto de frequência, incrementa o contador
    if (frequencia[palavraLowerCase]) {
      frequencia[palavraLowerCase]++;
    } else {
      // Se a palavra não existe, inicializa o contador com 1
      frequencia[palavraLowerCase] = 1;
    }
  });



  // Converte o objeto de frequência para um array de objetos
  const tabelaFrequencia = Object.keys(frequencia).map((palavra) => ({
    id: palavra,
    group: frequencia[palavra],
  }));

  return tabelaFrequencia;
}


// Função para analisar se tem equivalente inverso e se é maior 

function analisarTabelaResultado(tabela) {
  // Adiciona uma nova coluna chamada 'inverso_maior'
  const resultado2 = tabela.map((linha) => {
    // Inverte as palavras da linha
    const inverso = `${linha.palavra2} ${linha.palavra1}`;

    // Procura o inverso na tabela original
    const linhaInversa = tabela.find((item) => item.palavra1 === inverso.split(' ')[0] && item.palavra2 === inverso.split(' ')[1]);

    // Verifica se a linha inversa existe e compara as ocorrências
    if (linhaInversa) {
      // Se o inverso tem mais ocorrências, atribui 1; senão, atribui 0
      linha.inverso_maior = linha.ocorrencias > linhaInversa.ocorrencias ? 1 : 0;
    } else {
      // Se não houver inverso, atribui 0
      linha.inverso_maior = 0;
    }

    return linha;
  });

  return resultado2;
}

// Leitura do arquivo
function createGraphic(data) {
  d3.select("svg").selectAll("*").remove();
  let palavrasLigacao = document.getElementById("separadores").value;
    if (palavrasLigacao) {
      palavrasLigacao = palavrasLigacao.replace(/\s/g, "").split(",")
    }
  const minOcorrencias = 1;

  // Remover pontuações, caracteres especiais e «
  const textoSemCaracteresEspeciais = removerPontuacao(data);

  // Remover padrões específicos
  const textoSemPadrao = removerPadraoEspecifico(textoSemCaracteresEspeciais);

  // Aplicar remoção de stop words
  const textoSemStopWords = removerStopWords(textoSemPadrao);


  // Faz o parse, e identifica ocorrencias.
  const resultado = extrairOcorrencias(textoSemStopWords, palavrasLigacao);


  // Filtrar para remover palavras de ligacao, devido a composição "e a"
  const tabelaFiltrada = filtrarLinhas(resultado, palavrasLigacao, minOcorrencias);


  // Criar tabela de frequencias de palavras
  const tabelaFrequencia = criarTabelaFrequencia(textoSemPadrao);

  const finalLinks = []
  const finalNodes = []
  const finalWords = []

  tabelaFrequencia.forEach(i => {
    const found = tabelaFiltrada.find(link => {
      return i.id === link.target || i.id === link.source
    })

    if (found) {
      finalWords.push(i.id)
      finalNodes.push(i)
    }
  })

  tabelaFiltrada.forEach(r => {
    if (finalWords.indexOf(r.source) >= 5 && finalWords.indexOf(r.target) >= 5) {
      finalLinks.push(r)
    }
  })

  const graph = {
    nodes: finalNodes,
    links: finalLinks
  }
  var svg = d3.select("svg"),
    width = 1800, // Defina a largura desejada
    height = 2500;

  svg.attr("width", width)
      .attr("height", height);

  var color = d3.scaleOrdinal(d3.schemeCategory20);

  var simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(function(d) { return d.id; }))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2));



    // Define as setas 
  svg.append("defs").append("marker")
      .attr("id", "arrowhead")
      .attr("refX", 6) // Ajusta o tamanho das setas
      .attr("refY", 2)
      .attr("markerWidth", 6)
      .attr("markerHeight", 4)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,0 L6,2 L0,4")
      .attr("fill", "#000");

    var link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
        .attr("stroke-width", function(d) { return Math.sqrt(d.value); })
        .attr("marker-end", "url(#arrowhead)");

    var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(graph.nodes)
        .enter().append("g")

    node.append("circle")
        .attr("fill", function(d) { return color(d.group); })
        .data(graph.links)
        .attr("r", function(d) { return d.value * 2; });

    // Crie um manipulador de arrastar e adicione-o ao objeto de nó
    var drag_handler = d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);

    drag_handler(node);

    var lables = node.append("text")
        .text(function(d) {
          return d.id;
        })
        .attr('x', 6)
        .attr('y', 3);

    node.append("title")
        .text(function(d) { return d.id; });

    simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(graph.links);

    function ticked() {
      link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
    
      // Adicione as setas nas extremidades das linhas
      link.attr("marker-end", "url(#arrowhead)");
    
      // Posiciona os nós no gráfico
      node
        .attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")";
        });
    }

  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
}