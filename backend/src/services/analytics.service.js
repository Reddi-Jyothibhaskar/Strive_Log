import prisma from "../config/prisma.js";

//Get /analytics/summary
async function getAnalyticsSummary(){
    //Logic for start date
    const firstEntry = await
    prisma.dailyEntry.findFirst({
            orderBy:{ study_date :"asc" }
        });

    if(!firstEntry)//This means there are no entries in the database, so we can return an empty summary
    {
        return {
        careerStartDate: null,
        totalCareerDays: 0,
        subjects: []
        };
    }

    //career start date exstraction
    const careerStartDate = firstEntry.study_date;//Extracting date from first ever entered entry/record into daily_entries table
   
//logic for total active days
const distinctDates = await prisma.dailyEntry.findMany({
    select: {study_date: true},
    distinct: ["study_date"]
});

const totalCareerDays = distinctDates.length;

    const grouped = await prisma.dailyEntry.groupBy({
        by: ['subject_id'],
        _count: {
            id: true
        }
    });

    const subjects = await prisma.subject.findMany();

    const subjectMap = new Map();
    subjects.forEach((s) =>{
        subjectMap.set(s.id, s.name);
    });

    const formattedSubjects = grouped.map((g) => ({
        subjectId: g.subject_id,
        name: subjectMap.get(g.subject_id),
        studyDays: g._count.id
    }));

    return {
        careerStartDate:
        careerStartDate.toISOString().split('T')[0], // Format date as YYYY-MM-DD
        totalCareerDays,
        subjects: formattedSubjects
    };
}

export default {
    getAnalyticsSummary
};