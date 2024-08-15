document.addEventListener("DOMContentLoaded", function () {
  window.app = new Vue({
    el: "#calculator",
    data: {
      result: "",
      hasResult: false,
    },
    methods: {
      insert(value) {
        if (this.hasResult) {
          this.reset();
        }
        const lastChar = this.result.slice(-1);
        const operators = ["+", "-", "*", "/"];
        if (operators.includes(value)) {
            if (this.result === "") {
                return;
            }
          if (operators.includes(lastChar)) {
            this.result = this.result.slice(0, -1) + value;
          } else {
            this.result += value;
          }
        } else if (value === ".") {
          if (
            lastChar === "." ||
            this.result
              .split(/[+\-*/]/)
              .slice(-1)[0]
              .includes(".")
          ) {
            return;
          }
          this.result += value;
        } else {
          this.result += value;
          // console.log(value);
        }
      },
      calc() {
        if (
          this.result === "" ||
          ["+", "-", "*", "/"].includes(this.result.slice(-1))
        ) {
          return;
        }
        try {
          this.result = eval(this.result).toString();
          this.hasResult = true;
        } catch (error) {
          this.result = "Error";
        }
      },
      reset() {
        this.result = "";
        this.hasResult = false;
      },
    },
  });

  addEventListener("keydown", function (e) {
    const key = e.key;
    const operators = ["+", "-", "*", "/"];
    const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    if (numbers.includes(key)) {
      app.insert(key);
    } else if (operators.includes(key)) {
      app.insert(key);
    }else 
    if (key === "Enter" || key === "=") {
      app.calc();
    } else if (key === ".") {
      app.insert(key);
    } else if (key === "Backspace") {
      app.reset();
    }
    console.log(key);
  });
});
