import analyticsService from '../services/analytics.service.js';

// Get /analytics/summary   "it retrieves analytics summary"
export const getSummary = async (req, res) =>{
    const data = await analyticsService.getAnalyticsSummary();
    res.json(data);
};