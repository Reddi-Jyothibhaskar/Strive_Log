import temp_topicsService from "../services/temp_topics.service.js";

export const getTempTopics = async (req, res) => {
    const { subject_id } = req.params;
    const topics = await temp_topicsService.getTempTopics(subject_id);
    const formattedTopics = topics.map(topic => ({
        ...topic,
        id: topic.id.toString()
    }));
    res.json(formattedTopics);
};

export const createTempTopic = async (req, res) => {
    const { subject_id } = req.params;
    const { name } = req.body;
    const existingTopic = await temp_topicsService.getOneTempTopic(subject_id, name)
    if (existingTopic) {
        return res.status(409).json({
            message: "Topic already exists"
        });
    }
    const newTopic =
        await temp_topicsService.createTempTopic(subject_id, name);
    res.status(201).json({
        message: "Added a new topic",
        ...newTopic,
        id: newTopic.id.toString()
    });

};

export const updateTempTopic = async (req, res) => {
    const { subject_id, id } = req.params;
    const { name } = req.body;
    const updatedTopic = await temp_topicsService.updateTempTopic(subject_id, id, name);
    res.json({
        message: "Updated a topic name",
        ...updatedTopic,
        id: updatedTopic.id.toString()
    });
};

export const deleteTempTopic = async (req, res) => {
    const { subject_id, id } = req.params;
    const deletedTopic = await temp_topicsService.deleteTempTopic(subject_id, id);
    res.json({
        message: "Deleted a topic",
        ...deletedTopic
    });
};