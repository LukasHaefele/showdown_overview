import React, { useState, useEffect } from 'react';
import PokemonSearch from './components/PokemonSearch';
import PokemonList from './components/PokemonList';
import './styles/App.css';
import { Pokemon } from './types';

const GENERATIONS = [
    { label: 'Gen 1', value: 'gen1' },
    { label: 'Gen 2', value: 'gen2' },
    { label: 'Gen 3', value: 'gen3' },
    { label: 'Gen 4', value: 'gen4' },
    { label: 'Gen 5', value: 'gen5' },
    { label: 'Gen 6', value: 'gen6' },
    { label: 'Gen 7', value: 'gen7' },
    { label: 'Gen 8', value: 'gen8' },
    { label: 'Gen 9', value: 'gen9' },
];

const getRandbatsUrl = (gen: string) =>
    `https://pkmn.github.io/randbats/data/${gen}randombattle.json`;

const App: React.FC = () => {
    const [generation, setGeneration] = useState<string>('gen7');
    const [pokemonData, setPokemonData] = useState<Pokemon[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            const url = getRandbatsUrl(generation);
            const response = await fetch(url);
            const json = await response.json();
            let data: Pokemon[] = [];
            // The JSON is an object with Pokémon names as keys
            if (json && typeof json === 'object' && !Array.isArray(json)) {
                data = Object.entries(json).map(([name, p]: [string, any], idx) => ({
                    id: idx + 1,
                    name,
                    // Fallbacks for missing fields
                    types: p.types || [],
                    abilities: p.abilities || [],
                    stats: p.stats || {},
                    ...p,
                }));
            }
            setPokemonData(data);
        };
        fetchData();
    }, [generation]);

    const filteredPokemon = pokemonData.filter(pokemon =>
        pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="App">
            <h1>Pokémon Showdown Random Battles</h1>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <label htmlFor="generation-select" style={{ marginRight: 8 }}>Generation:</label>
                <select
                    id="generation-select"
                    value={generation}
                    onChange={e => setGeneration(e.target.value)}
                >
                    {GENERATIONS.map(gen => (
                        <option key={gen.value} value={gen.value}>{gen.label}</option>
                    ))}
                </select>
            </div>
            <div className="search-container">
                <PokemonSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />
            </div>
            <PokemonList pokemons={filteredPokemon} />
        </div>
    );
};

export default App;