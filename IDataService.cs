using System;
using System.Collections.Generic;
using ToDoAPI.Models;

public interface IDataService
{
	public Guid Add(ToDo toDo);

	public IEnumerable<ToDo> Get();

	public void Remove(ToDo toDo);

	public void Update(ToDo toDo);

	public void Reorder(ToDo toDo, int direction);

}