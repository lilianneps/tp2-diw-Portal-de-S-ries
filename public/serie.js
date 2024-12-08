const apiKey = "aed3f2cb958dbea6abd7fd63b2cf89be";
const apiBaseUrl = "https://api.themoviedb.org/3";
const imageBaseUrl = "https://image.tmdb.org/t/p/w500";
const defaultAvatar = "imagens/default-poster.jpg"; // Caminho para imagem padrão caso o perfil não tenha foto

// Função para buscar detalhes da série pelo ID
async function buscarDetalhesSerie(id) {
  try {
    const resposta = await fetch(
      `${apiBaseUrl}/tv/${id}?api_key=${apiKey}&language=pt-BR`
    );
    if (!resposta.ok) {
      console.error(
        `Erro na requisição: ${resposta.status} - ${resposta.statusText}`
      );
      throw new Error("Erro ao buscar detalhes da série");
    }
    const serie = await resposta.json();
    console.log(serie);
    return serie;
  } catch (erro) {
    console.error("Erro:", erro);
    return null;
  }
}

// Função para buscar elenco da série pelo ID
async function buscarElencoSerie(id) {
  try {
    const resposta = await fetch(
      `${apiBaseUrl}/tv/${id}/credits?api_key=${apiKey}&language=pt-BR`
    );
    if (!resposta.ok) {
      throw new Error("Erro ao buscar elenco da série");
    }
    const dados = await resposta.json();
    return dados.cast;
  } catch (erro) {
    console.error("Erro:", erro);
    return [];
  }
}

// Função para exibir detalhes da série
async function exibirDetalhesSerie() {
  const parametros = new URLSearchParams(window.location.search);
  const idSerie = parametros.get("id");
  if (!idSerie) {
    console.error("ID da série não foi fornecido");
    return;
  }

  const serie = await buscarDetalhesSerie(idSerie);
  if (!serie) {
    console.error("Série não encontrada");
    return;
  }

  document.getElementById("poster").src = serie.poster_path
    ? `${imageBaseUrl}${serie.poster_path}`
    : defaultAvatar;
  document.getElementById("titulo").textContent = serie.name;
  document.getElementById("descricao").textContent =
    serie.overview || "Sem descrição disponível.";
  document.getElementById("data-lancamento").textContent = serie.first_air_date;
  document.getElementById("genero").textContent = serie.genres
    .map((genero) => genero.name)
    .join(", ");
  document.getElementById("nota").textContent = serie.vote_average;

  // Adicionar evento ao botão de favoritar
  const botaoFavoritar = document.getElementById("favoriteButton");
  botaoFavoritar.addEventListener("click", () => addToFavorites(idSerie));

  // Exibir elenco da série
  const elenco = await buscarElencoSerie(idSerie);
  exibirElenco(elenco);
}

// Função para exibir o elenco da série
function exibirElenco(elenco) {
  const areaElenco = document.getElementById("elenco-cards");
  areaElenco.innerHTML = ""; // Limpar conteúdo anterior

  const row = document.createElement("div");
  row.className = "row row-cols-1 row-cols-md-4 g-4"; // Configuração para um passador horizontal

  elenco.slice(0, 10).forEach((membro) => {
    // Mostrar até 10 membros do elenco
    const imagem = membro.profile_path
      ? `${imageBaseUrl}${membro.profile_path}`
      : defaultAvatar; // Usar imagem padrão se não houver profile_path

    const cardElenco = document.createElement("div");
    cardElenco.className = "col";
    cardElenco.style.transform = "scale(0.8)"; // Reduz o tamanho dos cards para metade
    cardElenco.innerHTML = `
              <div class="card h-100 text-white bg-dark border border-3">
                  <img src="${imagem}" class="card-img-top" alt="${
      membro.name
    }">
                  <div class="card-body">
                      <h5 class="card-title">${membro.name}</h5>
                      <p class="card-text">${
                        membro.character || "Personagem não informado"
                      }</p>
                  </div>
              </div>
          `;
    row.appendChild(cardElenco);
  });

  areaElenco.appendChild(row);
}

async function addToFavorites(serieId) {
  try {
    const serie = await buscarDetalhesSerie(serieId);
    if (!serie) {
      console.error("Erro ao buscar detalhes");
      return;
    }

    // Objeto com os dados da série selecionada
    const novaSerie = {
      id: serie.id,
      nome: serie.name || serie.original_name,
      poster: `https://image.tmdb.org/t/p/w500${serie.poster_path}`,
      descricao: serie.overview || "Descrição não disponível",
    };

    // POST para adicionar série ao db.json
    const res = await fetch("http://localhost:8888/favoritos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(novaSerie),
    });

    if (!res.ok) {
      throw new Error(
        "Erro ao adicionar a série aos favoritos: " + res.statusText
      );
    }

    alert("Série adicionada aos favoritos");
  } catch (err) {
    console.error("Erro ao adicionar a série: ", err);
  }
}

document.addEventListener("DOMContentLoaded", exibirDetalhesSerie);
