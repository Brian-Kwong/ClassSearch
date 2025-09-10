import { parentPort, workerData } from "worker_threads";
import {
  SchoolSearchResponse,
  TeacherSearchResponse,
} from "./components/types";

const RATE_MY_PROFESSOR_API_URL = "https://www.ratemyprofessors.com/graphql";

const fetchSchoolData = async (
  school: string,
  withDepartment: boolean = false,
) => {
  const query = ` query NewSearchSchoolsQuery($query: SchoolSearchQuery!) {
  newSearch {
    schools(query: $query, first: 10) {
      edges {
        node {
          id
          name
          ${
            withDepartment
              ? `departments {
            id
            name
          }`
              : ""
          }
        }
      }
    }
  }
}
`;
  const variables = {
    query: {
      text: school,
    },
  
  const response = await fetch(RATE_MY_PROFESSOR_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic dGVzdDp0ZXN0",
    },
    body: JSON.stringify({ query, variables }),
  });
  if (response.ok) {
    try {
      const data: SchoolSearchResponse = await response.json();
      if (data.data.newSearch.schools.edges.length > 0) {
        const matchedSchool = data.data.newSearch.schools.edges[0];
        return matchedSchool.node;
      }
      throw new Error(
        "The requested university was not found on RateMyProfessors.com",
      );
    } catch (error) {
      console.error("Error parsing JSON response:", error);
      throw new Error(
        "Failed to parse university response from RateMyProfessors.com",
      );
    }
  }
  throw new Error(
    `Failed to fetch university information.  While fetching the following error was raised ${response.statusText}`,
  );


const fetchProfessorData = async (
  schoolId: string,
  departmentId?: string,
  professorName?: string,
) => {
  const query = ` query TeacherList($query: TeacherSearchQuery!, $after: String) {
  search: newSearch {
    teachers(query: $query, first: 50, after: $after) {
      edges {
        cursor
        node {
          id
          firstName
          lastName
          department
          avgRating
          numRatings
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}
  `;
  const variables: {
    query: {
      schoolID: string;
      departmentID?: string;
      text?: string;
    
    after: string | null;
  } = {
    query: {
      schoolID: schoolId,
      departmentID: departmentId,
      text: professorName,
    },
    after: null,
  
  const response = await fetch(RATE_MY_PROFESSOR_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic dGVzdDp0ZXN0",
    },
    body: JSON.stringify({ query, variables }),
  });
  if (response.ok) {
    try {
      const data: TeacherSearchResponse = await response.json();
      const results: TeacherSearchResponse["data"]["search"]["teachers"]["edges"][number]["node"][] =
        data.data.search.teachers.edges.map((edge) => edge.node);
      // If there is more continue fetching
      let pageInfo = data.data.search.teachers.pageInfo;
      while (pageInfo.hasNextPage) {
        variables.after = pageInfo.endCursor;
        const nextPageResponse = await fetch(RATE_MY_PROFESSOR_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Basic dGVzdDp0ZXN0",
          },
          body: JSON.stringify({ query, variables }),
        });
        if (nextPageResponse.ok) {
          const nextPageData: TeacherSearchResponse =
            await nextPageResponse.json();
          results.push(
            ...nextPageData.data.search.teachers.edges.map((edge) => edge.node),
          );
          pageInfo = nextPageData.data.search.teachers.pageInfo;
        } else {
          throw new Error(
            `Failed to fetch additional professor information. While fetching the following error was raised ${nextPageResponse.statusText}`,
          );
        }
      }
      if (results.length > 0) {
        return results;
      }
      throw new Error("No professors found");
    } catch (error) {
      console.error("Error parsing JSON response:", error);
      throw new Error(
        "Failed to parse professor response from RateMyProfessors.com",
      );
    }
  }
  throw new Error(
    `Failed to fetch professor information. While fetching the following error was raised ${response.statusText}`,
  );


if (parentPort) {
  parentPort.on("message", async (message) => {
    if (message.type === "query") {
      const school = workerData.school;
      const schoolData = await fetchSchoolData(school);
      const professors = await fetchProfessorData(schoolData.id);
      const professorMap = new Map<string, (typeof professors)[number]>();
      professors
        .filter((professor) => professor.numRatings > 0)
        .forEach((professor) => {
          const fullName = `${professor.firstName} ${professor.lastName}`;
          if (!professorMap.has(fullName)) {
            professorMap.set(fullName, professor);
          }
        });
      parentPort?.postMessage({ type: "result", data: professorMap });
    }
  });
}
