import prisma from "../config/prisma.js";

async function getSubjectHistory(subjectId) {
  const id = Number(subjectId);

  // Get subject
  const subject = await prisma.subject.findUnique({
    where: { id }
  });

  if (!subject) {
    throw new Error("Subject not found");
  }

  // Get topics for subject
  const topics = await prisma.topic.findMany({
    where: { subject_id: id },
    orderBy: { last_studied_at: "desc" }
  });

  // Format with serial numbers
  const formattedTopics = topics.map((t, index) => ({
    sNo: index + 1,
    name: t.name,
    firstStudiedAt: t.first_studied_at.toISOString().split("T")[0],
    lastStudiedAt: t.last_studied_at.toISOString().split("T")[0],
    frequency: t.frequency
  }));

  return {
    subjectName: subject.name,
    topics: formattedTopics
  };
}

export default {
  getSubjectHistory
};