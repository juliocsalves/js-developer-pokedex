const pokeApi = {};

function convertPokeApiDetailToPokemon(pokeDetail) {
    const pokemon = new Pokemon();
    pokemon.number = pokeDetail.id;
    pokemon.name = pokeDetail.name;

    const types = pokeDetail.types.map((typeSlot) => typeSlot.type.name);
    const [type] = types;

    pokemon.types = types;
    pokemon.type = type;
    pokemon.photo = pokeDetail.sprites.other.dream_world.front_default;

    // Buscar habilidades (abilities) e obter detalhes delas
    const abilityRequests = pokeDetail.abilities.map(abilityInfo =>
        fetch(abilityInfo.ability.url)
            .then(response => response.json())
            .then(abilityDetail => {
                const effect = abilityDetail.effect_entries.find(e => e.language.name === "en")?.effect || "No effect available.";
                const flavor = abilityDetail.flavor_text_entries.find(f => f.language.name === "en")?.flavor_text || "No description.";
                return { name: abilityInfo.ability.name, effect, flavor };
            })
    );

    return Promise.all(abilityRequests).then(abilities => {
        pokemon.abilities = abilities;
        return pokemon;
    });
}

pokeApi.getPokemonDetail = (pokemon) => {
    return fetch(pokemon.url)
        .then(response => response.json())
        .then(convertPokeApiDetailToPokemon);
};

// pokeApi.getPokemons = (offset = 0, limit = 5) => {
//     const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;

//     return fetch(url)
//         .then(response => response.json())
//         .then(jsonBody => jsonBody.results)
//         .then(pokemons => pokemons.map(pokeApi.getPokemonDetail))
//         .then(detailRequests => Promise.all(detailRequests))
//         .then(pokemonsDetails => pokemonsDetails);
// };


pokeApi.getPokemons = async (offset = 0, limit = 5) => {
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';
    const url = `${corsProxy}https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erro ao buscar lista de Pokémons: ${response.status}`);
        }

        const data = await response.json();

        const detailPromises = data.results.map(pokemon => pokeApi.getPokemonDetail(pokemon));
        const pokemonsDetails = await Promise.all(detailPromises);

        return pokemonsDetails.filter(p => p); // remove os nulos em caso de falha
    } catch (error) {
        console.error("Erro ao carregar Pokémons:", error);
        return [];
    }
};
