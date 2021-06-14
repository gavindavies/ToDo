import React, { Component } from 'react';
import * as authy from './authPopup.js';

export class FetchData extends Component {
  static displayName = FetchData.name;

  constructor(props) {
    super(props);
    this.state = { todos: [], loading: true, user: ""};
    this.deleteToDo = this.deleteToDo.bind(this);
    this.addToDo = this.addToDo.bind(this);
  }

  async componentDidMount() {
    //auth.selectAccount();
    //var response = await auth.signIn();
    
    //console.log(response.account.name);
    //console.log('Component did mount with token: ' + response.accessToken);
    
    //this.populateWeatherData(response.accessToken);
    //this.setState({user: response.account.name, token: response.accessToken});
    //var token = await auth.passTokenToApi();
    //console.log('fetch;' + token);
    //var response = await authy.callApi("GET", "api/todo");
    //const data = await response.json();
    //this.setState({ todos: data, loading: false});
    //console.log(data);

    this.populateWeatherData();
  }

  render() {
    let contents = this.state.loading
      ? 
      <p><em>Loading...</em></p>
      :
      <div>
        <br></br>
        <strong>Hello, {this.state.user}.</strong>
        <br></br>
        <br></br>
      <table className='table table-striped' aria-labelledby="tabelLabel">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Complete</th>
            <th>Priority</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {this.state.todos.map(todo =>
            <tr key={ todo.id }>
              <td><strong>{todo.id}</strong></td>
              <td>{todo.name}</td>
              <td><input type="checkbox" checked={todo.isComplete} onClick={() => {}} onChange={()=>{this.updateToDo(todo.id, !todo.isComplete)}} style={{transform:'scale(1.8)', marginLeft:'10px'}}></input></td>
              <td><button onClick={() => this.updatePriority(todo.id, todo.priority+1)}>-</button></td>
              <td>{todo.priority}</td>
              <td><button onClick={() => this.updatePriority(todo.id, todo.priority-1)}>+</button></td>
              <td><button onClick={() => this.deleteToDo(todo.id)}>Delete</button></td>
            </tr>
          )}
        </tbody>
      </table>
      <input id='nameToDo' type="text" style={{marginRight:'10px'}}></input>
      <button onClick={() => this.addToDo()}>Add +</button>
      </div>

    return (
      <div>
        {contents}
      </div>
    );
  }

  async updatePriority(guid, priority) {
    
    const item = [{
      "value": priority,
      "path": "/Priority",
      "op": "replace"
    }];
  
    await fetch('api/todo/'+guid, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json-patch+json'
      },
      body: JSON.stringify(item)
    })
    await this.populateWeatherData();
  }

  async populateWeatherData() {

    var token = await authy.passTokenToApi();

    var headers = new Headers();
    var bearer = "Bearer " + token;
    headers.append("Authorization", bearer);
    var options = {
              method: "GET",
              headers: headers
    };

    const response = await fetch('api/todo', options);
    const data = await response.json();
    this.setState({ todos: data, loading: false});
  }

  async deleteToDo(guid) {
    await fetch('api/todo/' + guid, {method: 'DELETE'});
    await this.populateWeatherData();
  }

  async updateToDo(guid, isComplete, token) {
    
    const item = [{
      "value": isComplete,
      "path": "/IsComplete",
      "op": "replace"
    }];
  
    await fetch('api/todo/'+guid, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json-patch+json',
        'Authorization': 'Bearer '+token
      },
      body: JSON.stringify(item)
    })
    await this.populateWeatherData();
  }

  async addToDo() {
    
    const addNameTextbox = document.getElementById('nameToDo');
    
    const item = {
      IsComplete: false,
      Name: addNameTextbox.value.toString()
    };
  
    await authy.addItem(item);

    addNameTextbox.value = '';

    this.populateWeatherData();
  }
}