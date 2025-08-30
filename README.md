# Receipt Extractor Backend (NestJS)

A robust NestJS backend service that extracts structured data from receipt images using OCR (Optical Character Recognition) and AI. The service supports multiple AI providers and includes rate limiting, Docker support, and comprehensive API documentation.

## Features

- Added the support for multimodal (OpenAI and Gemini). Made code configureable to let it support more models.
- Added swagger
- Implemented a service that extracts structured receipt details (date, vendor, items, tax, total) from uploaded images.
- Added support for multiple AI providers so the extractor can use either Google or OpenAI models.
- The system saves the uploaded receipt image and the extracted details to a `receipts` folder and records metadata in a `db.json` file.
- Exposed a POST endpoint (`/receipt-extractor/extract-receipt-details`) for clients to submit receipts.
- Added unit tests and a retry mechanism (3 attempts) to improve reliability when the AI model response can be noisy.
- **Rate Limiting**: Global rate limiting (10 requests per 60 minutes) to prevent API abuse.
- **Docker Support**: Full containerization with development and production configurations.

## API Documentation

Once the server is running, you can access the interactive API documentation at:
- **Swagger UI**: `http://localhost:3000/v1/document`

## Supported AI Providers

- **OpenAI**: GPT-4 Vision and other vision-capable models
- **Google**: Gemini Pro Vision and other multimodal models

## Rate Limiting

The API includes built-in rate limiting:
- **Limit**: 10 requests per 60 minutes
- **Scope**: Global (all endpoints)
- **Response**: Returns `429 Too Many Requests` when limit exceeded

## Notes
- The OCR is performed using `Tesseract.js` to convert the image to text before sending it to the AI model.
- The AI model prompt is designed to extract key fields from the receipt text.

## Available Scripts

```bash
# Development
npm run start:dev      # Start in development mode with hot reload
npm run start:debug    # Start in debug mode
npm run build          # Build the application
npm run test           # Run unit tests
npm run test:e2e       # Run end-to-end tests

# Docker
npm run docker:build   # Build Docker image
npm run docker:up      # Start with Docker Compose
npm run docker:down    # Stop Docker containers
npm run docker:prod    # Start production environment
npm run docker:logs    # View container logs

# Code Quality
npm run lint           # Run ESLint
npm run format         # Format code with Prettier
```

## Getting Started

1. Clone this repository locally

2. Create a new working branch (e.g. `git checkout -b feature-branch`)

3. Set your node environment

   - Run `nvm install && nvm use`, or

   - Alternatively manually set your node to v18+ and npm to v10+

4. Run `npm install` to install dependencies

   Note: Ensure you have properly set your node version before this step

5. Run `npm run start:dev` or `npm run start:debug` to start the backend

   Your backend server should be running on `localhost:3000`, unless a different port is defined in `process.env.PORT`.

   You can check that the server is running correctly by trying the base endpoint `GET http://localhost:3000`, which should return the text "Hello World!"

## Development

1. Complete all of your work in a feature branch

2. Push commits to your remote branch as often as you need

## Deployment

You can deploy this application using Docker:

```bash
# Build and run with Docker Compose
npm run docker:up

# For production deployment
npm run docker:prod
```

See [DOCKER.md](./DOCKER.md) for detailed Docker instructions.

## Project Structure

```
src/
├── app.controller.ts              # Main application controller
├── app.module.ts                  # Root module with rate limiting
├── app.service.ts                 # Main application service
├── main.ts                        # Application entry point
└── receipt-extractor/
    ├── ai-providers.ts            # AI provider enums and types
    ├── ocr.service.ts             # OCR processing service
    ├── receipt-extractor.controller.ts  # Receipt extraction endpoint
    ├── receipt-extractor.module.ts      # Receipt extractor module
    ├── receipt-extractor.service.ts     # Main extraction logic
    ├── ai-services/               # AI service implementations
    │   ├── ai-service.factory.ts  # Factory for AI services
    │   ├── ai.service.ts          # Base AI service interface
    │   ├── google-ai.service.ts   # Google AI implementation
    │   └── openai-ai.service.ts   # OpenAI implementation
    └── dto/                       # Data transfer objects
        ├── extract-receipt-details-request.dto.ts
        └── extract-receipt-details.dto.ts
```

## API Endpoints

### POST `/receipt-extractor/extract-receipt-details`

Extracts structured data from a receipt image.

**Request:**
- `file`: Receipt image (multipart/form-data)
- `aiProvider`: AI provider to use (`openai` or `google`)
- `model`: Specific model to use (optional)

**Response:**
```json
{
  "date": "2024-01-15",
  "vendor": "Example Store",
  "items": [
    {
      "name": "Item 1",
      "quantity": 2,
      "price": 10.99
    }
  ],
  "tax": 2.20,
  "total": 24.18
}
```

## Environment variables (.env)

Create a `.env` file in the project root with the following variables set (example values shown):

```
PORT=3000
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY
```

- `OPENAI_API_KEY` and `GOOGLE_API_KEY` are required if you plan to use the respective providers.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the UNLICENSED license.

## Support

For support and questions, please open an issue in the repository.

