const connection = require('./Model/connection');
const { check } = require('express-validator');

const validExperienceLevels = ['Limited', 'Basic', 'Competent', 'Skilled', 'Proficient', 'Expert'];
const validOutputLengths = ['Short', 'Medium', 'Long'];

const experienceLevelValidation = check('experience_level', 'Please select a valid experience level.')
    .isIn(validExperienceLevels);

const numberOfSubjectsValidation = check('number_of_subjects', 'Number of subjects must be between 1 and 10.')
    .isInt({ min: 1, max: 10 });

const outputLengthValidation = check('output_length', 'Please select a valid output length.')
    .isIn(validOutputLengths);

const ideaDescriptionValidation = check('idea_description', 'Please provide an idea description.')
    .isLength({ min: 1 });

const numberOfDraftsValidation = check('number_of_drafts', 'Number of drafts must be a valid number.')
    .isInt({ min: 0 });

module.exports = { 
    experienceLevelValidation, 
    numberOfSubjectsValidation, 
    outputLengthValidation, 
    ideaDescriptionValidation, 
    numberOfDraftsValidation 
};