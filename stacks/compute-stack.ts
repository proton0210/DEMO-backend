import * as cdk from "aws-cdk-lib";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import path = require("path");
interface computeStackProps extends cdk.StackProps {
  usersTable: Table;
  todosTable: Table;
}

export class ComputeStack extends cdk.Stack {
  public readonly addUserToTableFunc: NodejsFunction;

  // APPSYNC RESOLVER FUNCTIONS

  public readonly createTodoFunc: NodejsFunction;
  public readonly listTodosFunc: NodejsFunction;
  public readonly deleteTodo: NodejsFunction;
  public readonly updateTodo: NodejsFunction;

  constructor(scope: Construct, id: string, props: computeStackProps) {
    super(scope, id, props);
    this.addUserToTableFunc = this.addUserToUsersTable(props);

    this.createTodoFunc = this.createTodoFunction(props);
    this.listTodosFunc = this.listTodosFunction(props);
    this.deleteTodo = this.deleteTodoFunction(props);
    this.updateTodo = this.updateTodoFunction(props);
  }

  addUserToUsersTable(props: computeStackProps) {
    const func = new NodejsFunction(this, "adduserFunc", {
      functionName: "addUserFunc",
      runtime: Runtime.NODEJS_20_X,
      handler: "handler",
      entry: path.join(
        __dirname,
        "../functions/AddUserPostConfirmation/index.ts"
      ),
    });
    func.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["dynamodb:PutItem"],
        resources: [props.usersTable.tableArn as string],
      })
    );
    return func;
  }

  createTodoFunction(props: computeStackProps) {
    const createTodoFunc = new NodejsFunction(this, "createTodoFunc", {
      functionName: "createTodoFunc",
      runtime: Runtime.NODEJS_20_X,
      handler: "handler",
      entry: path.join(__dirname, "../AppSyncFunctions/createTodo/index.ts"),
    });

    createTodoFunc.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["dynamodb:PutItem"],
        resources: [props.todosTable.tableArn],
      })
    );

    return createTodoFunc;
  }

  listTodosFunction(props: computeStackProps) {
    const listTodosFunc = new NodejsFunction(this, "listTodosFunc", {
      functionName: "listTodosFunc",
      runtime: Runtime.NODEJS_20_X,
      handler: "handler",
      entry: path.join(__dirname, "../AppSyncFunctions/listTodo/index.ts"),
    });

    listTodosFunc.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["dynamodb:Query"],
        resources: [props.todosTable.tableArn],
      })
    );

    return listTodosFunc;
  }
  deleteTodoFunction(props: computeStackProps) {
    const deleteTodoFunc = new NodejsFunction(this, "deleteTodoFunc", {
      functionName: "deleteTodoFunc",
      runtime: Runtime.NODEJS_20_X,
      handler: "handler",
      entry: path.join(__dirname, "../AppSyncFunctions/deleteTodo/index.ts"),
    });

    deleteTodoFunc.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["dynamodb:DeleteItem", "dynamodb:Query"],
        resources: [
          props.todosTable.tableArn,
          props.todosTable.tableArn + "/index/getTodoId",
        ],
      })
    );

    return deleteTodoFunc;
  }
  updateTodoFunction(props: computeStackProps) {
    const updateTodoFunc = new NodejsFunction(this, "updateTodoFunc", {
      functionName: "updateTodoFunc",
      runtime: Runtime.NODEJS_20_X,
      handler: "handler",
      entry: path.join(__dirname, "../AppSyncFunctions/UpdateTodo/index.ts"),
    });

    updateTodoFunc.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["dynamodb:UpdateItem", "dynamodb:Query"],
        resources: [
          props.todosTable.tableArn,
          props.todosTable.tableArn + "/index/getTodoId",
        ],
      })
    );

    return updateTodoFunc;
  }
}
