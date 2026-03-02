import prisma from "../config/prisma.js"

async function syncToday() {
    const today_ = new Date();
    const today = today_.toISOString().split('T')[0]
    // console.log(today);
    
    const tempTopics = await prisma.tempTopic.findMany();
    
    await prisma.$transaction(async (tx) => {
        
        for (const topic of tempTopics) {
            const createdDate_ = new Date(topic.created_at);
            const createdDate = createdDate_.toISOString().split('T')[0]
            // console.log(createdDate);

            // Skip if created today
            if (createdDate === today) {
                continue;
            }

            // UPSERT Topic
            await tx.topic.upsert({
                where: {
                    subject_id_name: {
                        subject_id: topic.subject_id,
                        name: topic.name,
                    },
                },
                update: {
                    last_studied_at: createdDate_,
                    frequency: { increment: 1 },
                },
                create: {
                    subject_id: topic.subject_id,
                    name: topic.name,
                    first_studied_at: createdDate_,
                    last_studied_at: createdDate_,
                    frequency: 1,
                },
            });

            // Insert DailyEntry (skip duplicates)
            await tx.dailyEntry.upsert({
                where: {
                    subject_id_study_date: {
                        subject_id: topic.subject_id,
                        study_date: createdDate_,
                    }
                },
                update: {},
                create: {
                    subject_id: topic.subject_id,
                    study_date: createdDate_,
                },
            });

            // Delete topic topic
            await tx.tempTopic.delete({
                where: { id: topic.id },
            });
        }
    });
};

export default {
    syncToday
}