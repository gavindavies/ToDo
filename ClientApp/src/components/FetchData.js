import React, { Component } from 'react';
import { conditionallyUpdateScrollbar } from 'reactstrap/lib/utils';

export class FetchData extends Component {
  static displayName = FetchData.name;

  constructor(props) {
    super(props);
    this.state = { todos: [], loading: true };
    this.deleteToDo = this.deleteToDo.bind(this);
    this.addToDo = this.addToDo.bind(this);
  }

  componentDidMount() {
    this.populateWeatherData();
  }

  render() {
    let contents = this.state.loading
      ? 
      <p><em>Loading...</em></p>
      :
      <div>
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
              <td><input type="checkbox" checked={todo.isComplete} onClick={() => {}} onChange={()=>{this.updateToDo(todo.id, !todo.isComplete)}}style={{transform:'scale(1.8)', marginLeft:'10px'}}></input></td>
              <td>{todo.priority}</td>
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

  async populateWeatherData() {
    const response = await fetch('api/todo');
    const data = await response.json();
    this.setState({ todos: data, loading: false });
  }

  async deleteToDo(guid) {
    await fetch('api/todo/' + guid, {method: 'DELETE'});
    await this.populateWeatherData();
  }

  async updateToDo(guid, isComplete) {
    
    const item = [{
      "value": isComplete,
      "path": "/IsComplete",
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

  async addToDo() {
    const addNameTextbox = document.getElementById('nameToDo');
    const item = {
      IsComplete: false,
      Name: addNameTextbox.value.toString()
    };
  
    await fetch('api/todo', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(item)
    })
    addNameTextbox.value = '';
    await this.populateWeatherData();
  }
}

