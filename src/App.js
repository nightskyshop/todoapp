import axios from 'axios';
import { useEffect, useState } from 'react';
import "./App.module.css";
import styles from "./App.module.css";

function App() {
  const [data, setData] = useState({
    todoList: [],
    activeItem: {
      id: null,
      title: '',
      completed: false,
    },
    editing: false,
  });

  const getCookie = (name) => {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
  }

  const fetchTask = () => {
    axios.get("https://todoappapi.pythonanywhere.com/api/task-list/")
    .then(function (response) {
      setData({
        todoList: [...response.data],
        activeItem: {
          id: null,
          title: '',
          completed: false,
        },
        editing: false,
      });
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  useEffect(fetchTask, []);

  const handleChange = (event) => {
    const { target: {value} } = event;

    setData({
        todoList: data.todoList,
        activeItem: {
          ...data.activeItem,
          title: value
        },
        editing: data.editing,
      })
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    const csrftoken = getCookie('csrftoken');
    let url = "https://todoappapi.pythonanywhere.com/api/task-create/";

    if (data.editing === true) {
      url = `https://todoappapi.pythonanywhere.com/api/task-update/${data.activeItem.id}`;
      setData({
        todoList: data.todoList,
        activeItem: data.activeItem,
        editing: false
      });
    }

    axios.post(url, JSON.stringify(data.activeItem), {
      headers: {
        'Content-type': 'application/json',
        'X-CSRFToken': csrftoken
      }
    })
      .then(function (response) {
        fetchTask();
        setData({
          todoList: [],
          activeItem: {
            id: null,
            title: '',
            completed: false,
          },
          editing: false
        })
      })
      .catch(function (error) {
        console.log(error);
      });
    
    event.target.value = "";
  }

  const startEdit = (task) => {
    setData({
      todoList: data.todoList,
      activeItem: task,
      editing: true,
    })
  }

  const deleteItem = (task) => {
    const csrftoken = getCookie('csrftoken');

    axios.delete(`https://todoappapi.pythonanywhere.com/api/task-delete/${task.id}`, JSON.stringify(data.activeItem), {
      headers: {
        'Content-type': 'application/json',
        'X-CSRFToken': csrftoken
      }
    })
      .then(function (response) {
        fetchTask();
      })
  }

  const toggleStrike = (task) => {
    task.completed = !task.completed;

    const csrftoken = getCookie('csrftoken');
    const url = `https://todoappapi.pythonanywhere.com/api/task-update/${task.id}`;
    
    axios.post(url, JSON.stringify(task), {
      headers: {
        'Content-type': 'application/json',
        'X-CSRFToken': csrftoken
      }
    })
      .then(function (response) {
        fetchTask();
      })
  }

  return (
    // <div>
    //   {data.map((d) => (
    //     <div key={d.id}>
    //       <h1>{d.title}</h1>
    //     </div>
    //   ))}
    //
    // </div>
    <div className="container">
      <div id={styles.task_container}>
        <div id={styles.form_wrapper}>
          <form id="form" onSubmit={handleSubmit}>
            <div className={styles.flex_wrapper}>
              <div style={{flex: 6}}>
                <input
                  id="title"
                  className={styles.form_control}
                  onChange={handleChange}
                  type="text"
                  name="title"
                  placeholder="Add task"
                  value={data.activeItem.title}
                />
              </div>
              <div style={{flex: 1}}>
                <input id={styles.submit} className={styles.btn} type="submit" value="Submit" />
              </div>
            </div>
          </form>
        </div>

        <div id="list_wrapper">
          {data.todoList.map((task, index) => (
            <div id={styles[`data-row-${index}`]} className={`${styles.task_wrapper} ${styles.flex_wrapper}`} key={task.id}>
              <div onClick={() => toggleStrike(task)} style={{flex:7,}}>
                <span>{index + 1}. </span>
                {task.completed ? (
                  <strike>{task.title}</strike>
                ) : (
                  <span>{task.title}</span>
                ) }
              </div>
              <div style={{flex:1,}}>
                <button onClick={() => startEdit(task)} className="btn btn-sm btn-outline-info edit">Edit </button>
              </div>
              <div style={{flex:1,}}>
                <button onClick={() => deleteItem(task)} className="btn btn-sm btn-outline-dark delete">-</button>
              </div>
            </div>
          ))}
        </div>	
      </div>
    </div>
    
  );
}

export default App;
