gendiff:
	node  src/bin/gendiff.js
lint:
	npx eslint .
test-coverage:
	npm test -- --coverage --coverageProvider=v8	