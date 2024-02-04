import { GraphQLClient } from "graphql-request";

const client = new GraphQLClient(process.env.GRAPHQL_URL as string);

export const makeGraphQLRequest = async (
  query: string,
  variables = {},
  accessToken: string
) => {
  client.setHeader("Authorization", `${accessToken}`);
  try {
    return await client.request(query, variables);
  } catch (err) {
    throw err;
  }
};

// API Gateway

import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

type METHOD = "GET" | "POST" | "PUT" | "DELETE";

export async function makeRestRequest<T = any>(
  method: METHOD,
  token: string,
  body?: any,
  queryString?: string
): Promise<T> {
  let fullUrl = "";
  if (queryString) {
    fullUrl = (process.env.REST_URL as string) + `?${queryString}`;
    console.log("Query URl: ", fullUrl);
  } else {
    fullUrl = process.env.REST_URL as string;
  }

  const headers = {
    Authorization: `Bearer ${token}`,
  };
  // add querry string parameter if methos is GET

  const axiosConfig: AxiosRequestConfig = {
    method,
    url: fullUrl,
    headers,
    data: body, // Include request body
  };

  try {
    const response: AxiosResponse<T> = await axios(axiosConfig);
    return response.data;
  } catch (error: any) {
    handleAxiosError(error);
    throw error; // Rethrow the error after handling
  }
}

function handleAxiosError(error: AxiosError) {
  if (error.response) {
    // The request was made and the server responded with a status code
    console.error("Response error:", error.response.status);
  } else if (error.request) {
    // The request was made but no response was received
    console.error("Request error:", error.request);
  } else {
    // Something happened in setting up the request that triggered an error
    console.error("Error:", error.message);
  }
}

// Example usage:
// async function fetchData(token: string) {
//   const options: RequestOptions = {
//     token,
//   };

//   try {
//     const data = await makeRequest<any>("GET", options);
//     console.log("Data:", data);
//   } catch (error) {
//     console.error("Failed to fetch data:", error);
//   }
// }

// // Call the function with a token
// const token = "your_access_token_here";
// fetchData(token);
