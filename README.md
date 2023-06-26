# Web Scraper with RabbitMQ

This project is a web scraper that fetches property details from a website and uses RabbitMQ for message queuing. The project is structured using the SOLID principles and uses Puppeteer for web scraping.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Docker and Docker Compose

### Installing

1. Clone the repository:

```bash
git clone https://github.com/man0l/imot-scraper.git
cd imot-scraper
```

2. Build the Docker images:

```bash
docker-compose build
```

3. Run the migrations:

```bash
docker-compose run web_scraper_consumer npx sequelize-cli db:migrate --migrations-path ./src/migrations/ --models-path ./src/models/ --config ./src/config/db.json
```

### Usage

1. To start the RabbitMQ server, publisher, and consumer:

```bash
docker-compose up
```

The `property_type_publisher.js` script will automatically publish property types URLs to RabbitMQ, and the `main.js` script will consume the URLs and scrape property details.

You can view the logs for each service in the Docker Compose output.

## Work with RabbitMQ Management
You can access the RabbitMQ Management interface at http://host.docker.internal:15672. The default username and password are `guest`.
Also, you could connect to the rabbitmq server through the same host and port host.docker.internal:5672

## Built With

- [Docker](https://www.docker.com/) - Containerization platform
- [Node.js](https://nodejs.org) - JavaScript runtime
- [Puppeteer](https://pptr.dev/) - Headless browser for web scraping
- [RabbitMQ](https://www.rabbitmq.com/) - Open source message broker

## Contributing

Please read `CONTRIBUTING.md` for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the `LICENSE.md` file for details
