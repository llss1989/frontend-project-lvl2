gendiff:
	node ./bin/gendiff.js
lint:
	npx eslint .
test-coverage:
	npm test -- --coverage --coverageProvider=v8
make install:
	npm install