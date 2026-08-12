const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

module.exports = async (req, res) => {
    const dbType = req.headers['db-type'] || 'instance';

    try {
        if (dbType === 'template') {
            if (req.method === 'GET') {
                const result = await pool.query('SELECT * FROM plant_templates');
                return res.status(200).json({ templates: result.rows });
            }
            
            if (req.method === 'POST') {
                const t = req.body;
                await pool.query(
                    `INSERT INTO plant_templates (
                        id, name, stamp_img, toxic_pets, water_frequency, water_schedule, vpd_min, vpd_max, temp_floor, temp_ceiling, opt_min, opt_max, wind_tolerance, lunar_affinity, cycle, season,
                        spring_sched, spring_vpd_min, spring_vpd_max, spring_tfloor, spring_tceil, spring_optmin, spring_optmax, spring_wind, spring_lunar,
                        summer_sched, summer_vpd_min, summer_vpd_max, summer_tfloor, summer_tceil, summer_optmin, summer_optmax, summer_wind, summer_lunar,
                        fall_sched, fall_vpd_min, fall_vpd_max, fall_tfloor, fall_tceil, fall_optmin, fall_optmax, fall_wind, fall_lunar,
                        winter_sched, winter_vpd_min, winter_vpd_max, winter_tfloor, winter_tceil, winter_optmin, winter_optmax, winter_wind, winter_lunar
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
                        $17, $18, $19, $20, $21, $22, $23, $24, $25,
                        $26, $27, $28, $29, $30, $31, $32, $33, $34,
                        $35, $36, $37, $38, $39, $40, $41, $42, $43,
                        $44, $45, $46, $47, $48, $49, $50, $51, $52
                    )`,
                    [
                        t.id, t.name, t.stamp_img, t.toxic_pets, t.water_frequency, t.water_schedule, t.vpd_min, t.vpd_max, t.temp_floor, t.temp_ceiling, t.opt_min, t.opt_max, t.wind_tolerance, t.lunar_affinity, t.cycle, t.season,
                        t.spring_sched, t.spring_vpd_min, t.spring_vpd_max, t.spring_tfloor, t.spring_tceil, t.spring_optmin, t.spring_optmax, t.spring_wind, t.spring_lunar,
                        t.summer_sched, t.summer_vpd_min, t.summer_vpd_max, t.summer_tfloor, t.summer_tceil, t.summer_optmin, t.summer_optmax, t.summer_wind, t.summer_lunar,
                        t.fall_sched, t.fall_vpd_min, t.fall_vpd_max, t.fall_tfloor, t.fall_tceil, t.fall_optmin, t.fall_optmax, t.fall_wind, t.fall_lunar,
                        t.winter_sched, t.winter_vpd_min, t.winter_vpd_max, t.winter_tfloor, t.winter_tceil, t.winter_optmin, t.winter_optmax, t.winter_wind, t.winter_lunar
                    ]
                );
                return res.status(200).json({ message: 'Template successfully uploaded!' });
            }

            if (req.method === 'PUT') {
                const t = req.body;
                await pool.query(
                    `UPDATE plant_templates SET 
                        name=$2, toxic_pets=$3, water_frequency=$4, water_schedule=$5, vpd_min=$6, vpd_max=$7, temp_floor=$8, temp_ceiling=$9, opt_min=$10, opt_max=$11, wind_tolerance=$12, lunar_affinity=$13, season=$14,
                        spring_sched=$15, spring_vpd_min=$16, spring_vpd_max=$17, spring_tfloor=$18, spring_tceil=$19, spring_optmin=$20, spring_optmax=$21, spring_wind=$22, spring_lunar=$23,
                        summer_sched=$24, summer_vpd_min=$25, summer_vpd_max=$26, summer_tfloor=$27, summer_tceil=$28, summer_optmin=$29, summer_optmax=$30, summer_wind=$31, summer_lunar=$32,
                        fall_sched=$33, fall_vpd_min=$34, fall_vpd_max=$35, fall_tfloor=$36, fall_tceil=$37, fall_optmin=$38, fall_optmax=$39, fall_wind=$40, fall_lunar=$41,
                        winter_sched=$42, winter_vpd_min=$43, winter_vpd_max=$44, winter_tfloor=$45, winter_tceil=$46, winter_optmin=$47, winter_optmax=$48, winter_wind=$49, winter_lunar=$50
                    WHERE id = $1`,
                    [
                        t.id, t.name, t.toxic_pets, t.water_frequency, t.water_schedule, t.vpd_min, t.vpd_max, t.temp_floor, t.temp_ceiling, t.opt_min, t.opt_max, t.wind_tolerance, t.lunar_affinity, t.season === 'year_round' ? null : t.season,
                        t.spring_sched, t.spring_vpd_min, t.spring_vpd_max, t.spring_tfloor, t.spring_tceil, t.spring_optmin, t.spring_optmax, t.spring_wind, t.spring_lunar,
                        t.summer_sched, t.summer_vpd_min, t.summer_vpd_max, t.summer_tfloor, t.summer_tceil, t.summer_optmin, t.summer_optmax, t.summer_wind, t.summer_lunar,
                        t.fall_sched, t.fall_vpd_min, t.fall_vpd_max, t.fall_tfloor, t.fall_tceil, t.fall_optmin, t.fall_optmax, t.fall_wind, t.fall_lunar,
                        t.winter_sched, t.winter_vpd_min, t.winter_vpd_max, t.winter_tfloor, t.winter_tceil, t.winter_optmin, t.winter_optmax, t.winter_wind, t.winter_lunar
                    ]
                );
                return res.status(200).json({ message: 'Template successfully updated!' });
            }
        }

        if (dbType === 'instance') {
            if (req.method === 'GET') {
                const result = await pool.query('SELECT id, plant_template_id, nickname, shelf_type, custom_image, last_watered_at, created_at FROM plant_instances ORDER BY created_at ASC');
                return res.status(200).json({ plants: result.rows });
            } 
            if (req.method === 'POST') {
                const { plant_template_id, nickname, shelf_type, custom_image } = req.body;
                await pool.query('INSERT INTO plant_instances (plant_template_id, nickname, shelf_type, custom_image) VALUES ($1, $2, $3, $4)', [plant_template_id, nickname, shelf_type, custom_image]);
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
