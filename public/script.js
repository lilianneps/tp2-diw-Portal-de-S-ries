document.addEventListener("DOMContentLoaded", () => {
  const apiKey = "aed3f2cb958dbea6abd7fd63b2cf89be";
  const apiBaseUrl = "https://api.themoviedb.org/3";
  const imageBaseUrl = "https://image.tmdb.org/t/p/w500";

  exibirInfoAutor();
  carregarSeriesPopulares();
  loadNewSeriesCards();
  loadFavorites();
});

// Capturando os botões de remover para chamar a função de exclusão
document.querySelectorAll(".remove-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const seriesId = e.target.getAttribute("data-id");
    removeShowFromFavorites(seriesId);
  });
});

// Função para exibir informações do autor
async function exibirInfoAutor() {
  try {
    const resposta = await fetch("http://localhost:8888/autor");
    if (!resposta.ok) throw new Error("Erro ao buscar dados do autor");

    const autor = await resposta.json();
    document.getElementById("author-name").textContent =
      autor.nome || "Não disponível";
    document.getElementById("author-avatar").src = autor.foto;
    document.getElementById("author-minibio").textContent =
      autor.bio || "Não disponível";
    document.getElementById("author-curso").textContent =
      autor.curso || "Não disponível";
    document.getElementById("author-turma").textContent =
      autor.turma || "Não disponível";

    const authorSocials = document.getElementById("author-socials");
    authorSocials.innerHTML = ""; // Limpa o conteúdo anterior

    // Mapeamento de redes sociais para ícones Font Awesome
    const socialIcons = {
      facebook: "fab fa-facebook",
      instagram: "fab fa-instagram",
      twitter: "fab fa-twitter",
      linkedin: "fab fa-linkedin",
      github: "fab fa-github",
    };

    if (autor.redeSociais) {
      Object.entries(autor.redeSociais).forEach(([key, url]) => {
        const socialLink = document.createElement("li");

        // Adiciona o ícone correspondente à rede social
        const iconClass = socialIcons[key.toLowerCase()] || "fas fa-link";

        socialLink.innerHTML = `
          <a href="${url}" target="_blank">
            <i class="${iconClass}"></i> ${key}
          </a>
        `;
        authorSocials.appendChild(socialLink);
      });
    }
  } catch (erro) {
    console.error("Erro ao exibir informações do autor:", erro);
  }
}


// Função para carregar séries populares
function carregarSeriesPopulares() {
  const apiKey = "aed3f2cb958dbea6abd7fd63b2cf89be";
  const apiBaseUrl = "https://api.themoviedb.org/3";
  const imageBaseUrl = "https://image.tmdb.org/t/p/w500";
  const url = `${apiBaseUrl}/tv/popular?api_key=${apiKey}&language=pt-BR`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const series = data.results.slice(1, 8);
      const carouselInner = document.getElementById("carousel-inner");
      const carouselIndicators = document.getElementById("carousel-indicators");
      carouselInner.innerHTML = ""; // Limpa o carrossel
      carouselIndicators.innerHTML = ""; // Limpa os indicadores

      series.forEach((serie, index) => {
        const itemDiv = document.createElement("div");
        itemDiv.classList.add("carousel-item");
        if (index === 0) itemDiv.classList.add("active");

        const img = document.createElement("img");
        img.src = `${imageBaseUrl}${serie.backdrop_path}`;
        img.classList.add("d-block", "w-100", "carousel-image");
        img.alt = serie.name;
        img.setAttribute("data-serie-id", serie.id);

        const captionDiv = document.createElement("div");
        captionDiv.classList.add("carousel-caption", "d-none", "d-md-block");
        const h5 = document.createElement("h5");
        h5.textContent = serie.name;
        const p = document.createElement("p");
        p.textContent = serie.overview;

        captionDiv.appendChild(h5);
        captionDiv.appendChild(p);
        itemDiv.appendChild(img);
        itemDiv.appendChild(captionDiv);
        carouselInner.appendChild(itemDiv);

        const indicatorButton = document.createElement("button");
        indicatorButton.type = "button";
        indicatorButton.setAttribute(
          "data-bs-target",
          "#carouselExampleCaptions"
        );
        indicatorButton.setAttribute("data-bs-slide-to", index);
        if (index === 0) indicatorButton.classList.add("active");
        indicatorButton.setAttribute("aria-label", `Slide ${index + 1}`);
        carouselIndicators.appendChild(indicatorButton);
      });

      configurarCarrosselParaRedirecionar();
    })
    .catch((error) => console.error("Erro ao buscar os dados:", error));
}

// Função para redirecionar ao clicar nas imagens do carrossel
function configurarCarrosselParaRedirecionar() {
  const imagensCarrossel = document.querySelectorAll(".carousel-image");
  imagensCarrossel.forEach((imagem) => {
    imagem.addEventListener("click", () => {
      const serieId = imagem.getAttribute("data-serie-id");
      if (serieId) {
        window.location.href = `serie.html?id=${serieId}`;
      }
    });
  });
}

// Função para carregar novas séries
async function loadNewSeriesCards() {
  const apiKey = "aed3f2cb958dbea6abd7fd63b2cf89be";
  const apiBaseUrl = "https://api.themoviedb.org/3";
  const imageBaseUrl = "https://image.tmdb.org/t/p/w500";

  try {
    const response = await fetch(
      `${apiBaseUrl}/tv/on_the_air?api_key=${apiKey}&language=pt-BR`
    );
    const data = await response.json();
    const newSeriesContainer = document.getElementById("new-series");
    newSeriesContainer.innerHTML = "";

    data.results
      .filter((series) => {
        const releaseDate = new Date(series.first_air_date);
        const today = new Date();
        return (today - releaseDate) / (1000 * 60 * 60 * 24) <= 90;
      })
      .forEach((series) => {
        const cardHTML = `
                    <div class="col">
                        <div class="card">
                            <a href="serie.html?id=${series.id}">
                                <img src="${imageBaseUrl}${
          series.poster_path
        }" class="card-img-top" alt="Lançamento - ${series.name}">
                            </a>
                            <div class="card-body text-white bg-dark">
                                <h5 class="card-title">${series.name}</h5>
                                <p class="card-text series-card-text">${
                                  series.overview || "Descrição não disponível."
                                }</p>
                            </div>
                        </div>
                    </div>`;
        newSeriesContainer.innerHTML += cardHTML;
      });
  } catch (error) {
    console.error("Erro ao carregar novas séries:", error);
  }
}

// Carregar séries favoritas no index.html/home
export async function loadFavorites() {
  try {
    const res = await fetch("http://localhost:8888/favoritos");

    if (!res.ok) {
      throw new Error("Erro ao carregar os favoritos: " + response.statusText);
    }
    console.log(res);

    const data = await res.json();

    const favoritesContainer = document.getElementById("favorites");

    if (!favoritesContainer) return;

    favoritesContainer.innerHTML = "";

    if (data.length === 0) {
      favoritesContainer.innerHTML =
        "<p class='tx text-light'>Você ainda não marcou nenhuma série como favorita.</p>";
      return;
    }

    console.log(data);

    data.forEach((series) => {
      const cardHTML = `
                  <div class="col">
                    <div class="card" style="position: relative">
                      <button class="btn btn-danger remove-btn" data-id="${
                        series.id
                      }">
                        Remover
                      </button>
                      <a href="serie.html?id=${series.id}">
                        <img src="${
                          series.poster
                        }" class="card-img-top" alt="Lançamento - ${
        series.nome
      }">
                      </a>
                      <div class="card-body">
                        <h5 class="card-title">${series.nome}</h5>
                        <p class="card-text">${
                          series.descricao || "Descrição não disponível."
                        }</p>
                      </div>
                    </div>
                  </div>`;
      favoritesContainer.innerHTML += cardHTML;
      favoritesContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("remove-btn")) {
          const seriesId = e.target.getAttribute("data-id");
          removeShowFromFavorites(seriesId);
        }
      });
    });
  } catch (err) {
    console.error("Erro ao carregar favoritos:", err);
  }
}

async function removeShowFromFavorites(showId) {
  try {
    const res = await fetch(`http://localhost:8888/favoritos/${showId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Erro ao remover a série dos favoritos" + res.statusText);
    }

    alert("Série removida dos favoritos.");

    loadFavorites();
  } catch (err) {
    console.error("Erro ao remover a série: ", err);
  }
}
