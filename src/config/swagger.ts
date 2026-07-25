import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';

// glob memakai '/' sebagai separator di semua OS. path.join menghasilkan '\' di
// Windows yang ditafsirkan glob sebagai karakter escape → 0 file ter-scan
// (Swagger UI tampil tanpa endpoint). Normalisasi separator ke '/' agar pola
// glob konsisten di Windows maupun Linux.
const globPath = (rel: string): string =>
  path.join(process.cwd(), rel).split(path.sep).join('/');

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Sports Facility API',
      version: '1.0.0',
      description:
        'REST API — modul Booking, Dummy Payment (lokal, tanpa gateway eksternal), dan Auth JWT.',
    },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        CreatePaymentRequest: {
          type: 'object',
          required: ['items'],
          properties: {
            payment_method_id: { type: 'string', format: 'uuid' },
            promo_id: { type: 'string', format: 'uuid' },
            discount_amount: { type: 'number', default: 0 },
            items: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                required: ['item_type', 'item_id', 'item_name', 'quantity', 'unit_price'],
                properties: {
                  item_type: {
                    type: 'string',
                    enum: [
                      'booking',
                      'membership',
                      'pool_ticket',
                      'ticket',
                      'event',
                      'product',
                      'abonemen',
                    ],
                  },
                  item_id: { type: 'string', format: 'uuid' },
                  item_name: { type: 'string' },
                  quantity: { type: 'integer', minimum: 1 },
                  unit_price: { type: 'number', minimum: 0 },
                },
              },
            },
          },
        },
        PaymentResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                status: {
                  type: 'string',
                  enum: ['pending', 'paid', 'failed', 'expired', 'refunded', 'partial_refund'],
                },
                amount: { type: 'string' },
                fee_amount: { type: 'string' },
                discount_amount: { type: 'string' },
                final_amount: { type: 'string' },
                reference_id: { type: 'string' },
              },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  // Pindai anotasi @openapi di file route (mendukung dev .ts maupun build .js).
  apis: [globPath('src/routes/*.ts'), globPath('dist/routes/*.js')],
};

export const swaggerSpec = swaggerJsdoc(options);
