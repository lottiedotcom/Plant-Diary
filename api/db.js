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
                        spring_sched, spring_wfreq, spring_vpd_min, spring_vpd_max, spring_tfloor, spring_tceil, spring_optmin, spring_optmax, spring_wind, spring_lunar,
                        summer_sched, summer_wfreq, summer_vpd_min, summer_vpd_max, summer_tfloor, summer_tceil, summer_optmin, summer_optmax, summer_wind, summer_lunar,
                        fall_sched, fall_wfreq, fall_vpd_min, fall_vpd_max, fall_tfloor, fall_tceil, fall_optmin, fall_optmax, fall_wind, fall_lunar,
                        winter_sched, winter_wfreq, winter_vpd_min, winter_vpd_max, winter_tfloor, winter_tceil, winter_optmin, winter_optmax, winter_wind, winter_lunar
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
                        $17, $18, $19, $20, $21, $22, $23, $24, $25, $26,
                        $27, $28, $29, $30, $31, $32, $33, $34, $35, $36,
                        $37, $38, $39, $40, $41, $42, $43, $44, $45, $46,
                        $47, $48, $49, $50, $51, $52, $53, $54, $55, $56
                    )`,
                    [
                        t.id, t.name, t.stamp_img, t.toxic_pets, t.water_frequency, t.water_schedule, t.vpd_min, t.vpd_max, t.temp_floor, t.temp_ceiling, t.opt_min, t.opt_max, t.wind_tolerance, t.lunar_affinity, t.cycle, t.season,
                        t.spring_sched, t.spring_wfreq, t.spring_vpd_min, t.spring_vpd_max, t.spring_tfloor, t.spring_tceil, t.spring_optmin, t.spring_optmax, t.spring_wind, t.spring_lunar,
                        t.summer_sched, t.summer_wfreq, t.summer_vpd_min, t.summer_vpd_max, t.summer_tfloor, t.summer_tceil, t.summer_optmin, t.summer_optmax, t.summer_wind, t.summer_lunar,
                        t.fall_sched, t.fall_wfreq, t.fall_vpd_min, t.fall_vpd_max, t.fall_tfloor, t.fall_tceil, t.fall_optmin, t.fall_optmax, t.fall_wind, t.fall_lunar,
                        t.winter_sched, t.winter_wfreq, t.winter_vpd_min, t.winter_vpd_max, t.winter_tfloor, t.winter_tceil, t.winter_optmin, t.winter_optmax, t.winter_wind, t.winter_lunar
                    ]
                );
                return res.status(200).json({ message: 'Template successfully uploaded!' });
            }

            if (req.method === 'PUT') {
                const t = req.body;
                await pool.query(
                    `UPDATE plant_templates SET 
                        name=$2, stamp_img=COALESCE($3, stamp_img), toxic_pets=$4, water_frequency=$5, water_schedule=$6, vpd_min=$7, vpd_max=$8, temp_floor=$9, temp_ceiling=$10, opt_min=$11, opt_max=$12, wind_tolerance=$13, lunar_affinity=$14, cycle=$15, season=$16,
                        spring_sched=$17, spring_wfreq=$18, spring_vpd_min=$19, spring_vpd_max=$20, spring_tfloor=$21, spring_tceil=$22, spring_optmin=$23, spring_optmax=$24, spring_wind=$25, spring_lunar=$26,
                        summer_sched=$27, summer_wfreq=$28, summer_vpd_min=$29, summer_vpd_max=$30, summer_tfloor=$31, summer_tceil=$32, summer_optmin=$33, summer_optmax=$34, summer_wind=$35, summer_lunar=$36,
                        fall_sched=$37, fall_wfreq=$38, fall_vpd_min=$39, fall_vpd_max=$40, fall_tfloor=$41, fall_tceil=$42, fall_optmin=$43, fall_optmax=$44, fall_wind=$45, fall_lunar=$46,
                        winter_sched=$47, winter_wfreq=$48, winter_vpd_min=$49, winter_vpd_max=$50, winter_tfloor=$51, winter_tceil=$52, winter_optmin=$53, winter_optmax=$54, winter_wind=$55, winter_lunar=$56
                    WHERE id = $1`,
                    [
                        t.id, t.name, t.stamp_img, t.toxic_pets, t.water_frequency, t.water_schedule, t.vpd_min, t.vpd_max, t.temp_floor, t.temp_ceiling, t.opt_min, t.opt_max, t.wind_tolerance, t.lunar_affinity, t.cycle, t.season === 'year_round' ? null : t.season,
                        t.spring_sched, t.spring_wfreq, t.spring_vpd_min, t.spring_vpd_max, t.spring_tfloor, t.spring_tceil, t.spring_optmin, t.spring_optmax, t.spring_wind, t.spring_lunar,
                        t.summer_sched, t.summer_wfreq, t.summer_vpd_min, t.summer_vpd_max, t.summer_tfloor, t.summer_tceil, t.summer_optmin, t.summer_optmax, t.summer_wind, t.summer_lunar,
                        t.fall_sched, t.fall_wfreq, t.fall_vpd_min, t.fall_vpd_max, t.fall_tfloor, t.fall_tceil, t.fall_optmin, t.fall_optmax, t.fall_wind, t.fall_lunar,
                        t.winter_sched, t.winter_wfreq, t.winter_vpd_min, t.winter_vpd_max, t.winter_tfloor, t.winter_tceil, t.winter_optmin, t.winter_optmax, t.winter_wind, t.winter_lunar
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
