import * as cognito from "@aws-sdk/client-cognito-identity-provider";
import { PostConfirmationConfirmSignUpTriggerEvent } from "aws-lambda";
import { makeGraphQLRequest } from "../utils";
import { makeRestRequest } from "../utils";
type CreateTodoInput = {
  UserID: string;
  title: string;
};
type CreateTodoResponse = {
  UserID: string;
  TodoID: string;
  title: string;
  completed: boolean;
};

const cognitoClient = new cognito.CognitoIdentityProviderClient({
  region: "ap-south-1",
});
export const a_user_signs_up = async (
  password: string,
  email: string,
  name: string
): Promise<string> => {
  const userPoolId = process.env.ID_USER_POOL;
  const clientId = process.env.CLIENT_USER_POOL_ID;
  const username = email;

  console.log(`[${email}] - signing up...`);

  const command = new cognito.SignUpCommand({
    ClientId: clientId,
    Username: username,
    Password: password,
    UserAttributes: [{ Name: "name", Value: name }],
  });

  const signUpResponse = await cognitoClient.send(command);
  const userSub = signUpResponse.UserSub;

  const adminCommand: cognito.AdminConfirmSignUpCommandInput = {
    UserPoolId: userPoolId as string,
    Username: userSub as string,
  };

  await cognitoClient.send(new cognito.AdminConfirmSignUpCommand(adminCommand));

  console.log(`[${email}] - confirmed sign up`);

  return userSub as string;
};

export const user_creates_a_todo = async (
  user: any,
  todoData: CreateTodoInput
): Promise<CreateTodoResponse> => {
  const createTodoMutation = `mutation CreateTodo($input: CreateTodoInput!) {
    createTodo(input: $input) {
      UserID
      TodoID
      title
      completed
    }
  }`;
  const variables = {
    input: todoData,
  };

  let result: any;
  try {
    result = await makeGraphQLRequest(
      createTodoMutation,
      variables,
      user.accessToken
    );
  } catch (err: unknown) {
    if (err instanceof Error) throw err.message;
    throw new Error("Error at the time of making graphql request");
  }

  console.log(`[${user.username}] - Created a todo`);

  console.log("result ", result);

  return result.createTodo as CreateTodoResponse;
};

export const user_calls_listTodos = async (user: any): Promise<any> => {
  const listTodosQuery = `
  query ListTodos($UserID: ID!) {
    listTodos(UserID: $UserID) {
      UserID
      TodoID
      title
      completed
    }
  }
`;
  const variables = {
    UserID: user.username,
  };

  let result: any;
  try {
    result = await makeGraphQLRequest(
      listTodosQuery,
      variables,
      user.accessToken
    );
  } catch (err: unknown) {
    if (err instanceof Error) throw err.message;
    throw new Error("Error at the time of making graphql request");
  }

  console.log(`[${user.username}] - Listed todos`);

  console.log("result ", result);

  return result.listTodos;
};

export const user_calls_deleteTodo = async (
  user: any,
  title: string
): Promise<boolean> => {
  const deleteTodoMutation = `
  mutation DeleteTodo($input: DeleteTodoInput!) {
    deleteTodo(input: $input)
  }
`;
  const variables = {
    input: {
      UserID: user.username,
      title: title,
    },
  };

  let result: any;
  try {
    result = await makeGraphQLRequest(
      deleteTodoMutation,
      variables,
      user.accessToken
    );
  } catch (err: unknown) {
    if (err instanceof Error) throw err.message;
    throw new Error("Error at the time of making graphql request");
  }

  console.log(`[${user.username}] - Deleted a todo`);

  console.log("result ", result);

  return result.deleteTodo;
};

export const user_calls_updateTodo = async (
  user: any,
  title: string
): Promise<boolean> => {
  const updateTodoMutation = `
  mutation UpdateTodo($input: UpdateTodoInput!) {
    updateTodo(input: $input)
  }
`;
  const variables = {
    input: {
      UserID: user.username,
      title: title,
    },
  };

  let result: any;
  try {
    result = await makeGraphQLRequest(
      updateTodoMutation,
      variables,
      user.accessToken
    );
  } catch (err: unknown) {
    if (err instanceof Error) throw err.message;
    throw new Error("Error at the time of making graphql request");
  }

  console.log(`[${user.username}] - Updated a todo`);

  console.log("result ", result);

  return result.updateTodo;
};
