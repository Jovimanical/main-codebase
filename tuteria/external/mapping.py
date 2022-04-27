old_mapping = {
  "purposes": [
    {
      "text": "Entrance exam preparation",
      "value": "Entrance Exam Prep",
      "input": "Into which schools?",
      "id": 8
    },
    {
      "text": "Improve phonics, reading and writing",
      "value": "Phonics & Reading",
      "id": 1
    },
    {
      "text": "Help with assignments and school work",
      "value": "Academic Help",
      "id": 2
    },
    {
      "value": "Build Foundation",
      "text": "Build foundation and confidence",
      "id": 3
    },
    {
      "text": "Prepare for school tests and exam",
      "value": "School Exam Prep",
      "id": 4
    },
    {
      "text": "Homeschooling",
      "value": "Homeschooling",
      "id": 5
    },
    {
      "id": 6,
      "text": "Improve grades",
      "value": "Grades Improvement",
      "options": [
        {
          "text": "Impressive (90% and above)",
          "value": "90% and above"
        },
        {
          "text": "Good (70 - 89%)",
          "value": "70 - 89%"
        },
        {
          "text": "Average (50 - 69%)",
          "value": "50 - 69%"
        },
        {
          "text": "Below Average (40 - 49%)",
          "value": "40 - 49%"
        },
        {
          "text": "Not Good (39% and below)",
          "value": "39% and below"
        }
      ],
      "label": "Child’s current grade?"
    },

    {
      "id": 7,
      "text": "Special needs support",
      "value": "Special Needs",
      "options": [
        {
          "text": "Dyslexia",
          "value": "Dyslexia"
        },
        {
          "text": "Autism ",
          "value": "Autism "
        },
        {
          "text": "ADHD ",
          "value": "ADD/ADHD"
        },
        {
          "text": "Hearing impaired",
          "value": "Hard of Hearing"
        },
        {
          "text": "Visually impaired",
          "value": "Braille Reading"
        },
        {
          "text": "Speech impediment",
          "value": "Speech Disorders"
        },
        {
          "text": "Aspergers",
          "value": "Aspergers"
        }
      ],
      "label": "Type of special need"
    },
    {
      "id": 9,
      "text": "Checkpoint exam preparation",
      "value": "Checkpoint Prep"
    },
    {
      "id": 10,
      "text": "Prepare for JSCE/BECE",
      "value": "JSCE Prep"
    },
    {
      "id": 11,
      "text": "IGCSE preparation",
      "value": "IGCSE Prep"
    },
    {
      "id": 12,
      "text": "SSCE/NECO/GCE Preparation",
      "value": "O-Level Exam Prep"
    },
    {
      "id": 13,
      "text": "UTME/JAMB Preparation",
      "value": "UTME Prep"
    },
    {
      "id": 14,
      "text": "SAT exam preparation",
      "value": "SAT Prep"
    },
    {
      "id": 15,
      "text": "ACT exam preparation",
      "value": "ACT Prep"
    }
  ],
  "subjects": [
    { "General Mathematics": "Math" },
    { "English Language": "English" },
    { "Basic Science": "B/Science" },
    { "Basic Technology": "B/Tech" },
    { "Business Studies": "B/Studies" },
    { "ICT - Computer Science": "ICT" },
    { "Further Mathematics": "F/Math" },
    { "Agricultural Science": "Agric" },
    { "Technical Drawing": "TD" },
    { "Literature-in-English": "Literature" },
    { "Fine Art": "Art" }
  ],
  "academic": [
    {
      "groups": ["Pre-nursery", "Nursery 1", "Nursery 2"],
      "purpose": [1, 2, 3, 5, 7],
      "subjects": ["Literacy", "Numeracy", "Phonics"]
    },
    {
      "groups": [
        "Primary 1",
        "Primary 2",
        "Primary 3",
        "Primary 4",
        "Primary 5",
        "Primary 6"
      ],
      "purpose": [2, 1, 8, 4, 6, 5, 7],
      "subjects": [
        "Basic Mathematics",
        "English Language",
        "Basic Sciences",
        "Verbal Reasoning",
        "Quantitative Reasoning"
      ]
    },
    {
      "groups": ["JSS 1", "JSS 2", "JSS 3"],
      "purpose": [9, 10, 4, 6, 2, 5, 7],
      "subjects": [
        "General Mathematics",
        "English Language",
        "Basic Sciences ",
        "Basic Technology",
        "Business Studies",
        "ICT - Computer Science"
      ]
    },
    {
      "groups": ["SSS 1", "SSS 2", "SSS 3"],
      "purpose": [11, 12, 13, 14, 15, 4, 6, 2, 5, 7],
      "subjects": [
        {
          "group": "General",
          "options": [
            "General Mathematics",
            "English Language",
            "ICT - Computer Science"
          ]
        },
        {
          "group": "Science",
          "options": [
            "Chemistry",
            "Physics",
            "Biology",
            "Further Mathematics",
            "Geography",
            "Agricultural Science",
            "Technical Drawing"
          ]
        },
        {
          "group": "Commercial",
          "options": ["Economics", "Commerce", "Accounting"]
        },
        {
          "group": "Art",
          "options": [
            "Literature-in-English",
            "Government",
            "Fine Art",
            "History"
          ]
        }
      ]
    }
  ]
}
