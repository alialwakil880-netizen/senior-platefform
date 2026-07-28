import { supabase } from "./supabase";

export interface QuizQuestion {
  id: string;
  questionText: string;
  choices: string[]; // 4 answer choices
  correctChoiceIndex: number; // 0, 1, 2, or 3
  points: number;
}

export interface LectureMaterial {
  id: string;
  name: string;
  url: string;
  size?: string;
}

export interface LectureItem {
  id: string;
  title: string;
  description?: string;
  youtubeUrl?: string; // Stored securely/internally
  videoId?: string;    // Extracted YouTube video ID (e.g. dQw4w9WgXcQ)
  materials: LectureMaterial[];
  quiz?: {
    title: string;
    questions: QuizQuestion[];
  };
  isPublished: boolean;
  order: number;
}

export interface CourseUnit {
  id: string;
  title: string;
  description?: string;
  lectures: LectureItem[];
  order: number;
}

export type StageCurriculum = Record<string, CourseUnit[]>;

// Helper: Extract valid YouTube ID from any YouTube / Unlisted link
export function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  const cleanUrl = url.trim();
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = cleanUrl.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function validateYouTubeUrl(url: string): boolean {
  return extractYouTubeId(url) !== null;
}

const initialCurriculum: StageCurriculum = {
  sec3: [
    {
      id: "unit-1-grammar",
      title: "Unit 1: Grammar & Tenses (قواعد الأزمنة)",
      description: "شامل لكل قواعد المضارع والماضي مع تطبيقات مكثفة",
      order: 1,
      lectures: [
        {
          id: "lec-1-present",
          title: "Present Simple & Continuous (المضارع البسيط والمستمر)",
          description: "شرح تفصيلي لحالات الاستخدام والكلمات الدالة والتفريق بين الزمنين",
          youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          videoId: "dQw4w9WgXcQ",
          isPublished: true,
          order: 1,
          materials: [
            {
              id: "mat-1",
              name: "Present_Simple_Worksheet.pdf",
              url: "#",
              size: "2.4 MB",
            },
          ],
          quiz: {
            title: "كويز المضارع البسيط والمستمر",
            questions: [
              {
                id: "q-1",
                questionText: "Look! The train _____ in the station right now.",
                choices: ["arrives", "is arriving", "arrived", "was arriving"],
                correctChoiceIndex: 1,
                points: 10,
              },
              {
                id: "q-2",
                questionText: "Water always _____ at 100 degrees Celsius under standard pressure.",
                choices: ["boils", "is boiling", "boiled", "has boiled"],
                correctChoiceIndex: 0,
                points: 10,
              },
              {
                id: "q-3",
                questionText: "How often _____ to the gym every week?",
                choices: ["do you go", "are you going", "have you gone", "did you go"],
                correctChoiceIndex: 0,
                points: 10,
              },
            ],
          },
        },
        {
          id: "lec-2-past",
          title: "Past Perfect & Narrative Tenses (الماضي التام وأزمنة السرد)",
          description: "تطبيقات على التتابع الزمني وحل أسئلة امتحانات سابقة",
          youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          videoId: "dQw4w9WgXcQ",
          isPublished: true,
          order: 2,
          materials: [
            {
              id: "mat-2",
              name: "Narrative_Tenses_Summary.pdf",
              url: "#",
              size: "1.8 MB",
            },
          ],
          quiz: {
            title: "كويز الماضي التام",
            questions: [
              {
                id: "q-4",
                questionText: "After she _____ her homework, she watched TV.",
                choices: ["had finished", "finished", "was finishing", "has finished"],
                correctChoiceIndex: 0,
                points: 10,
              },
            ],
          },
        },
      ],
    },
    {
      id: "unit-2-vocab",
      title: "Unit 2: Vocabulary & Idioms (المفردات والمصطلحات)",
      description: "حفظ الكلمات الأساسية، حروف الجر، والمشتقات الهامة",
      order: 2,
      lectures: [
        {
          id: "lec-3-vocab",
          title: "Key Vocabulary - Lesson 1 & 2 (أهم كلمات الدرس الأول والثاني)",
          description: "شرح الفروق الدقيقة بين المترادفات وأمثلة حية من النصوص",
          youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          videoId: "dQw4w9WgXcQ",
          isPublished: true,
          order: 1,
          materials: [],
        },
      ],
    },
    {
      id: "unit-3-revision",
      title: "Final Revision & Mock Exams (المراجعة النهائية والامتحانات الشاملة)",
      description: "نماذج امتحانات بنظام البابل شيت وتدريب على الوقت",
      order: 3,
      lectures: [],
    },
  ],
  sec2: [
    {
      id: "sec2-unit-1",
      title: "Unit 1: Staying Healthy (تانية ثانوي - الوحدة الأولى)",
      description: "قواعد وأفكار المنهج مع التمارين الشاملة",
      order: 1,
      lectures: [
        {
          id: "sec2-lec-1",
          title: "Must & Have to - Obligation & Necessity",
          youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          videoId: "dQw4w9WgXcQ",
          isPublished: true,
          order: 1,
          materials: [],
        },
      ],
    },
  ],
  sec1: [
    {
      id: "sec1-unit-1",
      title: "Unit 1: Getting Away (أولى ثانوي - الوحدة الأولى)",
      description: "شرح الدروس وتدريبات الترجمة والقطع",
      order: 1,
      lectures: [
        {
          id: "sec1-lec-1",
          title: "Lesson 1: Reading & Vocabulary",
          youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          videoId: "dQw4w9WgXcQ",
          isPublished: true,
          order: 1,
          materials: [],
        },
      ],
    },
  ],
  prep3: [
    {
      id: "prep3-unit-1",
      title: "Unit 1: Around Town (تالتة إعدادي - الوحدة الأولى)",
      order: 1,
      lectures: [
        {
          id: "prep3-lec-1",
          title: "Prepositions of Place & Giving Directions",
          youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          videoId: "dQw4w9WgXcQ",
          isPublished: true,
          order: 1,
          materials: [],
        },
      ],
    },
  ],
  bac: [
    {
      id: "bac-unit-1",
      title: "الوحدة الأولى: البكالوريا والنظام المكثف",
      order: 1,
      lectures: [],
    },
  ],
};

export async function getCurriculum(): Promise<StageCurriculum> {
  const { data, error } = await supabase
    .from("curriculum")
    .select("*");

  if (error) {
    console.error(error);
    return initialCurriculum;
  }

  if (!data || data.length === 0) {
    await saveCurriculum(initialCurriculum);
    return initialCurriculum;
  }

  const result: StageCurriculum = {};

  data.forEach((row) => {
    result[row.stage] = row.data;
  });

  return result;
}

export async function saveCurriculum(data: StageCurriculum) {

  console.log("SAVE DATA:", data);

  const rows = Object.entries(data).map(([stage, units]) => ({
    stage,
    data: units,
  }));

  console.log("ROWS:", rows);

  const { error } = await supabase
    .from("curriculum")
    .upsert(rows, {
      onConflict: "stage",
    });

  if (error) {
    console.error(error);
    return;
  }

  window.dispatchEvent(new Event("curriculum_updated"));
}