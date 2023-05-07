# genetics-results-browser

Live browser available [here](http://35.240.43.159/)

This is the backend and frontend codebase for a variant annotation and interpretation web tool.

Running the tool requires precreated data files and annotation database files as defined in [config.py](config.py), download locations TBA. See the [genetics-results-munge](https://github.com/juhis/genetics-results-munge) repository for data file generation workflows. WIP annotation database scripts are included in [scripts](scripts).


## Development

Requirements: Python 3.10+ and npm 8.19+

### Install requirements

Install python libraries and node modules:

```
pip install -r requirements.txt
npm install
```

### Build JavaScript bundle

Build a JavaScript bundle from TypeScript sources to `static/bundle.js` in watch mode:

```
npx webpack --mode development --watch
```

### Run the server

After the JavaScript bundle has been created, the server can be run from a directory that contains a [config.py](config.py) file pointing to data file locations:

```
server/run.py
```

### Create a Docker image

```
docker build -t genetics-results-browser:MY_TAG .
```
