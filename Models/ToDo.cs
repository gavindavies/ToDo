using System;

namespace ToDoAPI.Models
{
	public class ToDo
	{
		public Guid Id { get; set; }
		public string Name { get; set; }
		public bool IsComplete { get; set; }
		public int Priority { get; set; }

	}
}