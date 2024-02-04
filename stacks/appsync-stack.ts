import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import { UserPool } from "aws-cdk-lib/aws-cognito";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import * as awsAppsync from "aws-cdk-lib/aws-appsync";
import * as path from "path";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";

interface AppsyncStackProps extends cdk.StackProps {
  userpool: UserPool;
  TodoDB: Table;
  userDB: Table;
  createTodoFunc: NodejsFunction;
  listTodosFunc: NodejsFunction;
  deleteTodoFunc: NodejsFunction;
  updateTodoFunc: NodejsFunction;
}

export class AppsyncStack extends cdk.Stack {
  public readonly api: awsAppsync.IGraphqlApi;

  constructor(scope: Construct, id: string, props: AppsyncStackProps) {
    super(scope, id, props);
    this.api = this.createAppsyncAPI(props);
    this.createTodoResolver(scope, props, this.api);
    this.listTodosResolver(scope, props, this.api);
    this.deleteTodoResolver(scope, props, this.api);
    this.updateTodoResolver(scope, props, this.api);
  }

  createAppsyncAPI(props: AppsyncStackProps) {
    const api = new awsAppsync.GraphqlApi(this, "TodoAppsyncAPI", {
      name: `TodoAppsyncAPI`,
      definition: awsAppsync.Definition.fromFile(
        path.join(__dirname, "../graphql/schema.graphql")
      ),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: awsAppsync.AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool: props.userpool,
          },
        },
        additionalAuthorizationModes: [
          {
            authorizationType: awsAppsync.AuthorizationType.IAM,
          },
        ],
      },
      logConfig: {
        fieldLogLevel: awsAppsync.FieldLogLevel.ALL,
      },
    });

    new cdk.CfnOutput(this, "GraphQLAPIURL", {
      value: api.graphqlUrl,
    });
    return api;
  }

  createTodoResolver(
    scope: Construct,
    props: AppsyncStackProps,
    api: awsAppsync.IGraphqlApi
  ) {
    const createTodoResolver = api
      .addLambdaDataSource("Create Todo Data Source", props.createTodoFunc)
      .createResolver("CreateTodoLambdaResolver", {
        typeName: "Mutation",
        fieldName: "createTodo",
      });
  }

  listTodosResolver(
    scope: Construct,
    props: AppsyncStackProps,
    api: awsAppsync.IGraphqlApi
  ) {
    const listTodosResolver = api
      .addLambdaDataSource("List Todos Data Source", props.listTodosFunc)
      .createResolver("ListTodosLambdaResolver", {
        typeName: "Query",
        fieldName: "listTodos",
      });
  }
  deleteTodoResolver(
    scope: Construct,
    props: AppsyncStackProps,
    api: awsAppsync.IGraphqlApi
  ) {
    const deleteTodoResolver = api
      .addLambdaDataSource("Delete Todo Data Source", props.deleteTodoFunc)
      .createResolver("DeleteTodoLambdaResolver", {
        typeName: "Mutation",
        fieldName: "deleteTodo",
      });
  }
  updateTodoResolver(
    scope: Construct,
    props: AppsyncStackProps,
    api: awsAppsync.IGraphqlApi
  ) {
    const updateTodoResolver = api
      .addLambdaDataSource("Update Todo Data Source", props.updateTodoFunc)
      .createResolver("UpdateTodoLambdaResolver", {
        typeName: "Mutation",
        fieldName: "updateTodo",
      });
  }
}
