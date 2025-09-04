***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
    "https://cmsweb.csulongbeach.edu/psc/CLBPRD/",
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***


export type SearchParamJson = {
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
  availableCourseNumbers: string[];


export type UniversityCourseResponse = {
  index: number;
  crse_id: string;
  strm: string; // Term
  session_descr: string;
  class_section: string;
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

