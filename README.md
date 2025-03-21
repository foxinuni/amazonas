# Amazons

### Compiling
1. Clone the repository and change into the directory
```sh
git clone https://github.com/foxinuni/amazonas`
cd amazonas
```

2. Initialize the emsdk submodule
```sh
git submodule update --init --recursive
```

3. Install and activate emsdk
```sh
cd emsdk && ./emsdk activate latest && cd ..
```

4. Compile and run the game
```sh
make build
make start
```