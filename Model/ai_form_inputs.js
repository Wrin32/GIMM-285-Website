const { query } = require('./connection');

const safe = (value) => value === undefined ? null : value;

const toBool = (v) => v ? 1 : 0;

async function getAll(queryParams = {}) {
    let selectSql = `SELECT
                afi.id,
                afi.experience_level,
                afi.number_of_subjects,
                afi.output_length,
                afi.has_composition,
                afi.has_storytelling,
                afi.has_perspective,
                afi.has_lighting,
                afi.has_posing,
                afi.has_style_direction,
                afi.has_elements_of_art,
                afi.has_principles_of_art,
                afi.idea_description,
                ac.number_of_drafts,
                ac.has_draft,
                ac.has_sketch,
                ac.has_lineart,
                ac.has_basic_colors,
                ac.has_cell_shading,
                ac.has_some_shading,
                ac.has_full_shading,
                ac.has_fully_rendered,
                ac.has_simple_background,
                ac.has_detailed_background,
                ac.has_painterly_style,
                ac.has_3d_digital_scene,
                ac.has_physical_artwork,
                ac.has_3d_physical_artwork
            FROM \`ai_form_inputs\` afi
            INNER JOIN \`artwork_completion\` ac ON afi.id = ac.ai_form_inputs_id`;
    
    let whereStatements = [];
    let orderByStatements = [];
    let queryParameters = [];

    // WHERE Filter 1: by experience level
    if (queryParams.experience && queryParams.experience.length > 0) {
        whereStatements.push(`afi.experience_level = ?`);
        queryParameters.push(queryParams.experience);
    }

    // WHERE Filter 2: by number of subjects
    if (queryParams.subjects && queryParams.subjects.length > 0) {
        whereStatements.push(`afi.number_of_subjects = ?`);
        queryParameters.push(parseInt(queryParams.subjects));
    }

    // WHERE Filter 3: by output length
    if (queryParams.outputLength && queryParams.outputLength.length > 0) {
        whereStatements.push(`afi.output_length = ?`);
        queryParameters.push(queryParams.outputLength);
    }

    // Add WHERE clause if needed
    if (whereStatements.length > 0) {
        selectSql += ` WHERE ` + whereStatements.join(` AND `);
    }

    // ORDER BY: Sort by preference
    if (queryParams.sort && queryParams.sort.length > 0) {
        if (queryParams.sort === 'SORTBYEX') {
            orderByStatements.push('afi.experience_level ASC');
        } else if (queryParams.sort === 'SORTBYOUT') {
            orderByStatements.push('afi.output_length ASC');
        } else if (queryParams.sort === 'NUMASC') {
            orderByStatements.push('afi.number_of_subjects ASC');
        } else if (queryParams.sort === 'NUMDESC') {
            orderByStatements.push('afi.number_of_subjects DESC');
        }
    } else {
        orderByStatements.push('afi.id DESC');
    }

    // Add ORDER BY
    if (orderByStatements.length > 0) {
        selectSql += ` ORDER BY ` + orderByStatements.join(`, `);
    }

    // LIMIT filter
    let limitValue = 10;
    if (queryParams.limit && queryParams.limit.length > 0) {
        limitValue = Math.min(parseInt(queryParams.limit), 100);
    }
    selectSql += ` LIMIT ${limitValue}`;

    return await query(selectSql, queryParameters);
}

async function getById(id) {
    let selectSql = `SELECT
                afi.id,
                afi.experience_level,
                afi.number_of_subjects,
                afi.output_length,
                afi.has_composition,
                afi.has_storytelling,
                afi.has_perspective,
                afi.has_lighting,
                afi.has_posing,
                afi.has_style_direction,
                afi.has_elements_of_art,
                afi.has_principles_of_art,
                afi.idea_description,
                ac.number_of_drafts,
                ac.has_draft,
                ac.has_sketch,
                ac.has_lineart,
                ac.has_basic_colors,
                ac.has_cell_shading,
                ac.has_some_shading,
                ac.has_full_shading,
                ac.has_fully_rendered,
                ac.has_simple_background,
                ac.has_detailed_background,
                ac.has_painterly_style,
                ac.has_3d_digital_scene,
                ac.has_physical_artwork,
                ac.has_3d_physical_artwork
            FROM \`ai_form_inputs\` afi
            LEFT JOIN \`artwork_completion\` ac ON afi.id = ac.ai_form_inputs_id
            WHERE afi.id = ?`;
    
    console.log('getById query:', selectSql, 'params:', [id]);
    const result = await query(selectSql, [id]);
    console.log('getById result:', result);
    return result;
}

async function edit(connection, id, parameters = {}) {
    let updateSQL = `UPDATE ai_form_inputs 
        SET experience_level = ?,
            number_of_subjects = ?, 
            output_length = ?, 
            has_composition = ?,
            has_storytelling = ?,
            has_perspective = ?,
            has_lighting = ?,
            has_posing = ?,
            has_style_direction = ?,
            has_elements_of_art = ?,
            has_principles_of_art = ?,
            idea_description = ?
        WHERE id = ?`;

    const toInt = (val) => val === undefined ? null : parseInt(val);

    let queryParameters = [
        safe(parameters.experience_level),
        toInt(parameters.number_of_subjects),
        safe(parameters.output_length),
     
        toBool(parameters.has_composition),
        toBool(parameters.has_storytelling),
        toBool(parameters.has_perspective),
        toBool(parameters.has_lighting),
        toBool(parameters.has_posing),
        toBool(parameters.has_style),
        toBool(parameters.has_elements),
        toBool(parameters.has_principles),

        safe(parameters.idea_description),
        id
    ];

    return await query(updateSQL, queryParameters);
}

async function insert(parameters = {}) {
    console.log('ai_form_inputs insert called with:', parameters);
    
    let insertSQL = `INSERT INTO ai_form_inputs 
                    (experience_level, number_of_subjects, output_length, 
                     has_composition, has_storytelling, has_perspective, has_lighting, 
                     has_posing, has_style_direction, has_elements_of_art, 
                     has_principles_of_art, idea_description) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    let queryParameters = [
        parameters.experience_level,
        parseInt(parameters.number_of_subjects),
        parameters.output_length,
        parameters.has_composition ? 1 : 0,
        parameters.has_storytelling ? 1 : 0,
        parameters.has_perspective ? 1 : 0,
        parameters.has_lighting ? 1 : 0,
        parameters.has_posing ? 1 : 0,
        parameters.has_style ? 1 : 0,
        parameters.has_elements ? 1 : 0,
        parameters.has_principles ? 1 : 0,
        parameters.idea_description
    ];

    console.log('ai_form_inputs queryParameters:', queryParameters);
    
    const result = await query(insertSQL, queryParameters);
    return result;
}

module.exports = {
    getAll,
    getById,
    insert,
    edit
}
