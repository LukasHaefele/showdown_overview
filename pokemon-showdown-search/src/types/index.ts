export interface Pokemon {
    id?: number;
    name: string;
    types: string[];
    abilities: string[];
    stats: {
        hp: number;
        attack: number;
        defense: number;
        specialAttack: number;
        specialDefense: number;
        speed: number;
    };
}

export interface SearchProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
}

export interface PokemonListProps {
    pokemons: Pokemon[];
}