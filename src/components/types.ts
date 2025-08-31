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

