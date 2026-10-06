//Libraries
const express = require('express');
const multer = require('multer');
const db = require('./Model/connection');
const { validationResult } = require('express-validator');
const aiFormInputs = require('./Model/ai_form_inputs');
const artworkCompletion = require('./Model/artwork_completion');
const { experienceLevelValidation, numberOfSubjectsValidation, outputLengthValidation, ideaDescriptionValidation, numberOfDraftsValidation } = require('./validation');

//Setup defaults for script
const app = express();

app.use(express.json());

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
const upload = multer()
const port = 80 //Default port to http server

//Get all artwork records with optional filtering
app.get(
    '/artwork/',
    upload.none(),
    async (request, response) => {
        let result = {};
        try {
            result = await aiFormInputs.getAll(request.query);
        } catch (error) {
            console.log(error);
            return response
                .status(500)
                .json({ 
                    message: 'Something went wrong with the server.',
                    success: false 
                });
        }
        response.json({ 'data': result });
    });

//Get single artwork record by ID
app.get(
    '/artwork/:id/',
    upload.none(),
    async (request, response) => {
        let result = {};
        try {
            result = await aiFormInputs.getById(request.params.id);
            if (result.length === 0) {
                return response
                    .status(404)
                    .json({ 
                        message: 'Artwork record not found.',
                        success: false 
                    });
            }
        } catch (error) {
            console.log(error);
            return response
                .status(500)
                .json({ 
                    message: 'Something went wrong with the server.',
                    success: false 
                });
        }
        
        response.json({ 'data': result });
    });

app.post(
    '/artwork/',
    upload.none(),
    [
        experienceLevelValidation,
        numberOfSubjectsValidation,
        outputLengthValidation,
        ideaDescriptionValidation,
        numberOfDraftsValidation
    ],
    async (request, response) => {
        //Validate request
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response
                .status(400)
                .json({
                    message: 'Request fields are invalid.',
                    errors: errors.array(),
                    success: false
                });
        }

        try {
            console.log('POST request.body:', request.body);
            
            // Process details checkboxes
            if (request.body.details) {
                if (Array.isArray(request.body.details)) {
                    request.body.details.forEach(detail => {
                        request.body['has_' + detail] = '1';
                    });
                } else {
                    request.body['has_' + request.body.details] = '1';
                }
            }

            // Process level checkboxes
            if (request.body.level) {
                if (Array.isArray(request.body.level)) {
                    request.body.level.forEach(level => {
                        request.body['has_' + level] = '1';
                    });
                } else {
                    request.body['has_' + request.body.level] = '1';
                }
            }

            console.log('POST request.body after processing:', request.body);
            
            // Insert into ai_form_inputs
            const aiFormResult = await aiFormInputs.insert(request.body);
            const aiFormInputsId = aiFormResult.insertId;

            console.log('aiFormInputsId:', aiFormInputsId);

            // Insert into artwork_completion
            await artworkCompletion.insert(aiFormInputsId, request.body);

            return response
                .status(201)
                .json({ 
                    message: 'Artwork record created successfully!',
                    success: true,
                    id: aiFormInputsId
                });
        } catch (error) {
            console.log(error);
            return response
                .status(500)
                .json({ 
                    message: 'Something went wrong with the server.',
                    success: false
                });
        }
    }
);

//Update artwork record by ID
app.put(
    '/artwork/:id/',
    upload.none(),
    [
        experienceLevelValidation,
        numberOfSubjectsValidation,
        outputLengthValidation,
        ideaDescriptionValidation,
        numberOfDraftsValidation
    ],
    async (request, response) => {
        let connection;
        //Validate request
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response
                .status(400)
                .json({
                    message: 'Request fields are invalid.',
                    errors: errors.array(),
                    success: false
                });
        }

        try {
            connection = await db.getConnection();
            await connection.beginTransaction();
            
            // Process details checkboxes
            if (request.body.details) {
                if (Array.isArray(request.body.details)) {
                    request.body.details.forEach(detail => {
                        request.body['has_' + detail] = '1';
                    });
                } else {
                    request.body['has_' + request.body.details] = '1';
                }
            }

            // Process level checkboxes
            if (request.body.level) {
                if (Array.isArray(request.body.level)) {
                    request.body.level.forEach(level => {
                        request.body['has_' + level] = '1';
                    });
                } else {
                    request.body['has_' + request.body.level] = '1';
                }
            }
            
            await aiFormInputs.edit(connection, request.params.id, request.body);
            await artworkCompletion.edit(connection, request.params.id, request.body);
            await connection.commit();

            return response
                .status(200)
                .json({ 
                    message: 'Artwork record updated successfully!',
                    success: true,
                    id: request.params.id
                });
        } catch (error) {
            console.log(error);
            if (connection) await connection.rollback();
            return response
                .status(500)
                .json({ 
                    message: 'Something went wrong with the server.',
                    success: false
                });
        }
    }
);

app.listen(port, () => {
    console.log(`Application listening at http://localhost:${port}`);
});
