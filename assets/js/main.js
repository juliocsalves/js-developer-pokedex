const pokemonList = document.getElementById('pokemonList');
const loadMoreButton = document.getElementById('loadMoreButton');

const maxRecords = 151;
const limit = 12;
let offset = 0;

function togglePokemonExpand(event) {
    const listItem = event.target.closest(".pokemon");
    if (listItem) {
        listItem.classList.toggle("extended");
    }
}

function convertPokemonToLi(pokemon) {
    return `
        <li class="pokemon ${pokemon.type}">
            <span class="number">#${pokemon.number}</span>
            <span class="name">${pokemon.name}</span>

            <div class="detail">
                <ol class="types">
                    ${pokemon.types.map(type => `<li class="type ${type}">${type}</li>`).join('')}
                </ol>

                <img src="${pokemon.photo}" alt="${pokemon.name}" class="pokemon-image">
            </div>

            <div class="abilities">
                <h4>Abilities:</h4>
                <ul>
                    ${pokemon.abilities.map(ability => `
                        <li>
                            <strong>${ability.name}</strong>: ${ability.effect} 
                            <br>
                            <em>${ability.flavor}</em>
                        </li>
                    `).join('')}
                </ul>
            </div>
        </li>
    `;
}


function loadPokemonItens(offset, limit) {
    pokeApi.getPokemons(offset, limit).then((pokemons = []) => {
        const newHtml = pokemons.map(convertPokemonToLi).join('');
        pokemonList.innerHTML += newHtml;
        attachClickEventToImages(); // Garante que os eventos de clique sejam adicionados após o carregamento
    });
}

function attachClickEventToImages() {
    document.querySelectorAll('.pokemon .detail img').forEach(img => {
        img.removeEventListener('click', togglePokemonExpand); // Evita eventos duplicados
        img.addEventListener('click', togglePokemonExpand);
    });
}

function togglePokemonExpand(event) {
    const pokemonItem = event.target.closest('.pokemon'); // Obtém o elemento pai <li class="pokemon">
    pokemonItem.classList.toggle('extended'); // Alterna a classe "extended"
}

loadPokemonItens(offset, limit);

loadMoreButton.addEventListener('click', () => {
    offset += limit;
    const qtdRecordsWithNexPage = offset + limit;

    if (qtdRecordsWithNexPage >= maxRecords) {
        const newLimit = maxRecords - offset;
        loadPokemonItens(offset, newLimit);
        loadMoreButton.parentElement.removeChild(loadMoreButton);
    } else {
        loadPokemonItens(offset, limit);
    }
});
