using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ToDoAPI.Models;

using System.Text.Json;
using System.Text.Json.Serialization;
using System.IO;
using Microsoft.AspNetCore.JsonPatch;

namespace ToDoAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ToDoController : ControllerBase
    {
        private readonly ILogger<ToDoController> _logger;
        private IDataService _DataService;
        public ToDoController(ILogger<ToDoController> logger, IDataService dataService)
        {
            _logger = logger;
            _DataService = dataService;
        }

        [HttpGet("{guid}")]
        public IEnumerable<ToDo> Get(Guid guid) => _DataService.Get().Where(x => x.Id == guid);

        [HttpGet]
        public IEnumerable<ToDo> Get() => _DataService.Get();

        [HttpPost]
        public ActionResult<ToDo> Post(ToDo toDo)
        {
            var guid = _DataService.Add(toDo);
            return Created(guid.ToString(), toDo);
        }

        [HttpDelete("{guid}")]
        public ActionResult Delete(Guid guid)
        {
            ToDo toDo = _DataService.Get().Where(x => x.Id == guid).FirstOrDefault();
            if (toDo != null) 
            {
                _DataService.Remove(toDo);
                return Ok();
            }
            else return NotFound();
        }

        [HttpPatch("{guid}")]
        public IActionResult Update([FromBody] JsonPatchDocument<ToDo> patchDocument, Guid guid)
        {
            ToDo todo = _DataService.Get().Where(x => x.Id == guid).FirstOrDefault();
            patchDocument.ApplyTo(todo);
            _DataService.Update(todo);
            return new ObjectResult(todo);
        }
    }
}