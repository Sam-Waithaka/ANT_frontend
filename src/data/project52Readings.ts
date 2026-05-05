export type ReadingBlock = {
  book: string;
  startChapter: number;
  endChapter: number;
};

export type DailySchedule = {
  day: number;
  oldTestament: ReadingBlock[];
  newTestament: ReadingBlock[];
};

export type WeeklySchedule = {
  week: number;
  days: DailySchedule[];
};

export const project52Readings: WeeklySchedule[] = [
  {
    "week": 1,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Genesis",
            "startChapter": 1,
            "endChapter": 3
          }
        ],
        "newTestament": [
          {
            "book": "Matthew",
            "startChapter": 1,
            "endChapter": 1
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Genesis",
            "startChapter": 4,
            "endChapter": 8
          }
        ],
        "newTestament": [
          {
            "book": "Matthew",
            "startChapter": 2,
            "endChapter": 2
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Genesis",
            "startChapter": 9,
            "endChapter": 12
          }
        ],
        "newTestament": [
          {
            "book": "Matthew",
            "startChapter": 3,
            "endChapter": 3
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Genesis",
            "startChapter": 13,
            "endChapter": 16
          }
        ],
        "newTestament": [
          {
            "book": "Matthew",
            "startChapter": 4,
            "endChapter": 4
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Genesis",
            "startChapter": 17,
            "endChapter": 19
          }
        ],
        "newTestament": [
          {
            "book": "Matthew",
            "startChapter": 5,
            "endChapter": 5
          }
        ]
      }
    ]
  },
  {
    "week": 2,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Genesis",
            "startChapter": 20,
            "endChapter": 23
          }
        ],
        "newTestament": [
          {
            "book": "Matthew",
            "startChapter": 6,
            "endChapter": 6
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Genesis",
            "startChapter": 24,
            "endChapter": 25
          }
        ],
        "newTestament": [
          {
            "book": "Matthew",
            "startChapter": 7,
            "endChapter": 7
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Genesis",
            "startChapter": 26,
            "endChapter": 27
          }
        ],
        "newTestament": [
          {
            "book": "Matthew",
            "startChapter": 8,
            "endChapter": 8
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Genesis",
            "startChapter": 28,
            "endChapter": 30
          }
        ],
        "newTestament": [
          {
            "book": "Matthew",
            "startChapter": 9,
            "endChapter": 9
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Genesis",
            "startChapter": 31,
            "endChapter": 33
          }
        ],
        "newTestament": [
          {
            "book": "Matthew",
            "startChapter": 10,
            "endChapter": 10
          }
        ]
      }
    ]
  },
  {
    "week": 3,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Genesis",
            "startChapter": 34,
            "endChapter": 36
          }
        ],
        "newTestament": [
          {
            "book": "Matthew",
            "startChapter": 11,
            "endChapter": 11
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Genesis",
            "startChapter": 37,
            "endChapter": 39
          }
        ],
        "newTestament": [
          {
            "book": "Matthew",
            "startChapter": 12,
            "endChapter": 12
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Genesis",
            "startChapter": 40,
            "endChapter": 41
          }
        ],
        "newTestament": [
          {
            "book": "Matthew",
            "startChapter": 13,
            "endChapter": 13
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Genesis",
            "startChapter": 42,
            "endChapter": 44
          }
        ],
        "newTestament": [
          {
            "book": "Matthew",
            "startChapter": 14,
            "endChapter": 14
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Genesis",
            "startChapter": 45,
            "endChapter": 47
          }
        ],
        "newTestament": [
          {
            "book": "Matthew",
            "startChapter": 15,
            "endChapter": 15
          }
        ]
      }
    ]
  },
  {
    "week": 4,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Genesis",
            "startChapter": 48,
            "endChapter": 50
          }
        ],
        "newTestament": [
          {
            "book": "Matthew",
            "startChapter": 16,
            "endChapter": 16
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Exodus",
            "startChapter": 1,
            "endChapter": 4
          }
        ],
        "newTestament": [
          {
            "book": "Matthew",
            "startChapter": 17,
            "endChapter": 17
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Exodus",
            "startChapter": 5,
            "endChapter": 7
          }
        ],
        "newTestament": [
          {
            "book": "Matthew",
            "startChapter": 18,
            "endChapter": 18
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Exodus",
            "startChapter": 8,
            "endChapter": 10
          }
        ],
        "newTestament": [
          {
            "book": "Matthew",
            "startChapter": 19,
            "endChapter": 19
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Exodus",
            "startChapter": 11,
            "endChapter": 12
          }
        ],
        "newTestament": [
          {
            "book": "Matthew",
            "startChapter": 20,
            "endChapter": 20
          }
        ]
      }
    ]
  },
  {
    "week": 5,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Exodus",
            "startChapter": 13,
            "endChapter": 15
          }
        ],
        "newTestament": [
          {
            "book": "Matthew",
            "startChapter": 21,
            "endChapter": 21
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Exodus",
            "startChapter": 16,
            "endChapter": 19
          }
        ],
        "newTestament": [
          {
            "book": "Matthew",
            "startChapter": 22,
            "endChapter": 22
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Exodus",
            "startChapter": 20,
            "endChapter": 22
          }
        ],
        "newTestament": [
          {
            "book": "Matthew",
            "startChapter": 23,
            "endChapter": 23
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Exodus",
            "startChapter": 23,
            "endChapter": 25
          }
        ],
        "newTestament": [
          {
            "book": "Matthew",
            "startChapter": 24,
            "endChapter": 24
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Exodus",
            "startChapter": 26,
            "endChapter": 28
          }
        ],
        "newTestament": [
          {
            "book": "Matthew",
            "startChapter": 25,
            "endChapter": 25
          }
        ]
      }
    ]
  },
  {
    "week": 6,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Exodus",
            "startChapter": 29,
            "endChapter": 30
          }
        ],
        "newTestament": [
          {
            "book": "Matthew",
            "startChapter": 26,
            "endChapter": 26
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Exodus",
            "startChapter": 31,
            "endChapter": 33
          }
        ],
        "newTestament": [
          {
            "book": "Matthew",
            "startChapter": 27,
            "endChapter": 27
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Exodus",
            "startChapter": 34,
            "endChapter": 35
          }
        ],
        "newTestament": [
          {
            "book": "Matthew",
            "startChapter": 28,
            "endChapter": 28
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Exodus",
            "startChapter": 36,
            "endChapter": 38
          }
        ],
        "newTestament": [
          {
            "book": "Mark",
            "startChapter": 1,
            "endChapter": 1
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Exodus",
            "startChapter": 39,
            "endChapter": 40
          },
          {
            "book": "Leviticus",
            "startChapter": 1,
            "endChapter": 2
          }
        ],
        "newTestament": [
          {
            "book": "Mark",
            "startChapter": 2,
            "endChapter": 2
          }
        ]
      }
    ]
  },
  {
    "week": 7,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Leviticus",
            "startChapter": 3,
            "endChapter": 5
          }
        ],
        "newTestament": [
          {
            "book": "Mark",
            "startChapter": 3,
            "endChapter": 3
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Leviticus",
            "startChapter": 6,
            "endChapter": 7
          }
        ],
        "newTestament": [
          {
            "book": "Mark",
            "startChapter": 4,
            "endChapter": 4
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Leviticus",
            "startChapter": 8,
            "endChapter": 10
          }
        ],
        "newTestament": [
          {
            "book": "Mark",
            "startChapter": 5,
            "endChapter": 5
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Leviticus",
            "startChapter": 11,
            "endChapter": 13
          }
        ],
        "newTestament": [
          {
            "book": "Mark",
            "startChapter": 6,
            "endChapter": 6
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Leviticus",
            "startChapter": 14,
            "endChapter": 14
          }
        ],
        "newTestament": [
          {
            "book": "Mark",
            "startChapter": 7,
            "endChapter": 7
          }
        ]
      }
    ]
  },
  {
    "week": 8,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Leviticus",
            "startChapter": 15,
            "endChapter": 17
          }
        ],
        "newTestament": [
          {
            "book": "Mark",
            "startChapter": 8,
            "endChapter": 8
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Leviticus",
            "startChapter": 18,
            "endChapter": 20
          }
        ],
        "newTestament": [
          {
            "book": "Mark",
            "startChapter": 9,
            "endChapter": 9
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Leviticus",
            "startChapter": 21,
            "endChapter": 23
          }
        ],
        "newTestament": [
          {
            "book": "Mark",
            "startChapter": 10,
            "endChapter": 10
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Leviticus",
            "startChapter": 24,
            "endChapter": 25
          }
        ],
        "newTestament": [
          {
            "book": "Mark",
            "startChapter": 11,
            "endChapter": 11
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Leviticus",
            "startChapter": 26,
            "endChapter": 27
          }
        ],
        "newTestament": [
          {
            "book": "Mark",
            "startChapter": 12,
            "endChapter": 12
          }
        ]
      }
    ]
  },
  {
    "week": 9,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Numbers",
            "startChapter": 1,
            "endChapter": 2
          }
        ],
        "newTestament": [
          {
            "book": "Mark",
            "startChapter": 13,
            "endChapter": 13
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Numbers",
            "startChapter": 3,
            "endChapter": 4
          }
        ],
        "newTestament": [
          {
            "book": "Mark",
            "startChapter": 14,
            "endChapter": 14
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Numbers",
            "startChapter": 5,
            "endChapter": 6
          }
        ],
        "newTestament": [
          {
            "book": "Mark",
            "startChapter": 15,
            "endChapter": 15
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Numbers",
            "startChapter": 7,
            "endChapter": 9
          }
        ],
        "newTestament": [
          {
            "book": "Mark",
            "startChapter": 16,
            "endChapter": 16
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Numbers",
            "startChapter": 10,
            "endChapter": 12
          }
        ],
        "newTestament": [
          {
            "book": "Luke",
            "startChapter": 1,
            "endChapter": 1
          }
        ]
      }
    ]
  },
  {
    "week": 10,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Numbers",
            "startChapter": 13,
            "endChapter": 14
          }
        ],
        "newTestament": [
          {
            "book": "Luke",
            "startChapter": 2,
            "endChapter": 2
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Numbers",
            "startChapter": 15,
            "endChapter": 17
          }
        ],
        "newTestament": [
          {
            "book": "Luke",
            "startChapter": 3,
            "endChapter": 3
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Numbers",
            "startChapter": 18,
            "endChapter": 20
          }
        ],
        "newTestament": [
          {
            "book": "Luke",
            "startChapter": 4,
            "endChapter": 4
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Numbers",
            "startChapter": 21,
            "endChapter": 22
          }
        ],
        "newTestament": [
          {
            "book": "Luke",
            "startChapter": 5,
            "endChapter": 5
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Numbers",
            "startChapter": 23,
            "endChapter": 25
          }
        ],
        "newTestament": [
          {
            "book": "Luke",
            "startChapter": 6,
            "endChapter": 6
          }
        ]
      }
    ]
  },
  {
    "week": 11,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Numbers",
            "startChapter": 26,
            "endChapter": 28
          }
        ],
        "newTestament": [
          {
            "book": "Luke",
            "startChapter": 7,
            "endChapter": 7
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Numbers",
            "startChapter": 29,
            "endChapter": 31
          }
        ],
        "newTestament": [
          {
            "book": "Luke",
            "startChapter": 8,
            "endChapter": 8
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Numbers",
            "startChapter": 32,
            "endChapter": 33
          }
        ],
        "newTestament": [
          {
            "book": "Luke",
            "startChapter": 9,
            "endChapter": 9
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Numbers",
            "startChapter": 34,
            "endChapter": 36
          }
        ],
        "newTestament": [
          {
            "book": "Luke",
            "startChapter": 10,
            "endChapter": 10
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Deuteronomy",
            "startChapter": 1,
            "endChapter": 2
          }
        ],
        "newTestament": [
          {
            "book": "Luke",
            "startChapter": 11,
            "endChapter": 11
          }
        ]
      }
    ]
  },
  {
    "week": 12,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Deuteronomy",
            "startChapter": 3,
            "endChapter": 4
          }
        ],
        "newTestament": [
          {
            "book": "Luke",
            "startChapter": 12,
            "endChapter": 12
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Deuteronomy",
            "startChapter": 5,
            "endChapter": 7
          }
        ],
        "newTestament": [
          {
            "book": "Luke",
            "startChapter": 13,
            "endChapter": 13
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Deuteronomy",
            "startChapter": 8,
            "endChapter": 10
          }
        ],
        "newTestament": [
          {
            "book": "Luke",
            "startChapter": 14,
            "endChapter": 14
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Deuteronomy",
            "startChapter": 11,
            "endChapter": 13
          }
        ],
        "newTestament": [
          {
            "book": "Luke",
            "startChapter": 15,
            "endChapter": 15
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Deuteronomy",
            "startChapter": 14,
            "endChapter": 16
          }
        ],
        "newTestament": [
          {
            "book": "Luke",
            "startChapter": 16,
            "endChapter": 16
          }
        ]
      }
    ]
  },
  {
    "week": 13,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Deuteronomy",
            "startChapter": 17,
            "endChapter": 20
          }
        ],
        "newTestament": [
          {
            "book": "Luke",
            "startChapter": 17,
            "endChapter": 17
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Deuteronomy",
            "startChapter": 21,
            "endChapter": 23
          }
        ],
        "newTestament": [
          {
            "book": "Luke",
            "startChapter": 18,
            "endChapter": 18
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Deuteronomy",
            "startChapter": 24,
            "endChapter": 27
          }
        ],
        "newTestament": [
          {
            "book": "Luke",
            "startChapter": 19,
            "endChapter": 19
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Deuteronomy",
            "startChapter": 28,
            "endChapter": 28
          }
        ],
        "newTestament": [
          {
            "book": "Luke",
            "startChapter": 20,
            "endChapter": 20
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Deuteronomy",
            "startChapter": 29,
            "endChapter": 31
          }
        ],
        "newTestament": [
          {
            "book": "Luke",
            "startChapter": 21,
            "endChapter": 21
          }
        ]
      }
    ]
  },
  {
    "week": 14,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Deuteronomy",
            "startChapter": 32,
            "endChapter": 33
          }
        ],
        "newTestament": [
          {
            "book": "Luke",
            "startChapter": 22,
            "endChapter": 22
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Deuteronomy",
            "startChapter": 34,
            "endChapter": 34
          },
          {
            "book": "Joshua",
            "startChapter": 1,
            "endChapter": 3
          }
        ],
        "newTestament": [
          {
            "book": "Luke",
            "startChapter": 23,
            "endChapter": 23
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Joshua",
            "startChapter": 4,
            "endChapter": 6
          }
        ],
        "newTestament": [
          {
            "book": "Luke",
            "startChapter": 24,
            "endChapter": 24
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Joshua",
            "startChapter": 7,
            "endChapter": 9
          }
        ],
        "newTestament": [
          {
            "book": "John",
            "startChapter": 1,
            "endChapter": 1
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Joshua",
            "startChapter": 10,
            "endChapter": 11
          }
        ],
        "newTestament": [
          {
            "book": "John",
            "startChapter": 2,
            "endChapter": 2
          }
        ]
      }
    ]
  },
  {
    "week": 15,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Joshua",
            "startChapter": 12,
            "endChapter": 15
          }
        ],
        "newTestament": [
          {
            "book": "John",
            "startChapter": 3,
            "endChapter": 3
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Joshua",
            "startChapter": 16,
            "endChapter": 18
          }
        ],
        "newTestament": [
          {
            "book": "John",
            "startChapter": 4,
            "endChapter": 4
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Joshua",
            "startChapter": 19,
            "endChapter": 21
          }
        ],
        "newTestament": [
          {
            "book": "John",
            "startChapter": 5,
            "endChapter": 5
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Joshua",
            "startChapter": 22,
            "endChapter": 24
          }
        ],
        "newTestament": [
          {
            "book": "John",
            "startChapter": 6,
            "endChapter": 6
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Judges",
            "startChapter": 1,
            "endChapter": 3
          }
        ],
        "newTestament": [
          {
            "book": "John",
            "startChapter": 7,
            "endChapter": 7
          }
        ]
      }
    ]
  },
  {
    "week": 16,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Judges",
            "startChapter": 4,
            "endChapter": 5
          }
        ],
        "newTestament": [
          {
            "book": "John",
            "startChapter": 8,
            "endChapter": 8
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Judges",
            "startChapter": 6,
            "endChapter": 8
          }
        ],
        "newTestament": [
          {
            "book": "John",
            "startChapter": 9,
            "endChapter": 9
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Judges",
            "startChapter": 9,
            "endChapter": 10
          }
        ],
        "newTestament": [
          {
            "book": "John",
            "startChapter": 10,
            "endChapter": 10
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Judges",
            "startChapter": 11,
            "endChapter": 13
          }
        ],
        "newTestament": [
          {
            "book": "John",
            "startChapter": 11,
            "endChapter": 11
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Judges",
            "startChapter": 14,
            "endChapter": 16
          }
        ],
        "newTestament": [
          {
            "book": "John",
            "startChapter": 12,
            "endChapter": 12
          }
        ]
      }
    ]
  },
  {
    "week": 17,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Judges",
            "startChapter": 17,
            "endChapter": 19
          }
        ],
        "newTestament": [
          {
            "book": "John",
            "startChapter": 13,
            "endChapter": 13
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Judges",
            "startChapter": 20,
            "endChapter": 21
          }
        ],
        "newTestament": [
          {
            "book": "John",
            "startChapter": 14,
            "endChapter": 14
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Ruth",
            "startChapter": 1,
            "endChapter": 3
          }
        ],
        "newTestament": [
          {
            "book": "John",
            "startChapter": 15,
            "endChapter": 15
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Ruth",
            "startChapter": 4,
            "endChapter": 4
          },
          {
            "book": "1 Samuel",
            "startChapter": 1,
            "endChapter": 2
          }
        ],
        "newTestament": [
          {
            "book": "John",
            "startChapter": 16,
            "endChapter": 16
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "1 Samuel",
            "startChapter": 3,
            "endChapter": 6
          }
        ],
        "newTestament": [
          {
            "book": "John",
            "startChapter": 17,
            "endChapter": 17
          }
        ]
      }
    ]
  },
  {
    "week": 18,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "1 Samuel",
            "startChapter": 7,
            "endChapter": 9
          }
        ],
        "newTestament": [
          {
            "book": "John",
            "startChapter": 18,
            "endChapter": 18
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "1 Samuel",
            "startChapter": 10,
            "endChapter": 13
          }
        ],
        "newTestament": [
          {
            "book": "John",
            "startChapter": 19,
            "endChapter": 19
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "1 Samuel",
            "startChapter": 14,
            "endChapter": 15
          }
        ],
        "newTestament": [
          {
            "book": "John",
            "startChapter": 20,
            "endChapter": 20
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "1 Samuel",
            "startChapter": 16,
            "endChapter": 17
          }
        ],
        "newTestament": [
          {
            "book": "John",
            "startChapter": 21,
            "endChapter": 21
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "1 Samuel",
            "startChapter": 18,
            "endChapter": 19
          }
        ],
        "newTestament": [
          {
            "book": "Acts",
            "startChapter": 1,
            "endChapter": 1
          }
        ]
      }
    ]
  },
  {
    "week": 19,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "1 Samuel",
            "startChapter": 20,
            "endChapter": 22
          }
        ],
        "newTestament": [
          {
            "book": "Acts",
            "startChapter": 2,
            "endChapter": 2
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "1 Samuel",
            "startChapter": 23,
            "endChapter": 25
          }
        ],
        "newTestament": [
          {
            "book": "Acts",
            "startChapter": 3,
            "endChapter": 3
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "1 Samuel",
            "startChapter": 26,
            "endChapter": 28
          }
        ],
        "newTestament": [
          {
            "book": "Acts",
            "startChapter": 4,
            "endChapter": 4
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "1 Samuel",
            "startChapter": 29,
            "endChapter": 31
          },
          {
            "book": "2 Samuel",
            "startChapter": 1,
            "endChapter": 1
          }
        ],
        "newTestament": [
          {
            "book": "Acts",
            "startChapter": 5,
            "endChapter": 5
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "2 Samuel",
            "startChapter": 2,
            "endChapter": 3
          }
        ],
        "newTestament": [
          {
            "book": "Acts",
            "startChapter": 6,
            "endChapter": 6
          }
        ]
      }
    ]
  },
  {
    "week": 20,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "2 Samuel",
            "startChapter": 4,
            "endChapter": 7
          }
        ],
        "newTestament": [
          {
            "book": "Acts",
            "startChapter": 7,
            "endChapter": 7
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "2 Samuel",
            "startChapter": 8,
            "endChapter": 11
          }
        ],
        "newTestament": [
          {
            "book": "Acts",
            "startChapter": 8,
            "endChapter": 8
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "2 Samuel",
            "startChapter": 12,
            "endChapter": 13
          }
        ],
        "newTestament": [
          {
            "book": "Acts",
            "startChapter": 9,
            "endChapter": 9
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "2 Samuel",
            "startChapter": 14,
            "endChapter": 15
          }
        ],
        "newTestament": [
          {
            "book": "Acts",
            "startChapter": 10,
            "endChapter": 10
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "2 Samuel",
            "startChapter": 16,
            "endChapter": 18
          }
        ],
        "newTestament": [
          {
            "book": "Acts",
            "startChapter": 11,
            "endChapter": 11
          }
        ]
      }
    ]
  },
  {
    "week": 21,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "2 Samuel",
            "startChapter": 19,
            "endChapter": 20
          }
        ],
        "newTestament": [
          {
            "book": "Acts",
            "startChapter": 12,
            "endChapter": 12
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "2 Samuel",
            "startChapter": 21,
            "endChapter": 22
          }
        ],
        "newTestament": [
          {
            "book": "Acts",
            "startChapter": 13,
            "endChapter": 13
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "2 Samuel",
            "startChapter": 23,
            "endChapter": 24
          },
          {
            "book": "1 Kings",
            "startChapter": 1,
            "endChapter": 1
          }
        ],
        "newTestament": [
          {
            "book": "Acts",
            "startChapter": 14,
            "endChapter": 14
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "1 Kings",
            "startChapter": 2,
            "endChapter": 2
          }
        ],
        "newTestament": [
          {
            "book": "Acts",
            "startChapter": 15,
            "endChapter": 15
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "1 Kings",
            "startChapter": 3,
            "endChapter": 6
          }
        ],
        "newTestament": [
          {
            "book": "Acts",
            "startChapter": 16,
            "endChapter": 16
          }
        ]
      }
    ]
  },
  {
    "week": 22,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "1 Kings",
            "startChapter": 7,
            "endChapter": 7
          }
        ],
        "newTestament": [
          {
            "book": "Acts",
            "startChapter": 17,
            "endChapter": 17
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "1 Kings",
            "startChapter": 8,
            "endChapter": 9
          }
        ],
        "newTestament": [
          {
            "book": "Acts",
            "startChapter": 18,
            "endChapter": 18
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "1 Kings",
            "startChapter": 10,
            "endChapter": 11
          }
        ],
        "newTestament": [
          {
            "book": "Acts",
            "startChapter": 19,
            "endChapter": 19
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "1 Kings",
            "startChapter": 12,
            "endChapter": 13
          }
        ],
        "newTestament": [
          {
            "book": "Acts",
            "startChapter": 20,
            "endChapter": 20
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "1 Kings",
            "startChapter": 14,
            "endChapter": 16
          }
        ],
        "newTestament": [
          {
            "book": "Acts",
            "startChapter": 21,
            "endChapter": 21
          }
        ]
      }
    ]
  },
  {
    "week": 23,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "1 Kings",
            "startChapter": 17,
            "endChapter": 18
          }
        ],
        "newTestament": [
          {
            "book": "Acts",
            "startChapter": 22,
            "endChapter": 22
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "1 Kings",
            "startChapter": 19,
            "endChapter": 20
          }
        ],
        "newTestament": [
          {
            "book": "Acts",
            "startChapter": 23,
            "endChapter": 23
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "1 Kings",
            "startChapter": 21,
            "endChapter": 22
          }
        ],
        "newTestament": [
          {
            "book": "Acts",
            "startChapter": 24,
            "endChapter": 24
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "2 Kings",
            "startChapter": 1,
            "endChapter": 3
          }
        ],
        "newTestament": [
          {
            "book": "Acts",
            "startChapter": 25,
            "endChapter": 25
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "2 Kings",
            "startChapter": 4,
            "endChapter": 5
          }
        ],
        "newTestament": [
          {
            "book": "Acts",
            "startChapter": 26,
            "endChapter": 26
          }
        ]
      }
    ]
  },
  {
    "week": 24,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "2 Kings",
            "startChapter": 6,
            "endChapter": 8
          }
        ],
        "newTestament": [
          {
            "book": "Acts",
            "startChapter": 27,
            "endChapter": 27
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "2 Kings",
            "startChapter": 9,
            "endChapter": 10
          }
        ],
        "newTestament": [
          {
            "book": "Acts",
            "startChapter": 28,
            "endChapter": 28
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "2 Kings",
            "startChapter": 11,
            "endChapter": 13
          }
        ],
        "newTestament": [
          {
            "book": "Romans",
            "startChapter": 1,
            "endChapter": 1
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "2 Kings",
            "startChapter": 14,
            "endChapter": 15
          }
        ],
        "newTestament": [
          {
            "book": "Romans",
            "startChapter": 2,
            "endChapter": 2
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "2 Kings",
            "startChapter": 16,
            "endChapter": 17
          }
        ],
        "newTestament": [
          {
            "book": "Romans",
            "startChapter": 3,
            "endChapter": 3
          }
        ]
      }
    ]
  },
  {
    "week": 25,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "2 Kings",
            "startChapter": 18,
            "endChapter": 20
          }
        ],
        "newTestament": [
          {
            "book": "Romans",
            "startChapter": 4,
            "endChapter": 4
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "2 Kings",
            "startChapter": 21,
            "endChapter": 22
          }
        ],
        "newTestament": [
          {
            "book": "Romans",
            "startChapter": 5,
            "endChapter": 5
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "2 Kings",
            "startChapter": 23,
            "endChapter": 25
          }
        ],
        "newTestament": [
          {
            "book": "Romans",
            "startChapter": 6,
            "endChapter": 6
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "1 Chronicles",
            "startChapter": 1,
            "endChapter": 3
          }
        ],
        "newTestament": [
          {
            "book": "Romans",
            "startChapter": 7,
            "endChapter": 7
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "1 Chronicles",
            "startChapter": 4,
            "endChapter": 6
          }
        ],
        "newTestament": [
          {
            "book": "Romans",
            "startChapter": 8,
            "endChapter": 8
          }
        ]
      }
    ]
  },
  {
    "week": 26,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "1 Chronicles",
            "startChapter": 7,
            "endChapter": 9
          }
        ],
        "newTestament": [
          {
            "book": "Romans",
            "startChapter": 9,
            "endChapter": 9
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "1 Chronicles",
            "startChapter": 10,
            "endChapter": 12
          }
        ],
        "newTestament": [
          {
            "book": "Romans",
            "startChapter": 10,
            "endChapter": 10
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "1 Chronicles",
            "startChapter": 13,
            "endChapter": 16
          }
        ],
        "newTestament": [
          {
            "book": "Romans",
            "startChapter": 11,
            "endChapter": 11
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "1 Chronicles",
            "startChapter": 17,
            "endChapter": 20
          }
        ],
        "newTestament": [
          {
            "book": "Romans",
            "startChapter": 12,
            "endChapter": 12
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "1 Chronicles",
            "startChapter": 21,
            "endChapter": 23
          }
        ],
        "newTestament": [
          {
            "book": "Romans",
            "startChapter": 13,
            "endChapter": 13
          }
        ]
      }
    ]
  },
  {
    "week": 27,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "1 Chronicles",
            "startChapter": 24,
            "endChapter": 27
          }
        ],
        "newTestament": [
          {
            "book": "Romans",
            "startChapter": 14,
            "endChapter": 14
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "1 Chronicles",
            "startChapter": 28,
            "endChapter": 29
          },
          {
            "book": "2 Chronicles",
            "startChapter": 1,
            "endChapter": 1
          }
        ],
        "newTestament": [
          {
            "book": "Romans",
            "startChapter": 15,
            "endChapter": 15
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "2 Chronicles",
            "startChapter": 2,
            "endChapter": 5
          }
        ],
        "newTestament": [
          {
            "book": "Romans",
            "startChapter": 16,
            "endChapter": 16
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "2 Chronicles",
            "startChapter": 6,
            "endChapter": 7
          }
        ],
        "newTestament": [
          {
            "book": "1 Corinthians",
            "startChapter": 1,
            "endChapter": 1
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "2 Chronicles",
            "startChapter": 8,
            "endChapter": 11
          }
        ],
        "newTestament": [
          {
            "book": "1 Corinthians",
            "startChapter": 2,
            "endChapter": 2
          }
        ]
      }
    ]
  },
  {
    "week": 28,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "2 Chronicles",
            "startChapter": 12,
            "endChapter": 16
          }
        ],
        "newTestament": [
          {
            "book": "1 Corinthians",
            "startChapter": 3,
            "endChapter": 3
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "2 Chronicles",
            "startChapter": 17,
            "endChapter": 19
          }
        ],
        "newTestament": [
          {
            "book": "1 Corinthians",
            "startChapter": 4,
            "endChapter": 4
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "2 Chronicles",
            "startChapter": 20,
            "endChapter": 23
          }
        ],
        "newTestament": [
          {
            "book": "1 Corinthians",
            "startChapter": 5,
            "endChapter": 5
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "2 Chronicles",
            "startChapter": 24,
            "endChapter": 25
          }
        ],
        "newTestament": [
          {
            "book": "1 Corinthians",
            "startChapter": 6,
            "endChapter": 6
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "2 Chronicles",
            "startChapter": 26,
            "endChapter": 28
          }
        ],
        "newTestament": [
          {
            "book": "1 Corinthians",
            "startChapter": 7,
            "endChapter": 7
          }
        ]
      }
    ]
  },
  {
    "week": 29,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "2 Chronicles",
            "startChapter": 29,
            "endChapter": 31
          }
        ],
        "newTestament": [
          {
            "book": "1 Corinthians",
            "startChapter": 8,
            "endChapter": 8
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "2 Chronicles",
            "startChapter": 32,
            "endChapter": 33
          }
        ],
        "newTestament": [
          {
            "book": "1 Corinthians",
            "startChapter": 9,
            "endChapter": 9
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "2 Chronicles",
            "startChapter": 34,
            "endChapter": 36
          }
        ],
        "newTestament": [
          {
            "book": "1 Corinthians",
            "startChapter": 10,
            "endChapter": 10
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Ezra",
            "startChapter": 1,
            "endChapter": 4
          }
        ],
        "newTestament": [
          {
            "book": "1 Corinthians",
            "startChapter": 11,
            "endChapter": 11
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Ezra",
            "startChapter": 5,
            "endChapter": 7
          }
        ],
        "newTestament": [
          {
            "book": "1 Corinthians",
            "startChapter": 12,
            "endChapter": 12
          }
        ]
      }
    ]
  },
  {
    "week": 30,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Ezra",
            "startChapter": 8,
            "endChapter": 10
          }
        ],
        "newTestament": [
          {
            "book": "1 Corinthians",
            "startChapter": 13,
            "endChapter": 13
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Nehemiah",
            "startChapter": 1,
            "endChapter": 3
          }
        ],
        "newTestament": [
          {
            "book": "1 Corinthians",
            "startChapter": 14,
            "endChapter": 14
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Nehemiah",
            "startChapter": 4,
            "endChapter": 6
          }
        ],
        "newTestament": [
          {
            "book": "1 Corinthians",
            "startChapter": 15,
            "endChapter": 15
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Nehemiah",
            "startChapter": 7,
            "endChapter": 9
          }
        ],
        "newTestament": [
          {
            "book": "1 Corinthians",
            "startChapter": 16,
            "endChapter": 16
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Nehemiah",
            "startChapter": 10,
            "endChapter": 11
          }
        ],
        "newTestament": [
          {
            "book": "2 Corinthians",
            "startChapter": 1,
            "endChapter": 1
          }
        ]
      }
    ]
  },
  {
    "week": 31,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Nehemiah",
            "startChapter": 12,
            "endChapter": 13
          },
          {
            "book": "Esther",
            "startChapter": 1,
            "endChapter": 1
          }
        ],
        "newTestament": [
          {
            "book": "2 Corinthians",
            "startChapter": 2,
            "endChapter": 2
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Esther",
            "startChapter": 2,
            "endChapter": 5
          }
        ],
        "newTestament": [
          {
            "book": "2 Corinthians",
            "startChapter": 3,
            "endChapter": 3
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Esther",
            "startChapter": 6,
            "endChapter": 9
          }
        ],
        "newTestament": [
          {
            "book": "2 Corinthians",
            "startChapter": 4,
            "endChapter": 4
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Esther",
            "startChapter": 10,
            "endChapter": 10
          },
          {
            "book": "Job",
            "startChapter": 1,
            "endChapter": 5
          }
        ],
        "newTestament": [
          {
            "book": "2 Corinthians",
            "startChapter": 5,
            "endChapter": 5
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Job",
            "startChapter": 6,
            "endChapter": 10
          }
        ],
        "newTestament": [
          {
            "book": "2 Corinthians",
            "startChapter": 6,
            "endChapter": 6
          }
        ]
      }
    ]
  },
  {
    "week": 32,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Job",
            "startChapter": 11,
            "endChapter": 16
          }
        ],
        "newTestament": [
          {
            "book": "2 Corinthians",
            "startChapter": 7,
            "endChapter": 7
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Job",
            "startChapter": 17,
            "endChapter": 21
          }
        ],
        "newTestament": [
          {
            "book": "2 Corinthians",
            "startChapter": 8,
            "endChapter": 8
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Job",
            "startChapter": 22,
            "endChapter": 28
          }
        ],
        "newTestament": [
          {
            "book": "2 Corinthians",
            "startChapter": 9,
            "endChapter": 9
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Job",
            "startChapter": 29,
            "endChapter": 32
          }
        ],
        "newTestament": [
          {
            "book": "2 Corinthians",
            "startChapter": 10,
            "endChapter": 10
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Job",
            "startChapter": 33,
            "endChapter": 37
          }
        ],
        "newTestament": [
          {
            "book": "2 Corinthians",
            "startChapter": 11,
            "endChapter": 11
          }
        ]
      }
    ]
  },
  {
    "week": 33,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Job",
            "startChapter": 38,
            "endChapter": 42
          },
          {
            "book": "Psalms",
            "startChapter": 1,
            "endChapter": 1
          }
        ],
        "newTestament": [
          {
            "book": "2 Corinthians",
            "startChapter": 12,
            "endChapter": 12
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Psalms",
            "startChapter": 2,
            "endChapter": 11
          }
        ],
        "newTestament": [
          {
            "book": "2 Corinthians",
            "startChapter": 13,
            "endChapter": 13
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Psalms",
            "startChapter": 12,
            "endChapter": 20
          }
        ],
        "newTestament": [
          {
            "book": "Galatians",
            "startChapter": 1,
            "endChapter": 1
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Psalms",
            "startChapter": 21,
            "endChapter": 29
          }
        ],
        "newTestament": [
          {
            "book": "Galatians",
            "startChapter": 2,
            "endChapter": 2
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Psalms",
            "startChapter": 30,
            "endChapter": 35
          }
        ],
        "newTestament": [
          {
            "book": "Galatians",
            "startChapter": 3,
            "endChapter": 3
          }
        ]
      }
    ]
  },
  {
    "week": 34,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Psalms",
            "startChapter": 36,
            "endChapter": 42
          }
        ],
        "newTestament": [
          {
            "book": "Galatians",
            "startChapter": 4,
            "endChapter": 4
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Psalms",
            "startChapter": 43,
            "endChapter": 50
          }
        ],
        "newTestament": [
          {
            "book": "Galatians",
            "startChapter": 5,
            "endChapter": 5
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Psalms",
            "startChapter": 51,
            "endChapter": 59
          }
        ],
        "newTestament": [
          {
            "book": "Galatians",
            "startChapter": 6,
            "endChapter": 6
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Psalms",
            "startChapter": 60,
            "endChapter": 68
          }
        ],
        "newTestament": [
          {
            "book": "Ephesians",
            "startChapter": 1,
            "endChapter": 1
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Psalms",
            "startChapter": 69,
            "endChapter": 73
          }
        ],
        "newTestament": [
          {
            "book": "Ephesians",
            "startChapter": 2,
            "endChapter": 2
          }
        ]
      }
    ]
  },
  {
    "week": 35,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Psalms",
            "startChapter": 74,
            "endChapter": 79
          }
        ],
        "newTestament": [
          {
            "book": "Ephesians",
            "startChapter": 3,
            "endChapter": 3
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Psalms",
            "startChapter": 80,
            "endChapter": 88
          }
        ],
        "newTestament": [
          {
            "book": "Ephesians",
            "startChapter": 4,
            "endChapter": 4
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Psalms",
            "startChapter": 89,
            "endChapter": 95
          }
        ],
        "newTestament": [
          {
            "book": "Ephesians",
            "startChapter": 5,
            "endChapter": 5
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Psalms",
            "startChapter": 96,
            "endChapter": 104
          }
        ],
        "newTestament": [
          {
            "book": "Ephesians",
            "startChapter": 6,
            "endChapter": 6
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Psalms",
            "startChapter": 105,
            "endChapter": 108
          }
        ],
        "newTestament": [
          {
            "book": "Philippians",
            "startChapter": 1,
            "endChapter": 1
          }
        ]
      }
    ]
  },
  {
    "week": 36,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Psalms",
            "startChapter": 109,
            "endChapter": 118
          }
        ],
        "newTestament": [
          {
            "book": "Philippians",
            "startChapter": 2,
            "endChapter": 2
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Psalms",
            "startChapter": 119,
            "endChapter": 119
          }
        ],
        "newTestament": [
          {
            "book": "Philippians",
            "startChapter": 3,
            "endChapter": 3
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Psalms",
            "startChapter": 120,
            "endChapter": 136
          }
        ],
        "newTestament": [
          {
            "book": "Philippians",
            "startChapter": 4,
            "endChapter": 4
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Psalms",
            "startChapter": 137,
            "endChapter": 146
          }
        ],
        "newTestament": [
          {
            "book": "Colossians",
            "startChapter": 1,
            "endChapter": 1
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Psalms",
            "startChapter": 147,
            "endChapter": 150
          },
          {
            "book": "Proverbs",
            "startChapter": 1,
            "endChapter": 3
          }
        ],
        "newTestament": [
          {
            "book": "Colossians",
            "startChapter": 2,
            "endChapter": 2
          }
        ]
      }
    ]
  },
  {
    "week": 37,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Proverbs",
            "startChapter": 4,
            "endChapter": 9
          }
        ],
        "newTestament": [
          {
            "book": "Colossians",
            "startChapter": 3,
            "endChapter": 3
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Proverbs",
            "startChapter": 10,
            "endChapter": 14
          }
        ],
        "newTestament": [
          {
            "book": "Colossians",
            "startChapter": 4,
            "endChapter": 4
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Proverbs",
            "startChapter": 15,
            "endChapter": 18
          }
        ],
        "newTestament": [
          {
            "book": "1 Thessalonians",
            "startChapter": 1,
            "endChapter": 1
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Proverbs",
            "startChapter": 19,
            "endChapter": 23
          }
        ],
        "newTestament": [
          {
            "book": "1 Thessalonians",
            "startChapter": 2,
            "endChapter": 2
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Proverbs",
            "startChapter": 24,
            "endChapter": 28
          }
        ],
        "newTestament": [
          {
            "book": "1 Thessalonians",
            "startChapter": 3,
            "endChapter": 3
          }
        ]
      }
    ]
  },
  {
    "week": 38,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Proverbs",
            "startChapter": 29,
            "endChapter": 31
          },
          {
            "book": "Ecclesiastes",
            "startChapter": 1,
            "endChapter": 1
          }
        ],
        "newTestament": [
          {
            "book": "1 Thessalonians",
            "startChapter": 4,
            "endChapter": 4
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Ecclesiastes",
            "startChapter": 2,
            "endChapter": 6
          }
        ],
        "newTestament": [
          {
            "book": "1 Thessalonians",
            "startChapter": 5,
            "endChapter": 5
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Ecclesiastes",
            "startChapter": 7,
            "endChapter": 11
          }
        ],
        "newTestament": [
          {
            "book": "2 Thessalonians",
            "startChapter": 1,
            "endChapter": 1
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Ecclesiastes",
            "startChapter": 12,
            "endChapter": 12
          },
          {
            "book": "Song of Solomon",
            "startChapter": 1,
            "endChapter": 6
          }
        ],
        "newTestament": [
          {
            "book": "2 Thessalonians",
            "startChapter": 2,
            "endChapter": 2
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Song of Solomon",
            "startChapter": 7,
            "endChapter": 8
          },
          {
            "book": "Isaiah",
            "startChapter": 1,
            "endChapter": 3
          }
        ],
        "newTestament": [
          {
            "book": "2 Thessalonians",
            "startChapter": 3,
            "endChapter": 3
          }
        ]
      }
    ]
  },
  {
    "week": 39,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Isaiah",
            "startChapter": 4,
            "endChapter": 7
          }
        ],
        "newTestament": [
          {
            "book": "1 Timothy",
            "startChapter": 1,
            "endChapter": 1
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Isaiah",
            "startChapter": 8,
            "endChapter": 11
          }
        ],
        "newTestament": [
          {
            "book": "1 Timothy",
            "startChapter": 2,
            "endChapter": 2
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Isaiah",
            "startChapter": 12,
            "endChapter": 16
          }
        ],
        "newTestament": [
          {
            "book": "1 Timothy",
            "startChapter": 3,
            "endChapter": 3
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Isaiah",
            "startChapter": 17,
            "endChapter": 21
          }
        ],
        "newTestament": [
          {
            "book": "1 Timothy",
            "startChapter": 4,
            "endChapter": 4
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Isaiah",
            "startChapter": 22,
            "endChapter": 26
          }
        ],
        "newTestament": [
          {
            "book": "1 Timothy",
            "startChapter": 5,
            "endChapter": 5
          }
        ]
      }
    ]
  },
  {
    "week": 40,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Isaiah",
            "startChapter": 27,
            "endChapter": 29
          }
        ],
        "newTestament": [
          {
            "book": "1 Timothy",
            "startChapter": 6,
            "endChapter": 6
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Isaiah",
            "startChapter": 30,
            "endChapter": 34
          }
        ],
        "newTestament": [
          {
            "book": "2 Timothy",
            "startChapter": 1,
            "endChapter": 1
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Isaiah",
            "startChapter": 35,
            "endChapter": 37
          }
        ],
        "newTestament": [
          {
            "book": "2 Timothy",
            "startChapter": 2,
            "endChapter": 2
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Isaiah",
            "startChapter": 38,
            "endChapter": 41
          }
        ],
        "newTestament": [
          {
            "book": "2 Timothy",
            "startChapter": 3,
            "endChapter": 3
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Isaiah",
            "startChapter": 42,
            "endChapter": 44
          }
        ],
        "newTestament": [
          {
            "book": "2 Timothy",
            "startChapter": 4,
            "endChapter": 4
          }
        ]
      }
    ]
  },
  {
    "week": 41,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Isaiah",
            "startChapter": 45,
            "endChapter": 48
          }
        ],
        "newTestament": [
          {
            "book": "Titus",
            "startChapter": 1,
            "endChapter": 1
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Isaiah",
            "startChapter": 49,
            "endChapter": 52
          }
        ],
        "newTestament": [
          {
            "book": "Titus",
            "startChapter": 2,
            "endChapter": 2
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Isaiah",
            "startChapter": 53,
            "endChapter": 57
          }
        ],
        "newTestament": [
          {
            "book": "Titus",
            "startChapter": 3,
            "endChapter": 3
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Isaiah",
            "startChapter": 58,
            "endChapter": 62
          }
        ],
        "newTestament": [
          {
            "book": "Philemon",
            "startChapter": 1,
            "endChapter": 1
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Isaiah",
            "startChapter": 63,
            "endChapter": 66
          }
        ],
        "newTestament": [
          {
            "book": "Hebrews",
            "startChapter": 1,
            "endChapter": 1
          }
        ]
      }
    ]
  },
  {
    "week": 42,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Jeremiah",
            "startChapter": 1,
            "endChapter": 3
          }
        ],
        "newTestament": [
          {
            "book": "Hebrews",
            "startChapter": 2,
            "endChapter": 2
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Jeremiah",
            "startChapter": 4,
            "endChapter": 5
          }
        ],
        "newTestament": [
          {
            "book": "Hebrews",
            "startChapter": 3,
            "endChapter": 3
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Jeremiah",
            "startChapter": 6,
            "endChapter": 8
          }
        ],
        "newTestament": [
          {
            "book": "Hebrews",
            "startChapter": 4,
            "endChapter": 4
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Jeremiah",
            "startChapter": 9,
            "endChapter": 11
          }
        ],
        "newTestament": [
          {
            "book": "Hebrews",
            "startChapter": 5,
            "endChapter": 5
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Jeremiah",
            "startChapter": 12,
            "endChapter": 15
          }
        ],
        "newTestament": [
          {
            "book": "Hebrews",
            "startChapter": 6,
            "endChapter": 6
          }
        ]
      }
    ]
  },
  {
    "week": 43,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Jeremiah",
            "startChapter": 16,
            "endChapter": 18
          }
        ],
        "newTestament": [
          {
            "book": "Hebrews",
            "startChapter": 7,
            "endChapter": 7
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Jeremiah",
            "startChapter": 19,
            "endChapter": 22
          }
        ],
        "newTestament": [
          {
            "book": "Hebrews",
            "startChapter": 8,
            "endChapter": 8
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Jeremiah",
            "startChapter": 23,
            "endChapter": 25
          }
        ],
        "newTestament": [
          {
            "book": "Hebrews",
            "startChapter": 9,
            "endChapter": 9
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Jeremiah",
            "startChapter": 26,
            "endChapter": 27
          }
        ],
        "newTestament": [
          {
            "book": "Hebrews",
            "startChapter": 10,
            "endChapter": 10
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Jeremiah",
            "startChapter": 28,
            "endChapter": 30
          }
        ],
        "newTestament": [
          {
            "book": "Hebrews",
            "startChapter": 11,
            "endChapter": 11
          }
        ]
      }
    ]
  },
  {
    "week": 44,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Jeremiah",
            "startChapter": 31,
            "endChapter": 32
          }
        ],
        "newTestament": [
          {
            "book": "Hebrews",
            "startChapter": 12,
            "endChapter": 12
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Jeremiah",
            "startChapter": 33,
            "endChapter": 35
          }
        ],
        "newTestament": [
          {
            "book": "Hebrews",
            "startChapter": 13,
            "endChapter": 13
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Jeremiah",
            "startChapter": 36,
            "endChapter": 37
          }
        ],
        "newTestament": [
          {
            "book": "James",
            "startChapter": 1,
            "endChapter": 1
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Jeremiah",
            "startChapter": 38,
            "endChapter": 41
          }
        ],
        "newTestament": [
          {
            "book": "James",
            "startChapter": 2,
            "endChapter": 2
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Jeremiah",
            "startChapter": 42,
            "endChapter": 44
          }
        ],
        "newTestament": [
          {
            "book": "James",
            "startChapter": 3,
            "endChapter": 3
          }
        ]
      }
    ]
  },
  {
    "week": 45,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Jeremiah",
            "startChapter": 45,
            "endChapter": 48
          }
        ],
        "newTestament": [
          {
            "book": "James",
            "startChapter": 4,
            "endChapter": 4
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Jeremiah",
            "startChapter": 49,
            "endChapter": 50
          }
        ],
        "newTestament": [
          {
            "book": "James",
            "startChapter": 5,
            "endChapter": 5
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Jeremiah",
            "startChapter": 51,
            "endChapter": 51
          }
        ],
        "newTestament": [
          {
            "book": "1 Peter",
            "startChapter": 1,
            "endChapter": 1
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Jeremiah",
            "startChapter": 52,
            "endChapter": 52
          },
          {
            "book": "Lamentations",
            "startChapter": 1,
            "endChapter": 1
          }
        ],
        "newTestament": [
          {
            "book": "1 Peter",
            "startChapter": 2,
            "endChapter": 2
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Lamentations",
            "startChapter": 2,
            "endChapter": 5
          }
        ],
        "newTestament": [
          {
            "book": "1 Peter",
            "startChapter": 3,
            "endChapter": 3
          }
        ]
      }
    ]
  },
  {
    "week": 46,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Ezekiel",
            "startChapter": 1,
            "endChapter": 3
          }
        ],
        "newTestament": [
          {
            "book": "1 Peter",
            "startChapter": 4,
            "endChapter": 4
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Ezekiel",
            "startChapter": 4,
            "endChapter": 7
          }
        ],
        "newTestament": [
          {
            "book": "1 Peter",
            "startChapter": 5,
            "endChapter": 5
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Ezekiel",
            "startChapter": 8,
            "endChapter": 11
          }
        ],
        "newTestament": [
          {
            "book": "2 Peter",
            "startChapter": 1,
            "endChapter": 1
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Ezekiel",
            "startChapter": 12,
            "endChapter": 14
          }
        ],
        "newTestament": [
          {
            "book": "2 Peter",
            "startChapter": 2,
            "endChapter": 2
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Ezekiel",
            "startChapter": 15,
            "endChapter": 16
          }
        ],
        "newTestament": [
          {
            "book": "2 Peter",
            "startChapter": 3,
            "endChapter": 3
          }
        ]
      }
    ]
  },
  {
    "week": 47,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Ezekiel",
            "startChapter": 17,
            "endChapter": 19
          }
        ],
        "newTestament": [
          {
            "book": "1 John",
            "startChapter": 1,
            "endChapter": 1
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Ezekiel",
            "startChapter": 20,
            "endChapter": 21
          }
        ],
        "newTestament": [
          {
            "book": "1 John",
            "startChapter": 2,
            "endChapter": 2
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Ezekiel",
            "startChapter": 22,
            "endChapter": 24
          }
        ],
        "newTestament": [
          {
            "book": "1 John",
            "startChapter": 3,
            "endChapter": 3
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Ezekiel",
            "startChapter": 25,
            "endChapter": 27
          }
        ],
        "newTestament": [
          {
            "book": "1 John",
            "startChapter": 4,
            "endChapter": 4
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Ezekiel",
            "startChapter": 28,
            "endChapter": 30
          }
        ],
        "newTestament": [
          {
            "book": "1 John",
            "startChapter": 5,
            "endChapter": 5
          }
        ]
      }
    ]
  },
  {
    "week": 48,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Ezekiel",
            "startChapter": 31,
            "endChapter": 32
          }
        ],
        "newTestament": [
          {
            "book": "2 John",
            "startChapter": 1,
            "endChapter": 1
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Ezekiel",
            "startChapter": 33,
            "endChapter": 35
          }
        ],
        "newTestament": [
          {
            "book": "3 John",
            "startChapter": 1,
            "endChapter": 1
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Ezekiel",
            "startChapter": 36,
            "endChapter": 38
          }
        ],
        "newTestament": [
          {
            "book": "Jude",
            "startChapter": 1,
            "endChapter": 1
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Ezekiel",
            "startChapter": 39,
            "endChapter": 40
          }
        ],
        "newTestament": [
          {
            "book": "Revelation",
            "startChapter": 1,
            "endChapter": 1
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Ezekiel",
            "startChapter": 41,
            "endChapter": 43
          }
        ],
        "newTestament": [
          {
            "book": "Revelation",
            "startChapter": 2,
            "endChapter": 2
          }
        ]
      }
    ]
  },
  {
    "week": 49,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Ezekiel",
            "startChapter": 44,
            "endChapter": 45
          }
        ],
        "newTestament": [
          {
            "book": "Revelation",
            "startChapter": 3,
            "endChapter": 3
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Ezekiel",
            "startChapter": 46,
            "endChapter": 48
          }
        ],
        "newTestament": [
          {
            "book": "Revelation",
            "startChapter": 4,
            "endChapter": 4
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Daniel",
            "startChapter": 1,
            "endChapter": 2
          }
        ],
        "newTestament": [
          {
            "book": "Revelation",
            "startChapter": 5,
            "endChapter": 5
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Daniel",
            "startChapter": 3,
            "endChapter": 4
          }
        ],
        "newTestament": [
          {
            "book": "Revelation",
            "startChapter": 6,
            "endChapter": 6
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Daniel",
            "startChapter": 5,
            "endChapter": 6
          }
        ],
        "newTestament": [
          {
            "book": "Revelation",
            "startChapter": 7,
            "endChapter": 7
          }
        ]
      }
    ]
  },
  {
    "week": 50,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Daniel",
            "startChapter": 7,
            "endChapter": 9
          }
        ],
        "newTestament": [
          {
            "book": "Revelation",
            "startChapter": 8,
            "endChapter": 8
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Daniel",
            "startChapter": 10,
            "endChapter": 11
          }
        ],
        "newTestament": [
          {
            "book": "Revelation",
            "startChapter": 9,
            "endChapter": 9
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Daniel",
            "startChapter": 12,
            "endChapter": 12
          },
          {
            "book": "Hosea",
            "startChapter": 1,
            "endChapter": 4
          }
        ],
        "newTestament": [
          {
            "book": "Revelation",
            "startChapter": 10,
            "endChapter": 10
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Hosea",
            "startChapter": 5,
            "endChapter": 10
          }
        ],
        "newTestament": [
          {
            "book": "Revelation",
            "startChapter": 11,
            "endChapter": 11
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Hosea",
            "startChapter": 11,
            "endChapter": 14
          },
          {
            "book": "Joel",
            "startChapter": 1,
            "endChapter": 2
          }
        ],
        "newTestament": [
          {
            "book": "Revelation",
            "startChapter": 12,
            "endChapter": 12
          }
        ]
      }
    ]
  },
  {
    "week": 51,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Joel",
            "startChapter": 3,
            "endChapter": 3
          },
          {
            "book": "Amos",
            "startChapter": 1,
            "endChapter": 4
          }
        ],
        "newTestament": [
          {
            "book": "Revelation",
            "startChapter": 13,
            "endChapter": 13
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Amos",
            "startChapter": 5,
            "endChapter": 8
          }
        ],
        "newTestament": [
          {
            "book": "Revelation",
            "startChapter": 14,
            "endChapter": 14
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Amos",
            "startChapter": 9,
            "endChapter": 9
          },
          {
            "book": "Obadiah",
            "startChapter": 1,
            "endChapter": 1
          },
          {
            "book": "Jonah",
            "startChapter": 1,
            "endChapter": 4
          }
        ],
        "newTestament": [
          {
            "book": "Revelation",
            "startChapter": 15,
            "endChapter": 15
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Micah",
            "startChapter": 1,
            "endChapter": 6
          }
        ],
        "newTestament": [
          {
            "book": "Revelation",
            "startChapter": 16,
            "endChapter": 16
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Micah",
            "startChapter": 7,
            "endChapter": 7
          },
          {
            "book": "Nahum",
            "startChapter": 1,
            "endChapter": 3
          },
          {
            "book": "Habakkuk",
            "startChapter": 1,
            "endChapter": 1
          }
        ],
        "newTestament": [
          {
            "book": "Revelation",
            "startChapter": 17,
            "endChapter": 17
          }
        ]
      }
    ]
  },
  {
    "week": 52,
    "days": [
      {
        "day": 1,
        "oldTestament": [
          {
            "book": "Habakkuk",
            "startChapter": 2,
            "endChapter": 3
          },
          {
            "book": "Zephaniah",
            "startChapter": 1,
            "endChapter": 3
          }
        ],
        "newTestament": [
          {
            "book": "Revelation",
            "startChapter": 18,
            "endChapter": 18
          }
        ]
      },
      {
        "day": 2,
        "oldTestament": [
          {
            "book": "Haggai",
            "startChapter": 1,
            "endChapter": 2
          },
          {
            "book": "Zechariah",
            "startChapter": 1,
            "endChapter": 2
          }
        ],
        "newTestament": [
          {
            "book": "Revelation",
            "startChapter": 19,
            "endChapter": 19
          }
        ]
      },
      {
        "day": 3,
        "oldTestament": [
          {
            "book": "Zechariah",
            "startChapter": 3,
            "endChapter": 8
          }
        ],
        "newTestament": [
          {
            "book": "Revelation",
            "startChapter": 20,
            "endChapter": 20
          }
        ]
      },
      {
        "day": 4,
        "oldTestament": [
          {
            "book": "Zechariah",
            "startChapter": 9,
            "endChapter": 13
          }
        ],
        "newTestament": [
          {
            "book": "Revelation",
            "startChapter": 21,
            "endChapter": 21
          }
        ]
      },
      {
        "day": 5,
        "oldTestament": [
          {
            "book": "Zechariah",
            "startChapter": 14,
            "endChapter": 14
          },
          {
            "book": "Malachi",
            "startChapter": 1,
            "endChapter": 4
          }
        ],
        "newTestament": [
          {
            "book": "Revelation",
            "startChapter": 22,
            "endChapter": 22
          }
        ]
      }
    ]
  }
];
