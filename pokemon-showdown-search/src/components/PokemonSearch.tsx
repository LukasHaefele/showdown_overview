import React from 'react';
import { SearchProps } from '../types';

const PokemonSearch: React.FC<SearchProps> = ({ searchTerm, onSearchChange }) => {
    return (
        <input
            className="search-input"
            type="text"
            placeholder="Search for a Pokémon..."
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
        />
    );
};

export default PokemonSearch;