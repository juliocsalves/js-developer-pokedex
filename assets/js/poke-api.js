const pokeApi = {};

alert('chegou aqui');
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

pokeApi.getPokemons = (offset = 0, limit = 5) => {    
    const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;
    if (url){
        console.log(url);
    } else {
        console.log('vazio');
    }
    return fetch(url)
        .then(response => response.json())
        .then(jsonBody => jsonBody.results)
        .then(pokemons => pokemons.map(pokeApi.getPokemonDetail))
        .then(detailRequests => Promise.all(detailRequests))
        .then(pokemonsDetails => pokemonsDetails);
};





