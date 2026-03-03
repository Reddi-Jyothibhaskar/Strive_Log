import historyService from "../services/history.service.js";

export const getSubjectHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await historyService.getSubjectHistory(id);

    res.json(data);
  } catch (error) {
    res.status(404).json({
      message: error.message
    });
  }
};