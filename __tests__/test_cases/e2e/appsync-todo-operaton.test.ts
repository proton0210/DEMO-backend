import Chance from "chance";
import * as given from "../../steps/given";
import * as then from "../../steps/then";
import * as when from "../../steps/when";
const chance = new Chance();
describe("When user Creates a todo ", () => {
  let user: any = null;
  beforeAll(async () => {
    user = (await given.an_authenticated_user()) as any;
  });

  it("UserID and title should be saved in Todos Table", async () => {
    const title = chance.sentence({ words: 5 });
    console.log("title: ", title);
    const todoData = {
      UserID: user.username,
      title: title,
    };
    const createTodoResponse = await when.user_creates_a_todo(user, todoData);

    const todoId = createTodoResponse.TodoID;
    console.log("todoId: ", todoId);

    const ddbUser = await then.todo_exists_in_TodosTable(user.username, todoId);
    console.log("ddbUser: ", ddbUser);

    expect(ddbUser.UserID).toMatch(todoData.UserID);
    expect(ddbUser.title).toMatch(todoData.title);
  });

  it("User can list his/her todos", async () => {
    const title = chance.sentence({ words: 5 });
    console.log("title: ", title);
    const todoData = {
      UserID: user.username,
      title: title,
    };
    const createTodoResponse = await when.user_creates_a_todo(user, todoData);

    const todoId = createTodoResponse.TodoID;
    console.log("todoId: ", todoId);

    const todos = await when.user_calls_listTodos(user);
    console.log("todos: ", todos);

    expect(todos.length).toEqual(2);
  });

  it("user can delete his/her todo", async () => {
    const title = chance.sentence({ words: 5 });
    console.log("title: ", title);
    const todoData = {
      UserID: user.username,
      title: title,
    };
    const createTodoResponse = await when.user_creates_a_todo(user, todoData);

    const todoId = createTodoResponse.TodoID;
    console.log("todoId: ", todoId);

    const deleteTodoResponse = await when.user_calls_deleteTodo(
      user,
      todoData.title
    );
    console.log("deleteTodoResponse: ", deleteTodoResponse);

    const todos = await when.user_calls_listTodos(user);
    console.log("todos: ", todos);

    expect(todos.length).toEqual(2);
  });

  it("User Completes his/her todo", async () => {
    const title = chance.sentence({ words: 5 });
    console.log("title: ", title);
    const todoData = {
      UserID: user.username,
      title: title,
    };
    const createTodoResponse = await when.user_creates_a_todo(user, todoData);

    const todoId = createTodoResponse.TodoID;
    console.log("todoId: ", todoId);

    const updateTodoResponce = await when.user_calls_updateTodo(
      user,
      todoData.title
    );
    console.log("updateTodoResponce: ", updateTodoResponce);
    expect(updateTodoResponce).toEqual(true);
  });
});
