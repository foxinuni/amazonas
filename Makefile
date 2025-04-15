EMSDK_DIR = emsdk
SOURCE_DIR = src
PUBLIC_DIR = public

SOURCES = $(wildcard $(SOURCE_DIR)/*.cpp)

ifeq ($(OS),Windows_NT)
	EMSDK_SH := $(EMSDK_DIR)\emsdk.bat
	EMSDK_ENV := $(EMSDK_DIR)\emsdk_env.bat
else
	EMSDK_SH := $(EMSDK_DIR)/emsdk.sh
	EMSDK_ENV := $(EMSDK_DIR)/emsdk_env.sh
endif

setup:
	$(EMSDK_SH) install latest
	$(EMSDK_SH) activate latest
	$(EMSDK_ENV)

build: $(SOURCES)
	@em++ -DDEBUG -O3 $(SOURCES) -o $(PUBLIC_DIR)/amazons.js -s NO_EXIT_RUNTIME=1 -s "EXPORTED_RUNTIME_METHODS=['ccall','cwrap']"

start:
	@python -m http.server --directory $(PUBLIC_DIR) 8080
