import prisma from "../config/prisma.js"

// Get a singe topic
async function getOneTempTopic(subject_id, name) {
    return prisma.tempTopic.findFirst({
        where: { subject_id: Number(subject_id), name: name }
    });
}

// Get all topics
async function getTempTopics(subject_id) {
    return prisma.tempTopic.findMany({
        where: { subject_id: Number(subject_id) },
        orderBy: { created_at: "desc"}
    });
}

// Create a new topic
async function createTempTopic(subject_id, name) {
    return prisma.tempTopic.create({
        data: {
            subject_id : Number(subject_id),
            name
        }
    });
}

// Update topic name
async function updateTempTopic(subject_id, id, name) {
    return prisma.tempTopic.update({
        where: { subject_id: Number(subject_id), id: Number(id) },
        data: { name }
    });
}

// Delete topic 
async function deleteTempTopic(subject_id, id) {
    return prisma.tempTopic.deleteMany({
        where: { subject_id: Number(subject_id), id: Number(id) },
    });
}

export default {
    getOneTempTopic,
    getTempTopics,
    createTempTopic,
    updateTempTopic,
    deleteTempTopic
}