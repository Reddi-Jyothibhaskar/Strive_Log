import subjectService from "../services/subjects.service.js";

export const getSubjects = async (req, res) => {
  const subjects = await subjectService.getSubjects();
  res.json(subjects);
};

export const createSubject = async (req, res) => {
  const { name } = req.body;
  const subject = await subjectService.createSubject(name);
  res.status(201).json(subject);
};

export const updateSubject = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const subject = await subjectService.updateSubject(id, name);
  res.json(subject);
};

export const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    await subjectService.deleteSubject(id);
    res.status(200).json({ message: "Subject deleted successfully" });
  } catch(err) {
    console.log(err);
    res.json(err);
  }
};