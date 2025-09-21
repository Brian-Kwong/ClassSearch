export type SearchParamJSON = {
  subjects: [
    {
      subject: string;
      descr: string;
    },
  ];
  crse_attrs: [
    {
      crse_attr: string;
      descr: string;
      values: [
        {
          crse_attr_value: string;
          descr: string;
        },
      ];
    },
  ];
  instruct_modes: [
    {
      instruction_mode: string;
      descr: string;
    },
  ];
  search_start_time: string;
  search_end_time: string;
  selected_term: string;
  class_search_fields: [
    {
      INSTITUTION: string;
    },
  ];
};

export type UserSearchRequestTypes = {
  subject: string[];
  courseCatalogNum: string[];
  courseAttributes: string[];
  dayOfTheWeek: string[];
  numberOfUnits: string[];
  startTime: string[];
  endTime: string[];
  instructMode: string[];
  instructorFirstName: string[];
  instructorLastName: string[];
  instructorScore: string;
  searchTerm: string[];
};

export type UniversityCourseResponse = {
  index: number;
  crse_id: string;
  strm: string; // Term
  session_descr: string;
  class_section: string;
  class_nbr: string;
  location_descr: string;
  start_dt: string;
  end_dt: string;
  campus_descr: string;
  acad_career_descr: string;
  component: string;
  subject: string;
  subject_descr: string;
  catalog_nbr: string;
  instruction_mode: string;
  instruction_mode_descr: string;
  grading_basis: string;
  wait_tot: number;
  wait_cap: number;
  class_capacity: number;
  enrollment_total: number;
  enrollment_available: number;
  descr: string;
  units: string;
  combined_section: string;
  enrl_stat_descr: string;
  topic: string;
  instructors: Array<{
    name: string;
    email: string;
  }>;
  section_type: string;
  meetings: Array<{
    days: string;
    start_time: string;
    end_time: string;
    start_dt: string;
    end_dt: string;
    bldg_cd: string;
    facility_descr: string;
    room: string;
    facility_id: string;
    instructor: string;
  }>;
  crse_attr: string;
  crse_attr_value: string;
  reserve_caps: Array<unknown>;
  isInCart: boolean;
  isEnrolled: boolean;
  isWaitlisted: boolean;
  notes: Array<unknown>;
  icons: Array<unknown>;
};

export type UniversityCourseDetailsResponse = {
  section_info: {
    enroll_dates?: {
      open_date: string;
      close_date: string;
    };
    catalog_descr: {
      crse_catalog_description: string;
    };
    notes: {
      class_notes: string;
    };
    enrollment_information: {
      enroll_requirements: string;
    };
  };
};

export type iconModelDBEntry = {
  lib: string;
  name: string;
  aliases: string;
  text: string;
  vector: number[];
};

export type SchoolSearchResponse = {
  data: {
    newSearch: {
      schools: {
        edges: {
          node: {
            id: string;
            name: string;
            departments?: {
              id: string;
              name: string;
            }[];
          };
        }[];
      };
    };
  };
};

export type rateMyProfessorTeacherSearchResponse = {
  data: {
    search: {
      teachers: {
        edges: {
          cursor: string;
          node: TeacherRatings;
        }[];
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string | null;
        };
      };
    };
  };
};

export type polyRatingProfessorTeacherSearchResponse = {
  result: {
    data: {
      id: string;
      firstName: string;
      lastName: string;
      department: string;
      numEvals: number;
      overallRating: number;
    }[];
  };
};

export type TeacherRatings = {
  id: string;
  firstName: string;
  lastName: string;
  department: string;
  avgRating: number;
  numRatings: number;
};
