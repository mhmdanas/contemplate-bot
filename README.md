# template-bot

> A GitHub App built with [Probot](https://github.com/probot/probot) that GitHub bot that comments on issues and PRs that ignore or don&#x27;t follow a template

## Setup

```sh
# Install dependencies
npm install

# Compile
npm run build

# Run
npm run start
```

## Docker

```sh
# 1. Build container
docker build -t template-bot .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> template-bot
```

## Contributing

If you have suggestions for how template-bot could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

template-bot is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
