JS_COMPILER ?= uglifyjs
SHOW_COMPILE = printf "\033[32mBuilding \033[1m%s\033[0m\n"
DIR_SRC=src
DIR_CSS=css
ALL_SRC=src/djs-core.js $(foreach dir, $(DIR_SRC), $(filter-out src/djs-core.js, $(wildcard $(dir)/*.js)))
ALL_CSS=$(foreach dir, $(DIR_CSS), $(wildcard $(dir)/*.css))
TARGETS=$(foreach dir, $(DIR_SRC), $(patsubst $(dir)/%.js,  dist/%.min.js,$(wildcard $(dir)/*.js))) $(foreach dir, $(DIR_CSS), $(patsubst $(dir)/%.css,  dist/%.min.css, $(wildcard $(dir)/*.css)))

all: dist/djs.min.js dist/djs.js dist/djs.min.css $(TARGETS)
dist/djs.js: $(ALL_SRC)
	@$(SHOW_COMPILE) $@
	@cat $(ALL_SRC) > $@
dist/djs.min.js: $(ALL_SRC)
	@$(SHOW_COMPILE) $@
	@cat $^ | $(JS_COMPILER) > $@
dist/djs-speaker.min.js: src/djs-core.js src/djs-events.js src/djs-speaker.js
	@$(SHOW_COMPILE) $@
	@cat $^ | $(JS_COMPILER) > $@
dist/%.min.js: src/djs-core.js src/%.js
	@$(SHOW_COMPILE) $@
	@cat $^ | $(JS_COMPILER) > $@
dist/%.min.css: css/%.css
	@$(SHOW_COMPILE) $@
	@wget --quiet --post-data="input=`cat $^`" --output-document=$@ https://cssminifier.com/raw
dist/djs.min.css: $(ALL_CSS)
	@$(SHOW_COMPILE) $@
	@wget --quiet --post-data="input=`cat $^`" --output-document=$@ https://cssminifier.com/raw

clean:
	@rm -f dist/*
.phony: all clean
