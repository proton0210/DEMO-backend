import {
  DynamoDBClient,
  PutItemCommand,
  PutItemCommandInput,
} from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { AppSyncResolverEvent } from "aws-lambda";
import { ulid } from "ulidx";
const client = new DynamoDBClient({ region: "ap-south-1" });
const TABLE_NAME = "Todos";

export const handler = async (event: AppSyncResolverEvent<any>) => {
  console.log(JSON.stringify(event, null, 2));
  const { UserID, title } = event.arguments.input;
  const TodoID = ulid();

  const params: PutItemCommandInput = {
    TableName: TABLE_NAME,
    Item: marshall({
      UserID,
      TodoID,
      title,
      completed: false,
    }),
    ConditionExpression:
      "attribute_not_exists(userId) AND attribute_not_exists(todoId)",
  };

  try {
    await client.send(new PutItemCommand(params));
    return {
      UserID,
      TodoID,
      title,
      completed: false,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
