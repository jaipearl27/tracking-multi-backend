import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";


const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'My API',
            version: '1.0.0',
            description: 'API Documentation for My Express App',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
        ],
    },
    apis: ['./src/routes/*.js'], // Path to your route files
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

const swaggerSetup = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export default swaggerSetup;