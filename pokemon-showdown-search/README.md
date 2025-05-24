# Pokémon Showdown Search

## Overview
Pokémon Showdown Search is a web application that allows users to search and explore the Pokémon showdown dataset for random battles. The application provides a user-friendly interface to find Pokémon by name and view their details in an organized manner.

## Features
- Search for Pokémon by name.
- Display a list of Pokémon with their details.
- Responsive design for optimal viewing on various devices.

## Project Structure
```
pokemon-showdown-search
├── public
│   └── index.html          # Main HTML document
├── src
│   ├── App.tsx            # Main application component
│   ├── components          # Contains reusable components
│   │   ├── PokemonSearch.tsx  # Search component
│   │   └── PokemonList.tsx    # List component
│   ├── data
│   │   └── showdown-dataset.json  # Pokémon dataset
│   ├── styles
│   │   └── App.css        # CSS styles for the application
│   └── types
│       └── index.ts       # TypeScript types and interfaces
├── package.json            # npm configuration
├── tsconfig.json           # TypeScript configuration
└── README.md               # Project documentation
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd pokemon-showdown-search
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage
To start the application, run:
```
npm start
```
This will launch the application in your default web browser.

## Contributing
Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.