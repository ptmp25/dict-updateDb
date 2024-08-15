//reference: https://www.geeksforgeeks.org/build-a-todo-list-app-using-vuejs/
const app = new Vue({
  el: "#vue_app",
  data: {
    userInput: "", //content of user input
    list: [
      //get from database
    ],
    idDuplicated: false,
    categorical: "",
  },
  mounted: function () {
    //this function is called after all DOM elements rendered in HTML page
    this.$nextTick(function () {
      this.fetchList();
    });
  },
  methods: {
    async fetchList() {
      const response = await fetch("http://localhost:3000/todo/read_list");
      var response_json = await response.json();
      // console.log(response_json);
      this.list = response_json["data"];
    },
    save_new_item(newItem) {
      //send data to Nodejs
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      };
      fetch("http://localhost:3000/todo/create_new", requestOptions)
        .then(async (response) => {
          const data = await response.json();
          console.log(data);
          // check for error response
          if (data.result !== "OK" || !response) {
            // get error message from body or default to response status
            const error = (data && data.message) || response.status;
            if (data.err.code === 11000) {
              this.idDuplicated = true;
              console.log("Duplicated ID");
            }
            return Promise.reject(error);
          } else {
            this.idDuplicated = false;
            this.list.push(newItem); //put it in the list
            console.log(newItem);
            this.postId = data.id;
            this.userInput = ""; //clear what user input
            this.categorical = "";
          }
        })
        .catch((error) => {
          this.errorMessage = error;
          console.error("There was an error!", error);
        });
    },
    addItem() { //Phan Thi Mai Phuong
      if (this.userInput.trim() !== "") {
        const newItem = {
          id: generate_random_uuid(),
          title: this.userInput.trim(),
          is_active: true,
          categorical: this.categorical.trim(),
        };
        this.save_new_item(newItem);
      } else {
        alert("Please input a todo item");
      }
    },
    deleteItem(index) {
      if (confirm("Are you sure you want to delete this item?")) {
        // console.log(this.list[index].id);
        // Code to delete the item
        fetch("http://localhost:3000/todo/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: this.list[index].id,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            this.list.splice(index, 1); //remove 1 item at this position
            console.log("Success:", data);
          })
          .catch((error) => {
            this.errorMessage = error;
            console.error("There was an error!", error);
          });
      }
    },
    editItem(index) {
      const editedTodo = prompt("Edit the todo:"); //display a popup to input new title
      if (editedTodo !== null && editedTodo.trim() !== "") {
        this.list[index].title = editedTodo.trim();
      }
      fetch("http://localhost:3000/todo/update_me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: this.list[index].id,
          title: editedTodo.trim(),
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Success:", data);
        })
        .catch((error) => {
          this.errorMessage = error;
          console.error("There was an error!", error);
        });
    },
    deactivateItem(index) {
      if (confirm("Are you sure you want to delete this item?")) {
        fetch("http://localhost:3000/todo/deactive", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: this.list[index].id,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Success:", data);
            this.list[index].is_active = false;
          })
          .catch((error) => {
            this.errorMessage = error;
            console.error("There was an error!", error);
          });
      }
    },
  },
});
