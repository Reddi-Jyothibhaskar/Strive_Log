import prisma from "../config/prisma.js";

// Get all subjects
async function getSubjects() {
  return prisma.subject.findMany({
    orderBy: { created_at: "desc" }
  });
}

// Create a new subject
async function createSubject(name) {
  return prisma.subject.create({
    data: {
      name,
      created_at: new Date(),
      is_active: true
    }
  });
}

// Update subject name
async function updateSubject(id, name) {
  return prisma.subject.update({
    where: { id: Number(id) },
    data: { name }
  });
}

// Delete subject (transactional)

async function deleteSubject(id) {
  return prisma.$transaction([
    prisma.DailyEntry.deleteMany({
      where: { subject_id: Number(id) }
    }),
    prisma.TempTopic.deleteMany({
      where: { subject_id: Number(id) }
    }),
    prisma.Topic.deleteMany({
      where: { subject_id: Number(id) }
    }),
    prisma.Subject.delete({
      where: { id: Number(id) }
    })
  ]);
}

export default {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject
};