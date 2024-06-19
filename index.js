// TASK: import helper functions from utils
import { getTasks, createNewTask, patchTask, putTask, deleteTask } from './utils/taskFunctions.js';
// TASK: import initialData
import {initialData} from './initialData.js'


/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}
initializeData();
// TASK: Get elements from the DOM
const elements = {
    // Collection of column div elements
  columnDivs: document.querySelectorAll('.column-div'),
    // Modal window for editing tasks
  editTaskModal: document.querySelector('.edit-task-modal-window'),
   // Modal window for creating a new task
  modalWindow: document.getElementById('new-task-modal-window'),
   // Header element displaying the board name
  headerBoardName: document.getElementById('header-board-name'),
  // Button to show the sidebar
  showSideBarBtn:document.getElementById('show-side-bar-btn'),
  // Button to hide the sidebar
  hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
    // Container for filtering options
  filterDiv: document.getElementById('filterDiv'),
   // Switch element for changing the theme
  themeSwitch: document.getElementById('switch'),
    // Button to add a new task
  addNewTaskBtn: document.getElementById('add-new-task-btn')
  
 
};

let activeBoard = "";

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = localStorageBoard ? localStorageBoard :  boards[0]; 
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener("click",() => { 
      if(elements && elements.headerBoardName){
      elements.headerBoardName.textContent = board;
    }
      filterAndDisplayTasksByBoard(board);
      activeBoard = board; //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard);
    });
    boardsContainer.appendChild(boardElement);
  });

}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener('click',() => { 
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}


function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { 
    
    if(btn.textContent === boardName) {
      btn.classList.add('active');
    }
    else {
      btn.remove('active'); 
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector('.column-div[data-status="${task.status}"]'); 
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  
  tasksContainer.appendChild(taskElement); 
}



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener('click',() => toggleModal(false, elements.editTaskModal));

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click',() => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click',() => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.addNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit',  (event) => {
    addTask(event);
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none'; 
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 

  //Assign user input to the task object
    const task = {
      title: document.getElementById('title-input').value,
      description: document.getElementById('desc-input').value,
      status: document.getElementById('select-status').value,
      board: activeBoard,
      
    };
    if(
      task.title.trim() === ''||
      task.description.trim() === ''||
      task.status.trim() === ''
    ) {alert('Fill in the missing fields');
      return;
    }

    const newTask = createNewTask(task);
    if (newTask) {
      addTaskToUI(newTask);
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
      event.target.reset();
      refreshTasksUI();
    }
}


function toggleSidebar(show) {
  const sidebar = document.getElementById('side-bar');
  sidebar.style.display = show ? 'block' : 'none';
  elements.showSideBarBtn.style.display = show ?'none':'block';
  localStorage.setItem('showSideBar', show); 
 
}

function toggleTheme(show) {
  const isLightTheme =
  show === 'enabled' ||
  show === true ||
  elements.themeSwitch.checked === true;
  document.body.classList.toggle('light-theme', isLightTheme);
  const loadedLogo = elements.logo.src.split('/').pop(),
  getLogo = loadedLogo.replace(
    isLightTheme ? 'logo-dark.svg' : 'logo-light.svg',
    isLightTheme ? 'logo-light.svg' :'logo-dark.svg'
  );
  elements.logo.src = elements.logo.src.replace(loadLogo, getLogo);
  localStorage.setItem('light-theme', isLightTheme ? 'enabled' : 'disabled'); 
 
}



function openEditTaskModal(task) {
  // Set task details in modal inputs
  const editTaskTitleInput = document.getElementById('edit-task-title-input'),
  editTaskDescInput = document.getElementById('edit-task-desc-input'),
  editSelectStatus = document.getElementById('edit-select-status');

  editTaskTitleInput.value = task.title;
  editTaskDescInput.value = task.description;
  const SelectStatus = editSelectStatus.querySelector(
    `option[value= ${task.status}]`
  );
  SelectStatus.selected = true;
  toggleModal(true, elements.editTaskModal);
  

  // Get button elements from the task modal.
  const saveTaskBtn = document.getElementById('save-task-changes-btn'),
  deleteTaskBtn = document.getElementById('delete-task-btn');



  // Call saveTaskChanges upon click of Save Changes button
  saveTaskBtn.addEventListener('click', (event) =>{
    event.preventDefault();
    saveTaskChanges(task.id);
  });

 

  // Delete task using a helper function and close the task modal
  deleteTaskBtn.addEventListener('click', (event)=>{
    event.preventDefault();
    deleteTask(task.id);
    toggleModal(false, elements.editTaskModal);
    refreshTasksUI();
  });



  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}

function saveTaskChanges(taskId) {
  // Get new user inputs
  const editSelectStatus = document.getElementById('edit-select-status').value;
  const editTaskTitleInput = document.getElementById('edit-task-title-input').value;
  const editTaskDescInput = document.getElementById('edit-task-desc-input').value;
  

  // Create an object with the updated task details
  const updatedTaskDetails = {
    id: taskId,
    status: editSelectStatus,
    title: editTaskTitleInput,
    description: editTaskDescInput,
    board: activeBoard,
  };


  // Update task using a hlper functoin
  putTask(taskId, updatedTaskDetails);
 

  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal);

  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  initializeData();
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  elements.showSideBarBtn.style.display = showSidebar? 'block' : 'none';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}