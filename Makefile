.PHONY: lint \
	test

# See https://stackoverflow.com/a/18137056
MAKEFILE_PATH := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))

# -----------------------------------------------
# Build Configuration
# -----------------------------------------------

# To make sure we don't silently swallow errors
NODE_ARGS = --abort-on-uncaught-exception --stack-trace-limit=100
NODE_DEBUG_ARGS = $(NODE_ARGS) --trace-warnings --stack_trace_on_illegal

# User parameters
FIX ?=
ifeq ($(FIX),)
ESLINT_OPTION_FIX =
else
ESLINT_OPTION_FIX = --fix
endif

AVA_ARGS = $(AVA_OPTS)
ifndef CI
AVA_ARGS += --fail-fast
endif
ifdef MATCH
AVA_ARGS += --match $(MATCH)
endif

FILES ?= "'./lib/**/*.spec.{js,jsx}'"
export FILES

# -----------------------------------------------
# Rules
# -----------------------------------------------

lint:
	npx eslint --ext .js,.jsx $(ESLINT_OPTION_FIX) lib test .storybook
	npx jellycheck --ui-lib
	npx deplint
	npx depcheck --ignore-bin-package --ignores='@babel/*,@ava/babel,@storybook/*,babel-loader,core-js'

test:
	node $(NODE_DEBUG_ARGS) ./node_modules/.bin/ava $(AVA_ARGS) $(FILES)
