using System;
using System.IO;
using System.Collections.Generic;
using System.Text.Json;
using ToDoAPI.Models;
using System.Linq;
using System.Data.SqlClient;
using System.Text;

public class DataService : IDataService
{
	public string ConnectionString { get; set; }

	public DataService() => ConnectionString = "";

	public Guid Add(ToDo toDo)
	{
		Guid guid = Guid.NewGuid();
		string queryString = $"INSERT INTO ToDos (Id, Name, IsComplete, Priority) VALUES ('{guid}', '{toDo.Name}', '0', {Get().Count()+1});";
       
        using (SqlConnection connection = new SqlConnection(ConnectionString))
        {
            SqlCommand command = new SqlCommand(queryString, connection);
            command.Connection.Open();
            command.ExecuteNonQuery();
        }
		return guid;
	}

	public IEnumerable<ToDo> Get()
	{
		List<ToDo> data = new List<ToDo>();
		string queryString = $"SELECT * FROM ToDos ORDER BY Priority;";
       
        using(var conn = new SqlConnection(ConnectionString))
		{
			using(var cmd = new SqlCommand(queryString, conn))
			{
				conn.Open();
				var reader = cmd.ExecuteReader();

				if (!reader.HasRows) return data;
				else
				{
					while (reader.Read())
					{
						Guid guid = Guid.Parse(reader.GetValue(0).ToString());
						String name = reader.GetValue(1).ToString();
						bool isComplete = Convert.ToBoolean(reader.GetValue(2).ToString());
						int priority = Convert.ToInt32(reader.GetValue(3).ToString());
						data.Add(new ToDo() {Id=guid, Name=name, IsComplete=isComplete, Priority=priority});
					}
				}
			}
		}
        return data;
	}

	public void Reorder(ToDo toDo, int direction)
	{
		//Move up in priority
		if(direction > 0) 
		{
			Remove(toDo);
			toDo.Priority += 1;
			Add(toDo);
		}
	}

	public void Remove(ToDo toDo)
	{
		string queryString = $"DELETE FROM ToDos WHERE Id='{toDo.Id}';";
		using (SqlConnection connection = new SqlConnection(ConnectionString))
        {
            SqlCommand command = new SqlCommand(queryString, connection);
            command.Connection.Open();
            command.ExecuteNonQuery();
        }
	}

	public void Update(ToDo toDo)
	{
		Remove(toDo);
		string queryString = $"INSERT INTO ToDos (Id, Name, IsComplete, Priority) VALUES ('{toDo.Id}', '{toDo.Name}', '{toDo.IsComplete}', '{toDo.Priority}');";
       
        using (SqlConnection connection = new SqlConnection(ConnectionString))
        {
            SqlCommand command = new SqlCommand(queryString, connection);
            command.Connection.Open();
            command.ExecuteNonQuery();
        }
	}
}