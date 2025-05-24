import React, { useState } from 'react';
import { PokemonListProps } from '../types';
import showdownDataset from '../data/showdown-dataset.json';

// Helper to capitalize keys
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Helper to filter out EVs and IVs keys
const filterEVsIVs = (obj: any) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    const filtered: any = Array.isArray(obj) ? [] : {};
    for (const [k, v] of Object.entries(obj)) {
        if (k.toLowerCase() === 'evs' || k.toLowerCase() === 'ivs') continue;
        filtered[k] = typeof v === 'object' && v !== null ? filterEVsIVs(v) : v;
    }
    return filtered;
};

// Stat calculation helpers
function calcHP(base: number, level: number, iv: number, ev: number) {
    return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
}
function calcStat(base: number, level: number, iv: number, ev: number, nature: number) {
    return Math.floor((Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5) * nature);
}

// Get base stats from showdown-dataset.json
const getBaseStats = (pokemon: any) => {
    // Find by English name (case-insensitive)
    const entry = (showdownDataset as any[]).find(
        (p) => p.name && p.name.english && pokemon.name &&
            p.name.english.toLowerCase() === pokemon.name.toLowerCase()
    );
    if (entry && entry.base) {
        const b = entry.base;
        return {
            hp: b['HP'],
            atk: b['Attack'],
            def: b['Defense'],
            spa: b['Sp. Attack'],
            spd: b['Sp. Defense'],
            spe: b['Speed'],
        };
    }
    return null;
};

const getRoleStatHints = (pokemon: any, stat: string) => {
    // Try to infer likely stat focus from roles or items
    // For now, just check if the role name or moves mention "Attacker", "Defender", "Sweeper", etc.
    if (!pokemon.roles) return '';
    const statMap: Record<string, string[]> = {
        atk: ['physical', 'attacker', 'sweeper'],
        spa: ['special', 'sp. atk', 'spa'],
        def: ['defense', 'defender', 'wall'],
        spd: ['sp. def', 'spd'],
        spe: ['speed', 'fast', 'sweeper'],
        hp: ['bulky', 'tank', 'wall', 'hp'],
    };
    const statKey = stat.toLowerCase();
    for (const [roleName, roleData] of Object.entries(pokemon.roles)) {
        const role = roleName.toLowerCase();
        if (statMap[statKey]?.some(hint => role.includes(hint))) {
            return 'likely';
        }
        // Check moves for hints (optional, can be expanded)
        if (roleData && Array.isArray((roleData as any).moves)) {
            const moves = (roleData as any).moves.map((m: string) => m.toLowerCase());
            if (
                statKey === 'atk' &&
                moves.some((m: string) => ['earthquake', 'return', 'body slam'].some(pm => m.includes(pm)))
            )
                return 'likely';
            if (
                statKey === 'spa' &&
                moves.some((m: string) => ['thunderbolt', 'ice beam', 'flamethrower'].some(pm => m.includes(pm)))
            )
                return 'likely';
        }
    }
    return '';
};

const renderStatsWithCalc = (pokemon: any) => {
    const baseStats = getBaseStats(pokemon);
    const level = pokemon.level || 100;
    if (
        !baseStats ||
        [baseStats.hp, baseStats.atk, baseStats.def, baseStats.spa, baseStats.spd, baseStats.spe].some(
            v => typeof v !== 'number' || isNaN(v)
        )
    ) {
        return (
            <div style={{
                background: '#f8f8f8',
                borderRadius: 8,
                padding: '12px 16px',
                margin: '8px 0 12px 0',
                fontSize: 15,
                overflowX: 'auto',
                border: '1px solid #e0e0e0',
                // Hide scrollbar
                scrollbarWidth: 'none'
            }}>
                <style>
                    {`
                    /* Hide scrollbar for Webkit browsers */
                    div[style*="overflow-x: auto"]::-webkit-scrollbar {
                        display: none;
                        width: 0;
                        height: 0;
                        background: transparent;
                    }
                    /* Hide scrollbar for Firefox */
                    div[style*="overflow-x: auto"] {
                        scrollbar-width: none !important;
                    }
                    `}
                </style>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Base Stats & Calculated (Lv {level}):</div>
                Base stats not available for this Pokémon.
            </div>
        );
    }

    const statColors: Record<string, string> = {
        hp: '#e57373',
        atk: '#f57c00',
        def: '#64b5f6',
        spa: '#ba68c8',
        spd: '#81c784',
        spe: '#ffd54f',
    };

    const statLabels: Record<string, string> = {
        hp: 'HP',
        atk: 'Attack',
        def: 'Defense',
        spa: 'Sp. Atk',
        spd: 'Sp. Def',
        spe: 'Speed',
    };

    // Stat min/max calculation
    // Min: IV=31, EV=0, nature=0.9 (hindering)
    // Max: IV=31, EV=252, nature=1.1 (beneficial)
    // HP: nature is always 1.0
    const statRows = (['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as const).map(stat => {
        let min, max;
        if (stat === 'hp') {
            min = calcHP(baseStats.hp, level, 31, 0);
            max = calcHP(baseStats.hp, level, 31, 252);
        } else {
            min = calcStat(baseStats[stat], level, 31, 0, 0.9);
            max = calcStat(baseStats[stat], level, 31, 252, 1.1);
        }
        const likely = getRoleStatHints(pokemon, stat);
        return { stat, min, max, likely };
    });

    return (
        <div style={{
            background: '#f8f8f8',
            borderRadius: 8,
            padding: '12px 16px',
            margin: '8px 0 12px 0',
            fontSize: 15,
            overflowX: 'auto',
            border: '1px solid #e0e0e0',
            // Custom scrollbar styles
            scrollbarWidth: 'thin',
            scrollbarColor: '#90caf9 #f8f8f8'
        }}>
            <style>
                {`
                /* Webkit scrollbar styling */
                div[style*="overflow-x: auto"]::-webkit-scrollbar {
                    height: 8px;
                    background: #f8f8f8;
                    border-radius: 8px;
                }
                div[style*="overflow-x: auto"]::-webkit-scrollbar-thumb {
                    background: #90caf9;
                    border-radius: 8px;
                }
                div[style*="overflow-x: auto"]::-webkit-scrollbar-thumb:hover {
                    background: #42a5f5;
                }
                div[style*="overflow-x: auto"]::-webkit-scrollbar-button {
                    display: none;
                    height: 0;
                    width: 0;
                }
                `}
            </style>
            <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 16, letterSpacing: 0.5 }}>
                Base Stats & Possible Stat Range (Lv {level})
            </div>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: 'left', padding: '4px 8px', fontWeight: 500, color: '#666' }}>Stat</th>
                        <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: 500, color: '#666' }}>Base</th>
                        <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: 500, color: '#666' }}>Min</th>
                        <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: 500, color: '#666' }}>Max</th>
                        <th style={{ textAlign: 'center', padding: '4px 8px', fontWeight: 500, color: '#666' }}>Likely</th>
                    </tr>
                </thead>
                <tbody>
                    {statRows.map(({ stat, min, max, likely }) => (
                        <tr key={stat}>
                            <td style={{
                                textAlign: 'left',
                                padding: '4px 8px',
                                fontWeight: 500,
                                color: statColors[stat]
                            }}>
                                {statLabels[stat]}
                            </td>
                            <td style={{
                                textAlign: 'right',
                                padding: '4px 8px',
                                fontFamily: 'monospace',
                                background: '#fff'
                            }}>
                                {baseStats[stat]}
                            </td>
                            <td style={{
                                textAlign: 'right',
                                padding: '4px 8px',
                                fontFamily: 'monospace',
                                background: '#f5f5f5'
                            }}>
                                {min}
                            </td>
                            <td style={{
                                textAlign: 'right',
                                padding: '4px 8px',
                                fontFamily: 'monospace',
                                background: '#f5f5f5'
                            }}>
                                {max}
                            </td>
                            <td style={{
                                textAlign: 'center',
                                padding: '4px 8px',
                                fontFamily: 'monospace',
                                background: likely ? '#e3fcec' : '#fff',
                                color: likely ? '#388e3c' : '#888'
                            }}>
                                {likely ? '↑' : ''}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                Min/Max: possible stat at Lv {level} (Min: IV=31, EV=0, hindering nature; Max: IV=31, EV=252, beneficial nature).
                <span style={{ marginLeft: 8, color: '#388e3c' }}>↑</span> = Stat is likely maximized for this Pokémon's role.
            </div>
        </div>
    );
};

const renderValue = (value: any, key?: string, pokemon?: any) => {
    if (key === 'roles' && typeof value === 'object' && value !== null) {
        // Special rendering for roles
        return (
            <div>
                {Object.entries(value).map(([roleName, roleData]: [string, any]) => (
                    <div
                        key={roleName}
                        style={{
                            background: '#e3f0ff',
                            border: '1px solid #90caf9',
                            borderRadius: 6,
                            padding: '10px 14px',
                            margin: '10px 0',
                        }}
                    >
                        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>
                            {roleName}
                        </div>
                        {Object.entries(roleData)
                            .filter(([k]) => k.toLowerCase() !== 'evs' && k.toLowerCase() !== 'ivs')
                            .map(([k, v]) => (
                                <div key={k} style={{ marginBottom: 4 }}>
                                    <strong>{capitalize(k)}:</strong>{' '}
                                    {typeof v === 'object'
                                        ? renderValue(v)
                                        : String(v)}
                                </div>
                            ))}
                    </div>
                ))}
            </div>
        );
    } else if (key === 'stats' && typeof value === 'object' && value !== null) {
        // Show stats block with calculations
        return renderStatsWithCalc(pokemon);
    } else if (Array.isArray(value)) {
        return (
            <ul style={{ margin: '4px 0 4px 16px', padding: 0 }}>
                {value.map((v, i) => (
                    <li key={i} style={{ listStyle: 'disc', marginLeft: 16 }}>
                        {typeof v === 'object' ? renderValue(v) : String(v)}
                    </li>
                ))}
            </ul>
        );
    } else if (typeof value === 'object' && value !== null) {
        return (
            <div style={{
                background: '#f8f8f8',
                borderRadius: 4,
                padding: '6px 10px',
                margin: '4px 0 8px 0',
                fontSize: 14,
                overflowX: 'auto'
            }}>
                {Object.entries(value)
                    .filter(([k]) => k.toLowerCase() !== 'evs' && k.toLowerCase() !== 'ivs')
                    .map(([k, v]) => (
                        <div key={k} style={{ marginBottom: 2 }}>
                            <strong>{capitalize(k)}:</strong> {renderValue(v, k)}
                        </div>
                    ))}
            </div>
        );
    } else {
        return <span>{String(value)}</span>;
    }
};

const PREVIEW_FIELDS = []; // No preview fields, only image and name

const getImageSrc = (pokemon: any) => {
    // Use the dex number from the dataset, not the array index id
    let dexNumber: number | undefined = undefined;
    if (pokemon.name) {
        const nameToMatch =
            typeof pokemon.name === 'string'
                ? pokemon.name.toLowerCase()
                : pokemon.name.english?.toLowerCase();
        const entry = (showdownDataset as any[]).find(
            (p) =>
                p.name &&
                p.name.english &&
                p.name.english.toLowerCase() === nameToMatch
        );
        dexNumber = entry && entry.id;
    }
    if (!dexNumber && pokemon.dex !== undefined) {
        dexNumber = pokemon.dex;
    }
    if (!dexNumber) return undefined;
    const paddedId = String(dexNumber).padStart(3, '0');
    return `/images/${paddedId}.png`;
};

const PokemonList: React.FC<PokemonListProps> = ({ pokemons }) => {
    const [selected, setSelected] = useState<any | null>(null);

    // Add global scrollbar styles
    React.useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            /* Webkit scrollbar styling for all scrollable elements */
            ::-webkit-scrollbar {
                width: 10px;
                height: 8px;
                background: #f8f8f8;
                border-radius: 8px;
            }
            ::-webkit-scrollbar-thumb {
                background: #90caf9;
                border-radius: 8px;
            }
            ::-webkit-scrollbar-thumb:hover {
                background: #42a5f5;
            }
            /* Firefox */
            * {
                scrollbar-width: thin;
                scrollbar-color: #90caf9 #f8f8f8;
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return (
        <div className="pokemon-list">
            {pokemons.length > 0 ? (
                <>
                    {pokemons.map((pokemon) => {
                        const filteredPokemon = filterEVsIVs(pokemon);
                        const imgSrc = getImageSrc(filteredPokemon);
                        return (
                            <div
                                key={filteredPokemon.id}
                                className="pokemon-item"
                                style={{
                                    minWidth: 0,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center'
                                }}
                                onClick={() => setSelected(filteredPokemon)}
                            >
                                {imgSrc && (
                                    <img
                                        src={imgSrc}
                                        alt={filteredPokemon.name}
                                        style={{
                                            width: 80,
                                            height: 80,
                                            objectFit: 'contain',
                                            marginBottom: 8,
                                            display: 'block'
                                        }}
                                    />
                                )}
                                <div className="pokemon-name" style={{ marginBottom: 8 }}>{filteredPokemon.name}</div>
                                {/* No preview fields */}
                            </div>
                        );
                    })}
                    {selected && (
                        <div
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                width: '100vw',
                                height: '100vh',
                                background: 'rgba(0,0,0,0.4)',
                                zIndex: 1000,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onClick={() => setSelected(null)}
                        >
                            <div
                                style={{
                                    background: 'white',
                                    borderRadius: 8,
                                    padding: 24,
                                    minWidth: 320,
                                    maxWidth: 600,
                                    maxHeight: '80vh',
                                    overflowY: 'auto',
                                    boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
                                    position: 'relative'
                                }}
                                onClick={e => e.stopPropagation()}
                            >
                                <button
                                    style={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 12,
                                        background: 'transparent',
                                        border: 'none',
                                        fontSize: 24,
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setSelected(null)}
                                    aria-label="Close"
                                >
                                    &times;
                                </button>
                                {getImageSrc(selected) && (
                                    <img
                                        src={getImageSrc(selected)}
                                        alt={selected.name}
                                        style={{
                                            width: 120,
                                            height: 120,
                                            objectFit: 'contain',
                                            marginBottom: 16,
                                            display: 'block',
                                            marginLeft: 'auto',
                                            marginRight: 'auto'
                                        }}
                                    />
                                )}
                                <div className="pokemon-name" style={{ fontSize: 24, marginBottom: 12, textAlign: 'center' }}>
                                    {selected.name}
                                </div>
                                {Object.entries(selected)
                                    .filter(([key]) => key !== 'id' && key !== 'name')
                                    .map(([key, value]) => (
                                        <div key={key} style={{ marginBottom: 10 }}>
                                            <strong>{capitalize(key)}:</strong> {renderValue(value, key, selected)}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <p>No Pokémon found.</p>
            )}
        </div>
    );
};

export default PokemonList;