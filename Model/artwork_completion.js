const { query } = require('./connection');

const safe = (value) => value === undefined ? null : value;

const toBool = (v) => v ? 1 : 0;

async function edit(connection, aiFormInputsId, parameters = {}) {

    let updateSQL = `
        UPDATE artwork_completion
        SET number_of_drafts = ?,
            has_draft = ?,
            has_sketch = ?,
            has_lineart = ?,
            has_basic_colors = ?,
            has_cell_shading = ?,
            has_some_shading = ?,
            has_full_shading = ?,
            has_fully_rendered = ?,
            has_simple_background = ?,
            has_detailed_background = ?,
            has_painterly_style = ?,
            has_3d_digital_scene = ?,
            has_physical_artwork = ?,
            has_3d_physical_artwork = ?
        WHERE ai_form_inputs_id = ?
    `;

    const toInt = (val) => val === undefined ? null : parseInt(val);

    let queryParameters = [
        toInt(parameters.number_of_drafts),

        toBool(parameters.has_draft),
        toBool(parameters.has_sketch),
        toBool(parameters.has_lineart),
        toBool(parameters.has_basic_colors),
        toBool(parameters.has_cell_shading),
        toBool(parameters.has_some_shading),
        toBool(parameters.has_full_shading),
        toBool(parameters.has_fully_rendered),

        toBool(parameters.has_simple_background),
        toBool(parameters.has_detailed_background),

        toBool(parameters.has_painterly_style),
        toBool(parameters.has_3d_digital_scene),
        toBool(parameters.has_physical_artwork),
        toBool(parameters.has_3d_physical_artwork),

        aiFormInputsId
    ];

    return await query(updateSQL, queryParameters);
};

async function insert(aiFormInputsId, parameters = {}) {
    let insertSQL = `INSERT INTO artwork_completion 
                    (ai_form_inputs_id, number_of_drafts, has_draft, has_sketch, 
                     has_lineart, has_basic_colors, has_cell_shading, has_some_shading, 
                     has_full_shading, has_fully_rendered, has_simple_background, 
                     has_detailed_background, has_painterly_style, has_3d_digital_scene, 
                     has_physical_artwork, has_3d_physical_artwork) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    let queryParameters = [
        aiFormInputsId,
        parseInt(parameters.number_of_drafts),
        parameters.has_draft ? 1 : 0,
        parameters.has_sketch ? 1 : 0,
        parameters.has_lineart ? 1 : 0,
        parameters.has_basic_colors ? 1 : 0,
        parameters.has_cell_shading ? 1 : 0,
        parameters.has_some_shading ? 1 : 0,
        parameters.has_full_shading ? 1 : 0,
        parameters.has_fully_rendered ? 1 : 0,
        parameters.has_simple_background ? 1 : 0,
        parameters.has_detailed_background ? 1 : 0,
        parameters.has_painterly_style ? 1 : 0,
        parameters.has_3d_digital_scene ? 1 : 0,
        parameters.has_physical_artwork ? 1 : 0,
        parameters.has_3d_physical_artwork ? 1 : 0
    ];

    const result = await query(insertSQL, queryParameters);
    return result;
}

module.exports = {
    insert,
    edit
}
