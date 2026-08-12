const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

module.exports = async (req, res) => {
    const dbType = req.headers['db-type'] || 'instance';

    try {
        // ==========================================
        // ☁️ MASTER DIRECTORY (Templates)
        // ==========================================
        if (dbType === 'template') {
            
            if (req.method === 'GET') {
                const result = await pool.query('SELECT * FROM plant_templates');
                return res.status(200).json({ templates: result.rows });
            }
            
            if (req.method === 'POST') {
                const t = req.body;
                await pool.query(
                    `INSERT INTO plant_templates (id, name, stamp_img, toxic_pets, water_frequency, water_schedule, vpd_min, vpd_max, temp_floor, temp_ceiling, opt_min, opt_max, wind_tolerance, lunar_affinity, cycle, season, winter_temp_floor, winter_temp_ceiling) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
                    [t.id, t.name, t.stamp_img, t.toxic_pets, t.water_frequency, t.water_schedule, t.vpd_min, t.vpd_max, t.temp_floor, t.temp_ceiling, t.opt_min, t.opt_max, t.wind_tolerance, t.lunar_affinity, t.cycle, t.season, t.winter_temp_floor, t.winter_temp_ceiling]
                );
                return res.status(200).json({ message: 'Template safely uploaded to Cloud!' });
            }

            // PUT: Edit/Update an existing master plant template
            if (req.method === 'PUT') {
                const t = req.body;
                await pool.query(
                    `UPDATE plant_templates SET name = $2, toxic_pets = $3, water_frequency = $4, water_schedule = $5, 
                     vpd_min = $6, vpd_max = $7, temp_floor = $8, temp_ceiling = $9, opt_min = $10, opt_max = $11, 
                     wind_tolerance = $12, lunar_affinity = $13, season = $14 WHERE id = $1`,
                    [t.id, t.name, t.toxic_pets, t.water_frequency, t.water_schedule, t.vpd_min, t.vpd_max, t.temp_floor, t.temp_ceiling, t.opt_min, t.opt_max, t.wind_tolerance, t.lunar_affinity, t.season === 'year_round' ? null : t.season]
                );
                return res.status(200).json({ message: 'Template successfully updated!' });
            }
        }

        // ==========================================
        // 📖 PERSONAL DIARY (Instances)
        // ==========================================
        if (dbType === 'instance') {
            
            if (req.method === 'GET') {
                const result = await pool.query(
                    'SELECT id, plant_template_id, nickname, shelf_type, custom_image, last_watered_at, created_at FROM plant_instances ORDER BY created_at ASC'
                );
                return res.status(200).json({ plants: result.rows });
            } 
            
            if (req.method === 'POST') {
                const { plant_template_id, nickname, shelf_type, custom_image } = req.body;
                await pool.query(
                    'INSERT INTO plant_instances (plant_template_id, nickname, shelf_type, custom_image) VALUES ($1, $2, $3, $4)',
                    [plant_template_id, nickname, shelf_type, custom_image]
                );
                return res.status(200).json({ message: 'Added to your diary!' });
            } 
            
            if (req.method === 'PUT') {
                const { id } = req.body;
                await pool.query('UPDATE plant_instances SET last_watered_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
                return res.status(200).json({ message: 'Watered!' });
            }
            
            if (req.method === 'DELETE') {
                const { id } = req.body;
                await pool.query('DELETE FROM plant_instances WHERE id = $1', [id]);
                return res.status(200).json({ message: 'Deleted forever!' });
            }
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error("Database Error:", error);
        return res.status(500).json({ error: error.message });
    }
};
