import syncToday from '../services/synchronisation.service.js';

const syncTodayHandler = async (req, res) => {
    try {
        const result = await syncToday.syncToday();
        res.status(200).json({
            message: "Sync completed successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Sync failed" });
    }
};

export default syncTodayHandler;