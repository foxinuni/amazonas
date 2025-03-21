SOURCE_DIR = src
PUBLIC_DIR = public

SOURCES = $(wildcard $(SOURCE_DIR)/*.c)

build: $(SOURCES)
	@emcc -O3 $(SOURCES) -o $(PUBLIC_DIR)/amazons.js -s NO_EXIT_RUNTIME=1 -s "EXPORTED_RUNTIME_METHODS=['ccall','cwrap']"

start:
	@python -m http.server --directory $(PUBLIC_DIR) 8080
