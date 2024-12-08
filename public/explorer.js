const apiKey = 'aed3f2cb958dbea6abd7fd63b2cf89be';
const apiBaseUrl = 'https://api.themoviedb.org/3';
const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

// Função para buscar séries por nome
async function fetchTVShowsByName(name) {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&language=pt-BR&query=${name}`);
        if (!response.ok) {
            throw new Error('Erro ao buscar dados da API');
        }
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Erro ao buscar séries por nome:', error);
        return [];
    }
}

// Função para exibir resultados de busca como cards
async function displaySearchResults(query) {
    const resultsContainer = document.getElementById('movies-container');
    if (!resultsContainer) {
        console.error('Contêiner para exibição de resultados não encontrado');
        return;
    }

    // Limpa os resultados anteriores
    resultsContainer.innerHTML = '';

    const shows = await fetchTVShowsByName(query);
    if (shows.length === 0) {
        resultsContainer.innerHTML = '<p class="text-danger">Nenhuma série encontrada.</p>';
        return;
    }

    // Cria os cards para cada série encontrada
    shows.forEach(show => {
        const id = show.id;
        const description = show.overview || 'Sem descrição disponível.';
        const shortDescription = description.length > 100 ? description.substring(0, 100) + '...' : description;

        const showElement = document.createElement('div');
        showElement.className = 'col';
        showElement.innerHTML = `
            <div class="card .bg-secondary">
                <img src="https://image.tmdb.org/t/p/w500${show.poster_path}" class="card-img-top" alt="${show.name}">
                <div class="card-body text-white bg-dark">
                    <h5 class="card-title">${show.name}</h5>
                    <p class="card-text">${shortDescription} </p>
                </div>
                <a href="serie.html?id=${id}" class="btn btn-secondary">Mais Detalhes</a>
            </div>
        `;
        resultsContainer.appendChild(showElement);
    });
}


// Função de busca para capturar o input e exibir os resultados
async function searchSeries(event) {
    event.preventDefault();
    const query = document.getElementById('search-input').value.trim();
    if (query === '') {
        alert('Por favor, digite o nome da série que deseja buscar.');
        return;
    }
    await displaySearchResults(query);
}

// Adiciona o ouvinte de evento ao formulário de pesquisa
document.getElementById('search-form').addEventListener('submit', searchSeries);
